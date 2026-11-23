import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CommentForm } from '@/components/comments/CommentForm';
import { CommentItem } from '@/components/comments/CommentItem';
import { useAuth } from '@/lib/auth';
import { getErrorMessage } from '@/lib/formErrors';
import { isAuthor } from '@/lib/postAuthor';
import { listComments, type Comment } from '@/services/comments';
import type { PostAuthor } from '@/services/posts';

interface CommentListProps {
  postId: number;
  /** Autor do post: usado na heurística de permissão de exclusão (D5). */
  postAuthor: PostAuthor;
}

type State =
  | { status: 'loading' }
  | { status: 'error'; error: unknown }
  | { status: 'ready'; comments: Comment[]; hasMore: boolean };

/**
 * Comentários de um post (M18). A leitura exige login (D5): para anônimos,
 * exibe um convite para entrar em vez da lista. Para logados, mostra o
 * formulário, a lista (paginada por "carregar mais") e o estado vazio/erro.
 *
 * A lista é mantida em estado local e atualizada sem recarregar a página:
 * novos comentários entram no topo da lista local; exclusões saem dela.
 */
export function CommentList({ postId, postAuthor }: CommentListProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [state, setState] = useState<State>({ status: 'loading' });
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const load = useCallback(
    (targetPage: number, append: boolean) => {
      if (append) setLoadingMore(true);

      listComments(postId, targetPage)
        .then((data) => {
          setState((prev) => {
            const existing =
              append && prev.status === 'ready' ? prev.comments : [];
            return {
              status: 'ready',
              comments: [...existing, ...data.results],
              hasMore: Boolean(data.next),
            };
          });
          setPage(targetPage);
        })
        .catch((error: unknown) => {
          if (!append) setState({ status: 'error', error });
        })
        .finally(() => {
          if (append) setLoadingMore(false);
        });
    },
    [postId],
  );

  // Recarrega a primeira página ao (re)autenticar ou trocar de post. A busca
  // acontece de forma assíncrona; o estado inicial já é 'loading'.
  function reload() {
    setState({ status: 'loading' });
    load(1, false);
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    listComments(postId, 1)
      .then((data) => {
        if (!active) return;
        setState({
          status: 'ready',
          comments: data.results,
          hasMore: Boolean(data.next),
        });
        setPage(1);
      })
      .catch((error: unknown) => {
        if (active) setState({ status: 'error', error });
      });
    return () => {
      active = false;
    };
  }, [isAuthenticated, postId]);

  function handleCreated(comment: Comment) {
    setState((prev) =>
      prev.status === 'ready'
        ? { ...prev, comments: [comment, ...prev.comments] }
        : { status: 'ready', comments: [comment], hasMore: false },
    );
  }

  function handleDeleted(id: number) {
    setState((prev) =>
      prev.status === 'ready'
        ? { ...prev, comments: prev.comments.filter((c) => c.id !== id) }
        : prev,
    );
  }

  // Anônimo: não lista comentários (D5), apenas convida a entrar.
  if (!isAuthenticated) {
    return (
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Comentários</h2>
        <div className="flex flex-col items-start gap-3 rounded-lg border border-border p-4 text-sm text-muted-foreground">
          <p>Entre para ver e escrever comentários.</p>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to="/login" state={{ from: location }} />}
          >
            Entrar
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold">Comentários</h2>

      <CommentForm postId={postId} onCreated={handleCreated} />

      {state.status === 'loading' && (
        <div className="flex flex-col gap-3" aria-busy="true">
          <span className="sr-only">Carregando comentários…</span>
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="size-6 shrink-0 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {state.status === 'error' && (
        <div
          role="alert"
          className="flex flex-col items-start gap-2 rounded-lg border border-border p-4 text-sm"
        >
          <p className="text-destructive">
            Não foi possível carregar os comentários.
          </p>
          <p className="text-muted-foreground">
            {getErrorMessage(state.error, 'Erro inesperado.')}
          </p>
          <Button variant="outline" size="sm" onClick={reload}>
            Tentar novamente
          </Button>
        </div>
      )}

      {state.status === 'ready' &&
        (state.comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Ainda não há comentários. Seja o primeiro.
          </p>
        ) : (
          <>
            <ul className="flex flex-col gap-4">
              {state.comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  // Autor do comentário ou autor do post (staff não é
                  // detectável no front); o 403 do backend cobre o resto.
                  canDelete={
                    isAuthor(comment.author, user) || isAuthor(postAuthor, user)
                  }
                  onDeleted={handleDeleted}
                />
              ))}
            </ul>
            {state.hasMore && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => load(page + 1, true)}
                  disabled={loadingMore}
                >
                  {loadingMore ? 'Carregando…' : 'Carregar mais'}
                </Button>
              </div>
            )}
          </>
        ))}
    </section>
  );
}
