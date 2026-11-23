import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface TagBadgesProps {
  tags: string[];
  /** Tag atualmente filtrada, destacada entre as demais. */
  activeTag?: string;
  className?: string;
}

/**
 * Lista de tags de um post como badges. Cada tag leva à home filtrada por ela
 * (/?tag=nome). A tag ativa aparece em destaque (variante padrão); as demais,
 * discretas (outline).
 */
export function TagBadges({ tags, activeTag, className }: TagBadgesProps) {
  if (tags.length === 0) return null;

  return (
    <ul className={className ?? 'flex flex-wrap gap-1.5'}>
      {tags.map((tag) => {
        const isActive = activeTag?.toLowerCase() === tag.toLowerCase();
        return (
          <li key={tag}>
            <Badge
              variant={isActive ? 'default' : 'outline'}
              render={
                <Link
                  to={`/?tag=${encodeURIComponent(tag)}`}
                  aria-label={`Filtrar posts pela tag ${tag}`}
                />
              }
            >
              {tag}
            </Badge>
          </li>
        );
      })}
    </ul>
  );
}
