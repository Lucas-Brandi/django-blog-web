import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { CommentList } from '@/components/comments/CommentList';
import { DeletePostDialog } from '@/components/posts/DeletePostDialog';
import { TagBadges } from '@/components/posts/TagBadges';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { getErrorMessage, isApiError } from '@/lib/formErrors';
import { isAuthor } from '@/lib/postAuthor';
import { deletePost, getPost, type Post } from '@/services/posts';

type State =
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'ready'; post: Post };

/** Converte o id da rota em número; valores inválidos viram NaN. */
function parseId(value: string | undefined): number {
  return Number(value);
}

/**
 * Detalhe de um post (M18): título, autor, data, conteúdo e tags. Leitura
 * pública (D2). O autor vê os botões de editar e excluir. Abaixo, a lista de
 * comentários (que exige login — tratada em CommentList).
 */
export default function PostDetail() {
  const { id } = useParams();
  const postId = parseId(id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    // Id inválido é tratado como "não encontrado" (ApiError com status 404),
    // sem setState síncrono dentro do efeito.
    const request = Number.isInteger(postId)
      ? getPost(postId)
      : Promise.reject({ status: 404, isNetworkError: false, message: '' });
    request
      .then((post) => {
        if (active) setState({ status: 'ready', post });
      })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', error });
      });
    return () => {
      active = false;
    };
  }, [postId]);

  async function handleDelete() {
    await deletePost(postId);
    toast.success('Post excluído.');
    navigate('/', { replace: true });
  }

  if (state.status === 'loading') {
    return (
      <article className="flex flex-col gap-4" aria-busy="true">
        <span className="sr-only">Carregando post…</span>
        <Skeleton className="h-9 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </article>
    );
  }

  if (state.status === 'error') {
    const notFound = isApiError(state.error) && state.error.status === 404;
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 rounded-lg border border-border p-6 text-center"
      >
        <p className="text-destructive">
          {notFound
            ? 'Este post não existe ou foi removido.'
            : 'Não foi possível carregar o post.'}
        </p>
        {!notFound && (
          <p className="text-sm text-muted-foreground">
            {getErrorMessage(state.error, 'Erro inesperado.')}
          </p>
        )}
        <Button variant="outline" nativeButton={false} render={<Link to="/" />}>
          Voltar para a home
        </Button>
      </div>
    );
  }

  const { post } = state;
  const canManage = isAuthor(post.author, user);

  return (
    <div className="flex flex-col gap-8">
      <article className="flex flex-col gap-4">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <p className="text-sm text-muted-foreground">
            {post.author.username} ·{' '}
            <time dateTime={post.created_at}>
              {formatDate(post.created_at)}
            </time>
          </p>
          <TagBadges tags={post.tags} />
        </header>

        <div className="text-base leading-relaxed whitespace-pre-line">
          {post.content}
        </div>

        {canManage && (
          <div className="flex gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link to={`/posts/${post.id}/edit`} />}
            >
              <Pencil />
              Editar
            </Button>
            <DeletePostDialog postTitle={post.title} onConfirm={handleDelete} />
          </div>
        )}
      </article>

      <CommentList postId={post.id} postAuthor={post.author} />
    </div>
  );
}
