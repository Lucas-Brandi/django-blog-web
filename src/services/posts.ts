import { http } from './http';

/** Resposta paginada padrão do DRF (PageNumberPagination). */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Autor resumido de um post (PostAuthor no schema da API). */
export interface PostAuthor {
  username: string;
  image_url: string;
}

/** Post como devolvido por GET /api/v1/posts/. */
export interface Post {
  id: number;
  title: string;
  content: string;
  author: PostAuthor;
  /** Data ISO 8601 (UTC). */
  created_at: string;
  /** Data ISO 8601 (UTC). */
  updated_at: string;
  tags: string[];
}

/**
 * GET /api/v1/posts/?page=N — lista paginada, mais recentes primeiro.
 * Leitura pública (D2): funciona com ou sem login.
 */
export async function listPosts(page = 1): Promise<Paginated<Post>> {
  const { data } = await http.get<Paginated<Post>>('/posts/', {
    params: { page },
  });
  return data;
}
