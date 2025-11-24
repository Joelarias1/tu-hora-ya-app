import { Configuration, PopupRequest } from '@azure/msal-browser';
import { AZURE_AD_CONFIG } from './constants';

/**
 * Configuración de MSAL para Azure AD
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: AZURE_AD_CONFIG.CLIENT_ID || 'YOUR_CLIENT_ID_HERE', // TODO: Agregar desde Azure Portal
    authority: AZURE_AD_CONFIG.AUTHORITY,
    redirectUri: AZURE_AD_CONFIG.REDIRECT_URI,
    postLogoutRedirectUri: AZURE_AD_CONFIG.REDIRECT_URI,
  },
  cache: {
    cacheLocation: 'sessionStorage', // Usar sessionStorage para el token
    storeAuthStateInCookie: false, // Set to true para IE11 o Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }
        switch (level) {
          case 0: // LogLevel.Error
            console.error(message);
            return;
          case 1: // LogLevel.Warning
            console.warn(message);
            return;
          case 2: // LogLevel.Info
            console.info(message);
            return;
          case 3: // LogLevel.Verbose
            console.debug(message);
            return;
        }
      },
    },
  },
};

/**
 * Scopes para login
 */
export const loginRequest: PopupRequest = {
  scopes: AZURE_AD_CONFIG.SCOPES,
};

/**
 * Scopes para obtener token de acceso
 */
export const tokenRequest = {
  scopes: AZURE_AD_CONFIG.SCOPES,
};

/**
 * Instrucciones para configurar Azure AD
 *
 * PASOS PARA OBTENER TU CLIENT_ID:
 *
 * 1. Ve a Azure Portal: https://portal.azure.com
 * 2. Navega a "Azure Active Directory" > "App registrations"
 * 3. Busca o crea tu aplicación
 * 4. Copia el "Application (client) ID"
 * 5. En "Authentication", agrega:
 *    - Platform: Single-page application (SPA)
 *    - Redirect URI: http://localhost:8080 (para desarrollo)
 *    - Redirect URI: https://tudominio.com (para producción)
 * 6. En "API permissions", asegúrate de tener:
 *    - Microsoft Graph > User.Read
 *    - Cualquier scope personalizado de tu API
 * 7. Pega el Client ID en src/config/constants.ts
 */
