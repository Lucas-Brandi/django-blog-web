import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/format';
import type { Post } from '@/services/posts';

/** Cartão de um post na listagem: título, autor · data e conteúdo. */
export function PostCard({ post }: { post: Post }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{post.title}</CardTitle>
        <CardDescription>
          {post.author.username} ·{' '}
          <time dateTime={post.created_at}>{formatDate(post.created_at)}</time>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-base leading-relaxed whitespace-pre-line">
          {post.content}
        </p>
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
