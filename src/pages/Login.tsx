import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthCard } from '@/components/layout/AuthCard';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { fieldError, getErrorMessage, getFieldErrors } from '@/lib/formErrors';
import type { FieldErrors } from '@/services/http';

interface LocationState {
  from?: { pathname?: string };
}

/**
 * Tela de login (M13). Usuário e senha, link de recuperação e redirecionamento
 * para a rota de origem (ou a home). Usuário já logado é mandado embora.
 */
export default function Login() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as LocationState | null)?.from?.pathname ?? '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Usuário já autenticado que abre /login é redirecionado (critério M13).
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, from, navigate]);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!username.trim()) next.username = ['Informe o usuário.'];
    if (!password) next.password = ['Informe a senha.'];
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting || !validate()) return;

    setSubmitting(true);
    try {
      await login(username.trim(), password);
      toast.success('Login realizado com sucesso.', { duration: 2000 });
      navigate(from, { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, 'Não foi possível entrar.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Entrar"
      description="Acesse sua conta para continuar."
      footer={
        <>
          Não tem conta?{' '}
          <Link to="/registrar" className="text-primary hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <FormField
          label="Usuário"
          name="username"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={fieldError(errors, 'username')}
        />
        <FormField
          label="Senha"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldError(errors, 'password')}
        />
        <div className="text-right text-sm">
          <Link
            to="/password-reset"
            className="text-muted-foreground hover:text-foreground hover:underline"
          >
            Esqueci a senha
          </Link>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </form>
    </AuthCard>
  );
}
