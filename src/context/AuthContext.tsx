import { createContext, useContext, useEffect, useState } from 'react';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '@/config/authConfig';
import { apiClient, authService } from '@/services/api';

// Crear instancia de MSAL
const msalInstance = new PublicClientApplication(msalConfig);

interface UserData {
  id_usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  foto_url: string | null;
  id_rol: string | null;
  userType?: 'cliente' | 'profesional' | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: AccountInfo | UserData | null;
  accessToken: string | null;
  login: () => Promise<void>;
  loginWithCredentials: (correo: string, clave: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  needsOnboarding: boolean;
  updateUserData: (userData: UserData) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AccountInfo | UserData | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // Inicializar MSAL al montar el componente
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        // Verificar si hay sesión guardada en localStorage (login tradicional)
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }

        // Inicializar MSAL para Azure AD
        await msalInstance.initialize();

        // Verificar si hay una cuenta activa de Azure AD
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          // Obtener token de acceso de forma silenciosa
          try {
            const response = await msalInstance.acquireTokenSilent({
              ...loginRequest,
              account: accounts[0],
            });

            // Establecer token en el estado y en el API client
            setAccessToken(response.accessToken);
            apiClient.setAuthToken(response.accessToken);

            // Sincronizar con el backend para obtener datos completos del usuario
            try {
              const syncResponse: any = await authService.azureSync(
                accounts[0].username,
                accounts[0].name || '',
                response.accessToken
              );

              if (syncResponse.success) {
                // Usuario existe o fue creado
                const userData: UserData = {
                  id_usuario: syncResponse.id_usuario,
                  nombre: syncResponse.nombre,
                  apellido: syncResponse.apellido,
                  correo: syncResponse.correo,
                  foto_url: syncResponse.foto_url,
                  id_rol: syncResponse.id_rol,
                };

                setUser(userData);
                setIsAuthenticated(true);

                // Verificar si necesita onboarding basado en el campo onboarded
                const needsOnboard = syncResponse.onboarded === false;
                setNeedsOnboarding(needsOnboard);
              } else {
                // Error en sincronización - necesita onboarding
                setUser(accounts[0]);
                setIsAuthenticated(true);
                setNeedsOnboarding(true);
              }
            } catch (syncError) {
              console.error('❌ Error al sincronizar en init:', syncError);
              // En caso de error, mantener sesión de Azure AD pero marcar que necesita onboarding
              setUser(accounts[0]);
              setIsAuthenticated(true);
              setNeedsOnboarding(true);
            }
          } catch (error) {
            console.error('⚠️ Error al obtener token silenciosamente:', error);
            // Si falla la renovación silenciosa, limpiar la sesión
            setUser(null);
            setIsAuthenticated(false);
            setAccessToken(null);
          }
        }
      } catch (error) {
        console.error('❌ Error al inicializar MSAL:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeMsal();
  }, []);

  /**
   * Login con credenciales tradicionales (correo y contraseña)
   */
  const loginWithCredentials = async (correo: string, clave: string) => {
    try {
      setLoading(true);
      const response: any = await authService.login(correo, clave);

      if (response.success) {
        const userData: UserData = {
          id_usuario: response.id_usuario,
          nombre: response.nombre,
          apellido: response.apellido,
          correo: response.correo,
          foto_url: response.foto_url,
          id_rol: response.id_rol,
        };

        setUser(userData);
        setIsAuthenticated(true);

        // Guardar sesión en localStorage
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        throw new Error(response.message || 'Credenciales inválidas');
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Login con Azure AD (Popup)
   */
  const login = async () => {
    try {
      setLoading(true);
      const loginResponse = await msalInstance.loginPopup(loginRequest);

      if (loginResponse.account) {
        setAccessToken(loginResponse.accessToken);
        apiClient.setAuthToken(loginResponse.accessToken);

        // Sincronizar con el backend para obtener/crear el perfil del usuario
        try {
          const syncResponse: any = await authService.azureSync(
            loginResponse.account.username,
            loginResponse.account.name || '',
            loginResponse.accessToken
          );

          if (syncResponse.success) {
            // Usuario existe o fue creado
            const userData: UserData = {
              id_usuario: syncResponse.id_usuario,
              nombre: syncResponse.nombre,
              apellido: syncResponse.apellido,
              correo: syncResponse.correo,
              foto_url: syncResponse.foto_url,
              id_rol: syncResponse.id_rol,
            };

            setUser(userData);
            setIsAuthenticated(true);

            // Verificar si necesita onboarding basado en el campo onboarded
            const needsOnboard = syncResponse.onboarded === false;
            setNeedsOnboarding(needsOnboard);
          } else {
            // Error en sincronización - necesita onboarding
            setUser(loginResponse.account);
            setIsAuthenticated(true);
            setNeedsOnboarding(true);
          }
        } catch (syncError) {
          console.error('❌ Error al sincronizar con BD:', syncError);
          // En caso de error, mantener sesión de Azure AD pero marcar que necesita onboarding
          setUser(loginResponse.account);
          setIsAuthenticated(true);
          setNeedsOnboarding(true);
        }
      }
    } catch (error) {
      console.error('❌ Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      setLoading(true);

      // Limpiar sesión de localStorage
      localStorage.removeItem('user');

      // Intentar logout de Azure AD si existe sesión activa
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        await msalInstance.logoutPopup();
      }

      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);

      // Limpiar el token del API client
      apiClient.clearAuthToken();
    } catch (error) {
      console.error('❌ Error en logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar datos del usuario después de completar onboarding
   */
  const updateUserData = (userData: UserData) => {
    setUser(userData);
    setNeedsOnboarding(false);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        accessToken,
        login,
        loginWithCredentials,
        logout,
        loading,
        needsOnboarding,
        updateUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para usar el contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
