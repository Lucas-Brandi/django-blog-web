import { BRAND_NAME } from '@/lib/navigation';

/** Rodapé simples e consistente em todas as rotas. */
export function Footer() {
  return (
    <footer className="border-t border-border text-sm text-muted-foreground">
      <div className="mx-auto flex w-full max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-5">
        <span>{BRAND_NAME}</span>
        <span>Um lugar simples para escrever.</span>
      </div>
    </footer>
  );
}
