import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/auth';

/**
 * Rota protegida (M12). Substitui o @login_required do Django.
 *
 * - Enquanto a sessão persistida é restaurada, não decide nada (evita um
 *   redirecionamento indevido no refresh de página).
 * - Sem usuário, redireciona para /login guardando a rota de origem em
 *   location.state.from, para voltar a ela após o login.
 */
export function RequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        className="flex min-h-40 items-center justify-center text-sm text-muted-foreground"
        role="status"
        aria-live="polite"
      >
        Carregando…
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
