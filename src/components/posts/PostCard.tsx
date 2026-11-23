import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TagBadges } from '@/components/posts/TagBadges';
import { formatDate } from '@/lib/format';
import type { Post } from '@/services/posts';

interface PostCardProps {
  post: Post;
  /** Tag ativa no filtro atual, destacada entre as tags do cartão. */
  activeTag?: string;
}

/**
 * Cartão de um post na listagem: título, autor · data, trecho e tags.
 *
 * O cartão inteiro leva ao detalhe (padrão "stretched link"): o link do título
 * se estende sobre todo o cartão via `after:absolute after:inset-0`, mantendo
 * um único link real (bom para acessibilidade e leitores de tela). As tags
 * ficam acima dessa camada (`relative z-10`) para continuarem clicáveis.
 */
export function PostCard({ post, activeTag }: PostCardProps) {
  return (
    <Card className="relative transition-colors hover:border-ring">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          <Link
            to={`/posts/${post.id}`}
            className="transition-colors after:absolute after:inset-0 hover:text-primary focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {post.title}
          </Link>
        </CardTitle>
        <CardDescription>
          {post.author.username} ·{' '}
          <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="line-clamp-3 text-base leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
        {/* Acima da camada do link, para que filtrar por tag ainda funcione. */}
        <TagBadges
          tags={post.tags}
          activeTag={activeTag}
          className="relative z-10 flex flex-wrap gap-1.5"
        />
      </CardContent>
    </Card>
  );
}

/** Esqueleto com o mesmo formato do PostCard, usado durante o carregamento. */
export function PostCardSkeleton() {
  return (
    <Card aria-hidden>
      <CardHeader>
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-4/5" />
      </CardContent>
    </Card>
  );
}
