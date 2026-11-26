import { authHttp, http } from './http';

/** Par de tokens JWT devolvido pelo login (SimpleJWT). */
export interface TokenPair {
  access: string;
  refresh: string;
}

/** Credenciais de login. */
export interface LoginPayload {
  username: string;
  password: string;
}

/** Dados do cadastro (espelha o RegisterSerializer do backend). */
export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password2: string;
}

/**
 * Resposta do cadastro. O backend já autentica no ato: devolve o par de tokens
 * (como o login) mais os dados básicos do usuário criado.
 */
export interface RegisterResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    username: string;
    email: string;
  };
}

/** Pedido de redefinição de senha. */
export interface PasswordResetRequestPayload {
  email: string;
}

/** Confirmação de redefinição de senha (uid + token vêm do link do e-mail). */
export interface PasswordResetConfirmPayload {
  uid: string;
  token: string;
  new_password: string;
  new_password2: string;
}

/**
 * POST /api/v1/auth/login/ — obtém o par de tokens.
 * Usa authHttp (sem retry de 401) para não recursar no interceptor.
 */
export async function login(payload: LoginPayload): Promise<TokenPair> {
  const { data } = await authHttp.post<TokenPair>('/auth/login/', payload);
  return data;
}

/**
 * POST /api/v1/auth/refresh/ — renova o access token.
 * ROTATE_REFRESH_TOKENS está ativo no backend, então a resposta pode trazer um
 * novo refresh; devolvemos o corpo inteiro para o chamador persistir ambos.
 */
export async function refresh(refreshTokenValue: string): Promise<TokenPair> {
  const { data } = await authHttp.post<TokenPair>('/auth/refresh/', {
    refresh: refreshTokenValue,
  });
  // O endpoint sempre devolve `access`; `refresh` só quando há rotação.
  return { access: data.access, refresh: data.refresh ?? refreshTokenValue };
}

/** POST /api/v1/auth/logout/ — revoga o refresh token (exige estar logado). */
export async function logout(refreshTokenValue: string): Promise<void> {
  await http.post('/auth/logout/', { refresh: refreshTokenValue });
}

/** POST /api/v1/auth/register/ — cria um usuário. */
export async function register(
  payload: RegisterPayload,
): Promise<RegisterResponse> {
  const { data } = await authHttp.post<RegisterResponse>(
    '/auth/register/',
    payload,
  );
  return data;
}

/** POST /api/v1/auth/password-reset/ — solicita o e-mail de redefinição. */
export async function requestPasswordReset(
  payload: PasswordResetRequestPayload,
): Promise<void> {
  await authHttp.post('/auth/password-reset/', payload);
}

/** POST /api/v1/auth/password-reset/confirm/ — define a nova senha. */
export async function confirmPasswordReset(
  payload: PasswordResetConfirmPayload,
): Promise<void> {
  await authHttp.post('/auth/password-reset/confirm/', payload);
}
