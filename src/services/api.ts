import { API_BASE_URL, API_ENDPOINTS, buildApiUrl } from '@/config/constants';

/**
 * Cliente HTTP personalizado para comunicación con el backend
 */

export interface BookingConfirmPayload {
  professionalId: string;
  professionalName: string;
  profession: string;
  price: number;
  date: string;          // ej: "Lunes 2 de diciembre, 2025" (por ahora)
  time: string;          // ej: "10:00"
  location: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    notes?: string;
  };
  payment: {
    method: string;      // "credit-card"
    cardLast4: string;   // últimos 4 dígitos (simulado)
    amount: number;
    currency: string;    // "CLP"
  };
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Establece el token JWT para todas las peticiones
   */
  setAuthToken(token: string) {
    this.defaultHeaders = {
      ...this.defaultHeaders,
      Authorization: `Bearer ${token}`,
    };
  }

  /**
   * Remueve el token JWT
   */
  clearAuthToken() {
    const { Authorization, ...rest } = this.defaultHeaders as any;
    this.defaultHeaders = rest;
  }

  /**
   * Método genérico para hacer peticiones HTTP
   */
 private async request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${this.baseUrl}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      ...this.defaultHeaders,
      ...options.headers,
    },
  };

  try {
    console.log(
      "➡️ FETCH",
      config.method ?? "GET",
      url,
      "headers:",
      config.headers
    );
    const response = await fetch(url, config);

    // 204 No Content → devolvemos objeto vacío
    if (response.status === 204) {
      return {} as T;
    }

    const text = await response.text();

    // Si no hay cuerpo, devolvemos {}
    if (!text) {
      if (!response.ok) {
        throw new Error(response.statusText || `Error ${response.status}`);
      }
      return {} as T;
    }

    // Intentamos parsear JSON
    let data: any;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.warn("Respuesta no es JSON válido, devolviendo texto crudo:", text);
      data = text;
    }

    if (!response.ok) {
      const message =
        (data && data.message) ||
        (typeof data === "string" ? data : "") ||
        response.statusText ||
        `Error ${response.status}`;
      throw new Error(message);
    }

    return data as T;
  } catch (error) {
    console.error("API Request Error:", error);
    throw error;
  }
}


  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Instancia única del cliente API
export const apiClient = new ApiClient();

// ============================================
// SERVICIOS ESPECÍFICOS
// ============================================

/**
 * Servicio de Usuarios
 */
export const usuarioService = {
  list: () => apiClient.get(API_ENDPOINTS.USUARIO.LIST),
  get: (id: string) => apiClient.get(API_ENDPOINTS.USUARIO.GET(id)),
  create: (id: string, data: any) =>
    apiClient.post(API_ENDPOINTS.USUARIO.CREATE(id), data),
  update: (id: string, data: any) =>
    apiClient.post(API_ENDPOINTS.USUARIO.UPDATE(id), data),
  delete: (id: string) => apiClient.delete(API_ENDPOINTS.USUARIO.DELETE(id)),
};
export const historialService = {
  list: () => apiClient.get(`/historial`),
  get: (id: string) => apiClient.get(`/historial/${id}`),
  create: (id: string, data: any) =>
    apiClient.post(`/historial/${id}`, data),
  delete: (id: string) => apiClient.delete(`/historial/${id}`),
};

/**
 * Servicio de Clientes
 */
export const clienteService = {
  list: () => apiClient.get(API_ENDPOINTS.CLIENTE.LIST),
  get: (id: string) => apiClient.get(API_ENDPOINTS.CLIENTE.GET(id)),
  create: (id: string, data: any) =>
    apiClient.post(API_ENDPOINTS.CLIENTE.CREATE(id), data),
  update: (id: string, data: any) =>
    apiClient.post(API_ENDPOINTS.CLIENTE.UPDATE(id), data),
  delete: (id: string) => apiClient.delete(API_ENDPOINTS.CLIENTE.DELETE(id)),
};
  
/**
 * Servicio de Profesionales
 */
export const profesionalService = {
  list: () => apiClient.get(API_ENDPOINTS.PROFESIONAL.LIST),
  get: (id: string) => apiClient.get(API_ENDPOINTS.PROFESIONAL.GET(id)),
  create: (id: string, data: any) =>
    apiClient.post(API_ENDPOINTS.PROFESIONAL.CREATE(id), data),
  update: (id: string, data: any) =>
    apiClient.post(API_ENDPOINTS.PROFESIONAL.UPDATE(id), data),
  delete: (id: string) =>
    apiClient.delete(API_ENDPOINTS.PROFESIONAL.DELETE(id)),
};

/**
 * Servicio de Profesiones
 */
export const profesionService = {
  list: () => apiClient.get(API_ENDPOINTS.PROFESION.LIST),
  get: (id: string) => apiClient.get(API_ENDPOINTS.PROFESION.GET(id)),
  create: (id: string, data: any) =>
    apiClient.post(API_ENDPOINTS.PROFESION.CREATE(id), data),
  update: (id: string, data: any) =>
    apiClient.post(API_ENDPOINTS.PROFESION.UPDATE(id), data),
  delete: (id: string) => apiClient.delete(API_ENDPOINTS.PROFESION.DELETE(id)),
};

/**
 * Servicio de Citas
 */
export const citaService = {
  list: () => apiClient.get(API_ENDPOINTS.CITA.LIST),
  get: (id: string) => apiClient.get(API_ENDPOINTS.CITA.GET(id)),
  create: (id: string, data: any) =>
    apiClient.post(API_ENDPOINTS.CITA.CREATE(id), data),
  update: (id: string, data: any) =>
    apiClient.post(API_ENDPOINTS.CITA.UPDATE(id), data),
  delete: (id: string) => apiClient.delete(API_ENDPOINTS.CITA.DELETE(id)),
    getByCliente: (idCliente: string) =>
    apiClient.get(`/cita/cliente/${idCliente}`), 
};

/**
 * Servicio de Pagos
 */
export const pagosService = {
  list: () => apiClient.get(API_ENDPOINTS.PAGOS.LIST),
  get: (id: string) => apiClient.get(API_ENDPOINTS.PAGOS.GET(id)),
  create: (id: string, data: any) =>
    apiClient.post(API_ENDPOINTS.PAGOS.CREATE(id), data),
  update: (id: string, data: any) =>
    apiClient.post(API_ENDPOINTS.PAGOS.UPDATE(id), data),
  delete: (id: string) => apiClient.delete(API_ENDPOINTS.PAGOS.DELETE(id)),
};

/**
 * Servicio de Rubros (Categorías)
 */
export const rubroService = {
  list: () => apiClient.get(API_ENDPOINTS.RUBRO.LIST),
  get: (id: string) => apiClient.get(API_ENDPOINTS.RUBRO.GET(id)),
  create: (id: string, data: any) =>
    apiClient.post(API_ENDPOINTS.RUBRO.CREATE(id), data),
  update: (id: string, data: any) =>
    apiClient.post(API_ENDPOINTS.RUBRO.UPDATE(id), data),
  delete: (id: string) => apiClient.delete(API_ENDPOINTS.RUBRO.DELETE(id)),
};

/**
 * Servicio de Autenticación
 */
export const authService = {
  login: (correo: string, clave: string) =>
    apiClient.post(`/usuario/login`, { correo, clave }),
    azureSync: (data: { correo: string; nombre: string; accessToken?: string }) =>
    apiClient.post(`/usuario/azure-sync`, data),
  completeOnboarding: (userId: string, data: {
    nombre: string;
    apellido: string;
    telefono?: string;
    foto_url?: string;
    userType: string;
    id_profesion?: string;
    id_rubro?: string;
    descripcion?: string;
    experiencia?: string;
    pais?: string;
    ciudad?: string;
    servicios?: string;
    precioHora?: number;
  }) =>
    apiClient.put(`/usuario/${userId}/complete-onboarding`, data),
};

/**
 * Hook para usar el API client con autenticación automática
 */
export const useApi = () => {
  return {
    usuarios: usuarioService,
    clientes: clienteService,
    profesionales: profesionalService,
    profesiones: profesionService,
    citas: citaService,
    pagos: pagosService,
    rubros: rubroService,
    auth: authService,
    historial: historialService,
  };
};
