import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

/**
 * Base da API, lida de VITE_API_URL. O backend expõe os endpoints sob /api/v1/.
 * Ex.: VITE_API_URL=http://localhost:8000 -> baseURL http://localhost:8000/api/v1
 */
const API_BASE = import.meta.env.VITE_API_URL ?? '';
const baseURL = `${API_BASE.replace(/\/$/, '')}/api/v1`;

/**
 * Formato de erro padronizado para toda a aplicação, independente de onde a
 * falha aconteceu (rede, timeout, resposta HTTP de erro).
 */
export interface ApiError {
  /** Mensagem legível para exibir/registrar. */
  message: string;
  /** Status HTTP quando houver resposta do servidor. */
  status?: number;
  /** Corpo da resposta de erro, quando houver. */
  data?: unknown;
  /** Indica ausência de resposta do servidor (rede/CORS/timeout). */
  isNetworkError: boolean;
}

/**
 * Hook para obter o token de autenticação. Será preenchido em M12.
 * Por enquanto retorna null (nenhum token anexado).
 */
let getToken: () => string | null = () => null;

/**
 * Registra a função usada para recuperar o token de autenticação.
 * M12 (login) chamará isto para que o cliente passe a anexar o Authorization.
 */
export function setAuthTokenGetter(getter: () => string | null): void {
  getToken = getter;
}

export const http: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Anexa o token, quando disponível. Preparado para M12.
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Padroniza erros em ApiError.
http.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const apiError: ApiError = {
      message: error.message || 'Erro inesperado',
      isNetworkError: !error.response,
    };

    if (error.response) {
      apiError.status = error.response.status;
      apiError.data = error.response.data;

      const data = error.response.data as { detail?: string } | undefined;
      if (data && typeof data.detail === 'string') {
        apiError.message = data.detail;
      } else {
        apiError.message = `Erro ${error.response.status}`;
      }
    } else {
      apiError.message =
        'Não foi possível conectar à API. Verifique a conexão ou o CORS.';
    }

    return Promise.reject(apiError);
  },
);
