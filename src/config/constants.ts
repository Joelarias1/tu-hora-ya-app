// ============================================
// CONFIGURACIÓN DEL BACKEND
// ============================================

/**
 * URL base del backend según el entorno
 * - Local: Docker corriendo en localhost:8000
 * - EC2: Cambiar por la IP pública de tu instancia EC2
 */
const getApiBaseUrl = (): string => {
  // Detectar si estamos en desarrollo o producción
  const hostname = window.location.hostname;

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Entorno local - Backend en Docker
    return 'http://localhost:8080';
  } else {
    // Producción - Cambiar por tu IP de EC2 o dominio
    // TODO: Reemplazar con tu IP de EC2 cuando despliegues
    return 'http://localhost:8080';
  }
};

export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  BFF_PATH: '/bff',
  TIMEOUT: 30000, // 30 segundos
} as const;

// URL completa del BFF
export const API_BASE_URL = `${API_CONFIG.BASE_URL}${API_CONFIG.BFF_PATH}`;

// ============================================
// ENDPOINTS DEL BACKEND
// ============================================

export const API_ENDPOINTS = {
  // Usuarios
  USUARIO: {
    LIST: '/usuario',
    GET: (id: string) => `/usuario/${id}`,
    CREATE: (id: string) => `/usuario/${id}`,
    UPDATE: (id: string) => `/usuario/${id}`,
    DELETE: (id: string) => `/usuario/${id}`,
  },

  // Clientes
  CLIENTE: {
    LIST: '/usuariocliente',
    GET: (id: string) => `/usuariocliente/${id}`,
    CREATE: (id: string) => `/usuariocliente/${id}`,
    UPDATE: (id: string) => `/usuariocliente/${id}`,
    DELETE: (id: string) => `/usuariocliente/${id}`,
  },

  // Profesionales
  PROFESIONAL: {
    LIST: '/usuarioprofesional',
    GET: (id: string) => `/usuarioprofesional/${id}`,
    CREATE: (id: string) => `/usuarioprofesional/${id}`,
    UPDATE: (id: string) => `/usuarioprofesional/${id}`,
    DELETE: (id: string) => `/usuarioprofesional/${id}`,
  },

  // Roles
  ROL: {
    LIST: '/rol',
    GET: (id: string) => `/rol/${id}`,
    CREATE: (id: string) => `/rol/${id}`,
    UPDATE: (id: string) => `/rol/${id}`,
    DELETE: (id: string) => `/rol/${id}`,
  },

  // Profesiones
  PROFESION: {
    LIST: '/profesion',
    GET: (id: string) => `/profesion/${id}`,
    CREATE: (id: string) => `/profesion/${id}`,
    UPDATE: (id: string) => `/profesion/${id}`,
    DELETE: (id: string) => `/profesion/${id}`,
  },

  // Rubros
  RUBRO: {
    LIST: '/rubro',
    GET: (id: string) => `/rubro/${id}`,
    CREATE: (id: string) => `/rubro/${id}`,
    UPDATE: (id: string) => `/rubro/${id}`,
    DELETE: (id: string) => `/rubro/${id}`,
  },

  // Servicios Profesionales
  SERVICIO_PROFESIONAL: {
    LIST: '/servicioprofesional',
    GET: (id: string) => `/servicioprofesional/${id}`,
    CREATE: (id: string) => `/servicioprofesional/${id}`,
    UPDATE: (id: string) => `/servicioprofesional/${id}`,
    DELETE: (id: string) => `/servicioprofesional/${id}`,
  },

  // Citas
  CITA: {
    LIST: '/cita',
    GET: (id: string) => `/cita/${id}`,
    CREATE: (id: string) => `/cita/${id}`,
    UPDATE: (id: string) => `/cita/${id}`,
    DELETE: (id: string) => `/cita/${id}`,
  },

  // Pagos
  PAGOS: {
    LIST: '/pagos',
    GET: (id: string) => `/pagos/${id}`,
    CREATE: (id: string) => `/pagos/${id}`,
    UPDATE: (id: string) => `/pagos/${id}`,
    DELETE: (id: string) => `/pagos/${id}`,
  },

  // Tipos de Cita
  TIPO_CITA: {
    LIST: '/tipocita',
    GET: (id: string) => `/tipocita/${id}`,
    CREATE: (id: string) => `/tipocita/${id}`,
    UPDATE: (id: string) => `/tipocita/${id}`,
    DELETE: (id: string) => `/tipocita/${id}`,
  },
} as const;

// ============================================
// CONFIGURACIÓN DE AZURE AD B2C (CIAM - External ID)
// ============================================

export const AZURE_AD_CONFIG = {
  CLIENT_ID: '591c4d94-6709-4fbc-96c6-d1118e76862b',
  AUTHORITY: 'https://tuhoraya.ciamlogin.com/daef8e33-adbe-405e-8773-78df551d2b73/v2.0',
  REDIRECT_URI: window.location.origin,
  POST_LOGOUT_REDIRECT_URI: window.location.origin,
  KNOWN_AUTHORITIES: ['tuhoraya.ciamlogin.com'],
  SCOPES: ['openid', 'profile', 'email'], // opcional pero más explícito
};


// ============================================
// CONFIGURACIÓN DE LA APLICACIÓN
// ============================================

export const APP_CONFIG = {
  NAME: 'Tu Hora Ya',
  VERSION: '1.0.0',
  DESCRIPTION: 'Plataforma de reserva de citas con profesionales',
} as const;

// ============================================
// UTILIDADES
// ============================================

/**
 * Construye una URL completa del endpoint
 */
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

/**
 * Log de la configuración actual (solo en desarrollo)
 */
if (import.meta.env.DEV) {
  console.log('🔧 Configuración de la API:', {
    baseUrl: API_CONFIG.BASE_URL,
    bffPath: API_CONFIG.BFF_PATH,
    fullUrl: API_BASE_URL,
    azureAuthority: AZURE_AD_CONFIG.AUTHORITY,
  });
}
