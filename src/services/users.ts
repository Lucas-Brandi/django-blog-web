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
}

/** GET /api/v1/users/me/ — carrega o perfil do usuário atual. */
export async function getMe(): Promise<Profile> {
  const { data } = await http.get<Profile>('/users/me/');
  return data;
}

/** PATCH /api/v1/users/me/ — atualiza os dados do próprio perfil. */
export async function updateMe(payload: ProfileUpdate): Promise<Profile> {
  const { data } = await http.patch<Profile>('/users/me/', payload);
  return data;
}
