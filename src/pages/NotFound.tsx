import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

/** Página 404 para rotas não encontradas. */
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <p className="text-6xl font-bold text-muted-foreground">404</p>
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <p className="text-muted-foreground">
        A página que você procura não existe ou foi movida.
      </p>
      <Button render={<Link to="/" />}>Voltar para o início</Button>
    </div>
  );
}
