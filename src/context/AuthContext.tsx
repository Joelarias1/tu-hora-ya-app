import { createContext, useContext, useEffect, useState } from 'react';
import { PublicClientApplication, AccountInfo } from '@azure/msal-browser';
import { msalConfig, loginRequest } from '@/config/authConfig';
import { apiClient } from '@/services/api';

// Crear instancia de MSAL
const msalInstance = new PublicClientApplication(msalConfig);

interface AuthContextType {
  isAuthenticated: boolean;
  user: AccountInfo | null;
  accessToken: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AccountInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Inicializar MSAL al montar el componente
  useEffect(() => {
    const initializeMsal = async () => {
      try {
        await msalInstance.initialize();

        // Verificar si hay una cuenta activa
        const accounts = msalInstance.getAllAccounts();
        if (accounts.length > 0) {
          setUser(accounts[0]);
          setIsAuthenticated(true);

          // Obtener token de acceso
          try {
            const response = await msalInstance.acquireTokenSilent({
              ...loginRequest,
              account: accounts[0],
            });
            setAccessToken(response.accessToken);
            apiClient.setAuthToken(response.accessToken);
          } catch (error) {
            console.error('Error al obtener token:', error);
          }
        }
      } catch (error) {
        console.error('Error al inicializar MSAL:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeMsal();
  }, []);

  /**
   * Login con Azure AD (Popup)
   */
  const login = async () => {
    try {
      setLoading(true);
      const loginResponse = await msalInstance.loginPopup(loginRequest);

      if (loginResponse.account) {
        setUser(loginResponse.account);
        setAccessToken(loginResponse.accessToken);
        setIsAuthenticated(true);

        // Configurar el token en el API client
        apiClient.setAuthToken(loginResponse.accessToken);

        console.log('✅ Login exitoso:', loginResponse.account.username);
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
      await msalInstance.logoutPopup();

      setUser(null);
      setAccessToken(null);
      setIsAuthenticated(false);

      // Limpiar el token del API client
      apiClient.clearAuthToken();

      console.log('✅ Logout exitoso');
    } catch (error) {
      console.error('❌ Error en logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        accessToken,
        login,
        logout,
        loading,
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
