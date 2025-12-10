import { Configuration, PopupRequest } from '@azure/msal-browser';
import { AZURE_AD_CONFIG } from './constants';

/**
 * Configuración de MSAL para Azure AD B2C (CIAM - External ID)
 */
export const msalConfig: Configuration = {
  auth: {
    clientId: AZURE_AD_CONFIG.CLIENT_ID,
    authority: AZURE_AD_CONFIG.AUTHORITY,
    redirectUri: AZURE_AD_CONFIG.REDIRECT_URI,
    postLogoutRedirectUri: AZURE_AD_CONFIG.POST_LOGOUT_REDIRECT_URI,
    // knownAuthorities es requerido para Azure AD B2C/CIAM External ID
    knownAuthorities: [...AZURE_AD_CONFIG.KNOWN_AUTHORITIES],
  },
  cache: {
    cacheLocation: 'localStorage', // Usar localStorage para el token
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
 * Para CIAM, MSAL añade automáticamente openid, profile, email
 */
export const loginRequest: PopupRequest = {
  scopes: [...AZURE_AD_CONFIG.SCOPES],
};

/**
 * Scopes para obtener token de acceso
 */
export const tokenRequest = {
  scopes: [...AZURE_AD_CONFIG.SCOPES],
};

/**
 * Instrucciones para configurar Azure AD B2C (CIAM - External ID)
 *
 * CONFIGURACIÓN ACTUAL:
 * - Authority: https://tuhoraya.ciamlogin.com/
 * - Client ID: 591c4d94-6709-4fbc-96c6-d1118e76862b
 * - Known Authorities: tuhoraya.ciamlogin.com
 *
 * NOTAS IMPORTANTES PARA CIAM:
 * 1. No es necesario configurar scopes adicionales (openid, profile, email se añaden automáticamente)
 * 2. Microsoft Graph normalmente NO se usa con External ID
 * 3. Si tienes una API propia, deberás configurar los scopes específicos de tu API
 * 4. La autenticación se realiza mediante el dominio CIAM personalizado (tuhoraya.ciamlogin.com)
 *
 * CONFIGURACIÓN EN AZURE PORTAL:
 * 1. Ve a Azure Portal > External Identities
 * 2. En "Authentication", agrega:
 *    - Platform: Single-page application (SPA)
 *    - Redirect URI: http://localhost:5173 (Vite dev)
 *    - Redirect URI: https://tudominio.com (producción)
 * 3. Habilita "Implicit grant" si es necesario para tu flujo
 */
