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

/** Campos de escrita de um post (POST e PUT/PATCH). */
export interface PostInput {
  title: string;
  content: string;
  /** Nomes das tags. O backend aceita a lista em `tag_input` (write-only). */
  tags: string[];
}

/** Filtros aceitos por GET /api/v1/posts/. */
export interface PostListParams {
  page?: number;
  /** Filtra pela tag (case-insensitive), via ?tag=nome. */
  tag?: string;
}

/**
 * GET /api/v1/posts/ — lista paginada, mais recentes primeiro.
 * Leitura pública (D2): funciona com ou sem login. Aceita `page` e `tag`.
 */
export async function listPosts(
  params: PostListParams = {},
): Promise<Paginated<Post>> {
  const { page = 1, tag } = params;
  const { data } = await http.get<Paginated<Post>>('/posts/', {
    // `tag` só entra na query quando informado, para não poluir a URL da API.
    params: { page, ...(tag ? { tag } : {}) },
  });
  return data;
}

/**
 * GET /api/v1/posts/:id/ — detalhe de um post. Leitura pública (D2).
 */
export async function getPost(id: number): Promise<Post> {
  const { data } = await http.get<Post>(`/posts/${id}/`);
  return data;
}

/**
 * POST /api/v1/posts/ — cria um post (autenticado; author = usuário logado).
 * O backend espera os nomes das tags em `tag_input`.
 */
export async function createPost(input: PostInput): Promise<Post> {
  const { data } = await http.post<Post>('/posts/', {
    title: input.title,
    content: input.content,
    tag_input: input.tags,
  });
  return data;
}

/**
 * PATCH /api/v1/posts/:id/ — edita um post (só autor ou staff).
 */
export async function updatePost(
  id: number,
  input: PostInput,
): Promise<Post> {
  const { data } = await http.patch<Post>(`/posts/${id}/`, {
    title: input.title,
    content: input.content,
    tag_input: input.tags,
  });
  return data;
}

/**
 * DELETE /api/v1/posts/:id/ — exclui um post (só autor ou staff).
 */
export async function deletePost(id: number): Promise<void> {
  await http.delete(`/posts/${id}/`);
}
