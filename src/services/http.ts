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
 * Erros de validação por campo, no formato devolvido pelo DRF:
 *   { "campo": ["mensagem 1", "mensagem 2"], ... }
 * Pode conter a chave especial "non_field_errors" para erros gerais.
 */
export type FieldErrors = Record<string, string[]>;

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
  /**
   * Erros por campo extraídos da resposta do backend (quando o `detail` do
   * envelope é um objeto). Usado pelas telas para posicionar o erro no campo.
   */
  fieldErrors?: FieldErrors;
  /** Indica ausência de resposta do servidor (rede/CORS/timeout). */
  isNetworkError: boolean;
}

/**
 * Hook para obter o token de acesso. Preenchido pelo AuthProvider (M12) via
 * setAuthTokenGetter; enquanto não houver login, retorna null.
 */
let getToken: () => string | null = () => null;

/** Registra a função usada para recuperar o token de acesso (chamada pela M12). */
export function setAuthTokenGetter(getter: () => string | null): void {
  getToken = getter;
}

/**
 * Hook para renovar o token após um 401 e repetir a requisição. Preenchido
 * pelo AuthProvider (M12). Deve devolver o novo access token, ou null se a
 * renovação falhar (nesse caso o AuthProvider também desloga o usuário).
 */
let refreshToken: (() => Promise<string | null>) | null = null;

/** Registra a função de renovação de token usada no retry de 401 (M12). */
export function setAuthTokenRefresher(
  refresher: (() => Promise<string | null>) | null,
): void {
  refreshToken = refresher;
}

export const http: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

/**
 * Cliente "cru": mesma baseURL, mas sem o interceptor que renova o token no
 * 401. Usado para as próprias chamadas de autenticação (login, refresh), para
 * não cair em recursão quando o backend responde 401.
 */
export const authHttp: AxiosInstance = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// Anexa o Authorization: Bearer <access> quando houver token.
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

/**
 * Desembrulha o envelope de erro do backend:
 *   { "error": { "status": N, "detail": <string | objeto por campo | lista> } }
 * Preenche `message` e, quando o detail é um objeto, `fieldErrors`.
 */
function toApiError(error: AxiosError): ApiError {
  const apiError: ApiError = {
    message: error.message || 'Erro inesperado',
    isNetworkError: !error.response,
  };

  if (!error.response) {
    apiError.message =
      'Não foi possível conectar à API. Verifique a conexão ou o CORS.';
    return apiError;
  }

  apiError.status = error.response.status;
  apiError.data = error.response.data;

  const body = error.response.data as
    | { error?: { detail?: unknown }; detail?: unknown }
    | undefined;
  // O envelope padrão é { error: { detail } }; aceita também { detail } cru.
  const detail = body?.error?.detail ?? body?.detail;

  if (typeof detail === 'string') {
    apiError.message = detail;
  } else if (Array.isArray(detail)) {
    apiError.message = detail.map(String).join(' ');
  } else if (detail && typeof detail === 'object') {
    const fieldErrors: FieldErrors = {};
    for (const [field, messages] of Object.entries(detail)) {
      fieldErrors[field] = Array.isArray(messages)
        ? messages.map(String)
        : [String(messages)];
    }
    apiError.fieldErrors = fieldErrors;
    const general = fieldErrors.non_field_errors ?? fieldErrors.detail;
    apiError.message = general
      ? general.join(' ')
      : `Erro ${error.response.status}`;
  } else {
    apiError.message = `Erro ${error.response.status}`;
  }

  return apiError;
}

// Padroniza erros em ApiError no cliente cru (sem retry).
authHttp.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => Promise.reject(toApiError(error)),
);

// No cliente autenticado, tenta renovar o token uma vez ao receber 401.
http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;

    const shouldRefresh =
      error.response?.status === 401 &&
      refreshToken !== null &&
      original !== undefined &&
      !original._retried;

    if (shouldRefresh) {
      original._retried = true;
      const newToken = await refreshToken!();
      if (newToken) {
        original.headers.set('Authorization', `Bearer ${newToken}`);
        return http(original);
      }
    }

    return Promise.reject(toApiError(error));
  },
);
