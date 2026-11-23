import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PageNav } from '@/components/posts/PageNav';
import { PostCard, PostCardSkeleton } from '@/components/posts/PostCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { getErrorMessage, isApiError } from '@/lib/formErrors';
import { listPosts, type Paginated, type Post } from '@/services/posts';

/** Resultado de uma requisição, marcado com a chave (página + tentativa). */
type PostsResult =
  | { key: string; status: 'success'; data: Paginated<Post> }
  | { key: string; status: 'error'; error: unknown };

/** Lê ?page=N da URL; qualquer valor inválido vira a página 1. */
function parsePage(value: string | null): number {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
}

/**
 * Total de páginas a partir da resposta do DRF. Sem `next`, a página atual é
 * a última; com `next`, a página atual está cheia e dá o tamanho da página.
 */
function getTotalPages(data: Paginated<Post>, page: number): number {
  if (!data.next) return page;
  return Math.max(page, Math.ceil(data.count / data.results.length));
}

const SKELETON_COUNT = 3;

/**
 * Home (M15): lista paginada de posts vinda de GET /api/v1/posts/.
 * A página atual fica na URL (?page=N), então voltar/avançar no navegador e
 * links diretos funcionam.
 */
export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parsePage(searchParams.get('page'));
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<PostsResult | null>(null);

  const requestKey = `${page}:${attempt}`;

  useEffect(() => {
    let active = true;
    listPosts(page)
      .then((data) => {
        if (active) setResult({ key: requestKey, status: 'success', data });
      })
      .catch((error: unknown) => {
        if (active) setResult({ key: requestKey, status: 'error', error });
      });
    return () => {
      active = false;
    };
  }, [page, requestKey]);

  // Enquanto a resposta da chave atual não chega, mostramos o carregamento.
  const current = result?.key === requestKey ? result : null;

  function goToPage(target: number) {
    setSearchParams(target === 1 ? {} : { page: String(target) });
    window.scrollTo({ top: 0 });
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <p className="text-xs font-bold uppercase tracking-widest text-primary">
          Mais recentes
        </p>
        <h1 className="text-3xl font-bold">Posts</h1>
      </div>

      {current === null && (
        <div className="flex flex-col gap-4" aria-busy="true">
          <span className="sr-only">Carregando posts…</span>
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      )}

      {current?.status === 'error' && (
        <HomeError
          error={current.error}
          page={page}
          onRetry={() => setAttempt((n) => n + 1)}
        />
      )}

      {current?.status === 'success' &&
        (current.data.results.length === 0 ? (
          <Card>
            <CardContent className="text-center text-muted-foreground">
              Nenhum post encontrado.
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex flex-col gap-4">
              {current.data.results.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
            <PageNav
              page={page}
              totalPages={getTotalPages(current.data, page)}
              onPageChange={goToPage}
            />
          </>
        ))}
    </div>
  );
}

interface HomeErrorProps {
  error: unknown;
  page: number;
  onRetry: () => void;
}

/**
 * Estado de erro. Página inexistente (404 do DRF em ?page=N) oferece voltar à
 * primeira página; os demais erros oferecem nova tentativa.
 */
function HomeError({ error, page, onRetry }: HomeErrorProps) {
  const pageNotFound = page > 1 && isApiError(error) && error.status === 404;

  return (
    <Card role="alert">
      <CardContent className="flex flex-col items-center gap-3 text-center">
        <p className="text-destructive">
          {pageNotFound
            ? 'Esta página de posts não existe.'
            : 'Não foi possível carregar os posts.'}
        </p>
        {!pageNotFound && (
          <p className="text-sm text-muted-foreground">
            {getErrorMessage(error, 'Erro inesperado.')}
          </p>
        )}
        {pageNotFound ? (
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link to="/" />}
          >
            Ir para a primeira página
          </Button>
        ) : (
          <Button variant="outline" onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
