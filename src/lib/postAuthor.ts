import type { AuthUser } from '@/lib/auth';
import type { PostAuthor } from '@/services/posts';

/**
 * Indica se o usuário atual é o autor de um conteúdo (post ou comentário).
 *
 * A API identifica o autor apenas pelo `username` (não expõe id nem a flag de
 * staff em /users/me/). Por isso a comparação é por username. Staff e o autor
 * do post têm permissão extra no backend que o front não consegue prever: as
 * ações seguem protegidas no servidor, que responde 403 quando não autorizado.
 */
export function isAuthor(
  author: PostAuthor | undefined,
  user: AuthUser | null,
): boolean {
  if (!author || !user) return false;
  return author.username === user.username;
}
