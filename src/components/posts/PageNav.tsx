import type { MouseEvent } from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

type PageItem = number | 'ellipsis';

/**
 * Páginas a mostrar: a primeira, a última e as vizinhas da atual, com
 * reticências nos buracos. Ex.: 1 … 4 5 6 … 10.
 */
function getPageItems(current: number, total: number): PageItem[] {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const items: PageItem[] = [];
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && page - previous > 1) items.push('ellipsis');
    items.push(page);
  });
  return items;
}

interface PageNavProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Navegação entre páginas (shadcn `pagination`). Os links têm `href` real
 * (?page=N), para abrir em nova aba, mas o clique normal navega pela SPA.
 */
export function PageNav({ page, totalPages, onPageChange }: PageNavProps) {
  if (totalPages <= 1) return null;

  function linkProps(target: number) {
    return {
      href: target === 1 ? '?' : `?page=${target}`,
      onClick: (event: MouseEvent<HTMLAnchorElement>) => {
        // Deixa Ctrl/Cmd+clique e clique do meio abrirem em nova aba.
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.button !== 0) {
          return;
        }
        event.preventDefault();
        onPageChange(target);
      },
    };
  }

  const disabledClass = 'pointer-events-none opacity-50';
  // Link desabilitado: sem href, fora da ordem de Tab e marcado para leitores.
  const disabledProps = { 'aria-disabled': true, tabIndex: -1 } as const;
  const hasPrevious = page > 1;
  const hasNext = page < totalPages;

  return (
    <Pagination aria-label="Paginação">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            text="Anterior"
            aria-label="Ir para a página anterior"
            className={cn(!hasPrevious && disabledClass)}
            {...(hasPrevious ? linkProps(page - 1) : disabledProps)}
          />
        </PaginationItem>

        {getPageItems(page, totalPages).map((item, index) =>
          item === 'ellipsis' ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                isActive={item === page}
                aria-label={`Página ${item}`}
                {...linkProps(item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            text="Próxima"
            aria-label="Ir para a próxima página"
            className={cn(!hasNext && disabledClass)}
            {...(hasNext ? linkProps(page + 1) : disabledProps)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
