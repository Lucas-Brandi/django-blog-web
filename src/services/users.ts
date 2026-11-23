import { http } from './http';

/** Perfil do usuário autenticado (GET /api/v1/users/me/). */
export interface Profile {
  username: string;
  email: string;
  bio: string;
  image_url: string;
}

/** Campos editáveis do perfil (PATCH /api/v1/users/me/). */
export interface ProfileUpdate {
  username?: string;
  email?: string;
  bio?: string;
  /** Nova foto de perfil (JPG ou PNG). */
  image?: File;
}

/** GET /api/v1/users/me/ — carrega o perfil do usuário atual. */
export async function getMe(): Promise<Profile> {
  const { data } = await http.get<Profile>('/users/me/');
  return data;
}

/**
 * PATCH /api/v1/users/me/ — atualiza o próprio perfil em multipart/form-data,
 * o que permite enviar a foto junto com os demais campos.
 */
export async function updateMe(payload: ProfileUpdate): Promise<Profile> {
  const form = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined) form.append(key, value);
  }
  // O cliente usa application/json por padrão, e com esse header o axios
  // converteria o FormData em JSON (perdendo o arquivo). Com multipart, o
  // axios remove o header no navegador e o browser define o boundary.
  const { data } = await http.patch<Profile>('/users/me/', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

/** DELETE /api/v1/users/me/image/ — volta para a foto de perfil padrão. */
export async function deleteMyImage(): Promise<Profile> {
  const { data } = await http.delete<Profile>('/users/me/image/');
  return data;
}
