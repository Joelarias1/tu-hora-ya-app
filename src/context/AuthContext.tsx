import { createContext, useContext, useEffect, useState } from "react";
import { PublicClientApplication, AccountInfo } from "@azure/msal-browser";
import { msalConfig, loginRequest } from "@/config/authConfig";
import { apiClient, authService } from "@/services/api";

// Crear instancia de MSAL
const msalInstance = new PublicClientApplication(msalConfig);

interface UserData {
  id_usuario: string;
  nombre: string;
  apellido: string;
  correo: string;
  foto_url: string | null;
  id_rol?: string | null;
  userType?: "cliente" | "profesional" | null;
  telefono?: string | null;
  profesion?: string;
  rubro?: string;
  descripcion?: string;
  experiencia?: string;
  pais?: string;
  ciudad?: string;
  servicios?: string[];
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
      // 1) Inicializar MSAL SIEMPRE
      await msalInstance.initialize();

      // 2) Revisar si hay sesión tradicional guardada (login con correo/clave)
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
        setLoading(false);
        return;
      }

      // 3) Ver si hay una cuenta de Azure activa en el navegador
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        try {
          const response = await msalInstance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          });

          if (!response.idToken) {
            console.warn("⚠️ acquireTokenSilent no devolvió idToken en init");
            return;
          }

          console.log("🟣 acquireTokenSilent init:", {
            idToken: response.idToken,
            accessToken: response.accessToken,
            claims: response.idTokenClaims,
          });

          const token = response.idToken;
          setAccessToken(token);
          apiClient.setAuthToken(token);

          // ===== Sacar correo y nombre desde los claims del idToken =====
          const claims: any = response.idTokenClaims || {};
          const email: string =
            (claims.emails && claims.emails[0]) ||
            claims.email ||
            claims.preferred_username;

          if (!email) {
            console.warn(
              "⚠️ El token de Azure no trae email en emails/email/preferred_username. No se llama a azure-sync."
            );
            // Igual marcamos sesión de Azure para no dejar al usuario colgado
            setUser(accounts[0]);
            setIsAuthenticated(true);
            setNeedsOnboarding(true);
            return;
          }

          const nombreDesdeClaims: string =
            claims.name || claims.given_name || "";

          // 4) azure-sync: sincronizar/crear usuario interno en BD
          try {
            const syncResponse: any = await authService.azureSync({
              correo: email,
              nombre: nombreDesdeClaims,
              // opcional, por si quieres usarlo luego en backend
              accessToken: response.accessToken,
            });

            console.log("Respuesta de azure-sync (init):", syncResponse);

            if (syncResponse.success) {
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

              const needsOnboard = syncResponse.onboarded === false;
              setNeedsOnboarding(needsOnboard);
            } else {
              // Backend no pudo sincronizar → usamos solo la cuenta de Azure
              setUser(accounts[0]);
              setIsAuthenticated(true);
              setNeedsOnboarding(true);
            }
          } catch (syncError) {
            console.error("❌ Error al sincronizar en init:", syncError);
            setUser(accounts[0]);
            setIsAuthenticated(true);
            setNeedsOnboarding(true);
          }
        } catch (error) {
          console.error("⚠️ Error al obtener token silenciosamente:", error);
          setUser(null);
          setIsAuthenticated(false);
          setAccessToken(null);
        }
      }
    } catch (error) {
      console.error("❌ Error al inicializar MSAL:", error);
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
        localStorage.setItem("user", JSON.stringify(userData));
      } else {
        throw new Error(response.message || "Credenciales inválidas");
      }
    } catch (error: any) {
      console.error("❌ Error en login:", error);
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
      await msalInstance.initialize();
      // 1) Login interactivo
      const loginResponse = await msalInstance.loginPopup(loginRequest);
      const account = loginResponse.account ?? msalInstance.getAllAccounts()[0];

      if (!account) {
        throw new Error(
          "No se encontró ninguna cuenta de Azure después del login"
        );
      }

      // Opcional: marcar cuenta activa
      msalInstance.setActiveAccount(account);

      // 2) Obtener token de forma silenciosa después del login
      const tokenResult = await msalInstance.acquireTokenSilent({
        ...loginRequest,
        account,
      });

      console.log("🟣 tokenResult (React):", tokenResult);
      console.log("🟣 accessToken length:", tokenResult.accessToken?.length);
      console.log("🟣 idToken length:", tokenResult.idToken?.length);

      const token = tokenResult.idToken;
      if (!token) {
        console.error("⚠️ MSAL no devolvió idToken después del login");
        throw new Error("No se pudo obtener el token de Azure AD");
      }

      setAccessToken(token);
      apiClient.setAuthToken(token);

      // ===== Sacar correo y nombre desde los claims =====
      const claims: any = tokenResult.idTokenClaims || {};
      const email: string =
        (claims.emails && claims.emails[0]) ||
        claims.email ||
        claims.preferred_username;

      if (!email) {
        console.error(
          "❌ El token de Azure no trae email en emails/email/preferred_username"
        );
        throw new Error("No se pudo obtener el correo desde Azure AD");
      }

      const nombreDesdeClaims: string = claims.name || claims.given_name || "";

      // 3) Sincronizar con el backend
      try {
        const syncResponse: any = await authService.azureSync({
          correo: email,
          nombre: nombreDesdeClaims,
          accessToken: tokenResult.accessToken, // opcional, el backend lo ignora por ahora
        });

        console.log("Respuesta de azure-sync (login):", syncResponse);

        if (syncResponse.success) {
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

          const needsOnboard = syncResponse.onboarded === false;
          setNeedsOnboarding(needsOnboard);
        } else {
          setUser(account);
          setIsAuthenticated(true);
          setNeedsOnboarding(true);
        }
      } catch (syncError) {
        console.error("❌ Error al sincronizar con BD:", syncError);
        setUser(account);
        setIsAuthenticated(true);
        setNeedsOnboarding(true);
      }
    } catch (error) {
      console.error("❌ Error en login:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  /**
   * REFRESCO PERIÓDICO DEL TOKEN (solo para login Azure)
   */
  useEffect(() => {
    // Si no hay token, no intentamos refrescar (login tradicional)
    if (!isAuthenticated || !user || !accessToken) return;

    const accounts = msalInstance.getAllAccounts();
    const account = accounts[0];
    if (!account) return;

    let intervalId: number | undefined;

    const refreshToken = async () => {
      try {
        const result = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account,
        });

        const newToken = result.idToken;
        if (!newToken) return;

        console.log("🔄 Token refrescado, idToken length:", newToken.length);
        setAccessToken(newToken);
        apiClient.setAuthToken(newToken);
      } catch (err) {
        console.error("❌ Error refrescando token:", err);
        // aquí podrías, si quieres, hacer logout automático o marcar que se requiere relogin
      }
    };

    // refresco inicial
    refreshToken();
    // luego cada 10 minutos (ajusta según la vida de tu token)
    intervalId = window.setInterval(refreshToken, 10 * 60 * 1000);

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [isAuthenticated, user, accessToken]);

  /**
   * Logout
   */
  const logout = async () => {
    try {
      setLoading(true);

      // Limpiar sesión de localStorage
      localStorage.removeItem("user");

      // Logout de Azure AD si hay cuenta
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
      console.error("❌ Error en logout:", error);
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
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};
