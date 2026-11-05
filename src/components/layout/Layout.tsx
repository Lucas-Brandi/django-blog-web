import { useEffect } from 'react';
import { Outlet, useMatches } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/sonner';
import { SITE_TITLE } from '@/lib/navigation';

/** Metadados que uma rota pode expor via `handle` para o layout. */
export interface RouteHandle {
  /** Título da página, usado para montar o `document.title`. */
  title?: string;
}

/**
 * Lê o título da rota ativa (via `handle`) e atualiza o título da aba.
 * Percorre de trás para frente para pegar a rota mais específica que
 * declarou um título.
 */
function usePageTitle() {
  const matches = useMatches();

  useEffect(() => {
    const withTitle = [...matches]
      .reverse()
      .find((match) => (match.handle as RouteHandle | undefined)?.title);

    const pageTitle = (withTitle?.handle as RouteHandle | undefined)?.title;
    document.title = pageTitle ? `${SITE_TITLE} — ${pageTitle}` : SITE_TITLE;
  }, [matches]);
}

/**
 * Layout base: navbar no topo, conteúdo da rota no meio e rodapé embaixo.
 * Mantém a estrutura consistente em todas as rotas e hospeda os toasts
 * (feedback ao usuário, no lugar das `messages` do Django).
 */
export function Layout() {
  usePageTitle();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
          <Outlet />
        </div>
      </main>
      <Footer />
      <Toaster position="top-center" richColors />
    </div>
  );
}
