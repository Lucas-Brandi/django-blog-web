import { http } from './http';
import type { Paginated, PostAuthor } from './posts';

/** Comentário como devolvido pela API (M6). */
export interface Comment {
  id: number;
  /** Id do post ao qual o comentário pertence. */
  post: number;
  author: PostAuthor;
  content: string;
  /** Data ISO 8601 (UTC). */
  created_at: string;
}

/**
 * GET /api/v1/posts/:postId/comments/ — comentários de um post, em ordem
 * cronológica (paginado). Exige login (D5), inclusive para leitura.
 */
export async function listComments(
  postId: number,
  page = 1,
): Promise<Paginated<Comment>> {
  const { data } = await http.get<Paginated<Comment>>(
    `/posts/${postId}/comments/`,
    { params: { page } },
  );
  return data;
}

/**
 * POST /api/v1/posts/:postId/comments/ — cria um comentário no post.
 * O autor vem de request.user e o post vem da URL (nunca do corpo).
 */
export async function createComment(
  postId: number,
  content: string,
): Promise<Comment> {
  const { data } = await http.post<Comment>(`/posts/${postId}/comments/`, {
    content,
  });
  return data;
}

/**
 * DELETE /api/v1/comments/:id/ — exclui um comentário. O backend libera para
 * o autor do comentário, o autor do post ou staff (D5); responde 403 caso
 * contrário.
 */
export async function deleteComment(id: number): Promise<void> {
  await http.delete(`/comments/${id}/`);
}
