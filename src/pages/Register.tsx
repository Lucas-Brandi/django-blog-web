import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthCard } from '@/components/layout/AuthCard';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { fieldError, getErrorMessage, getFieldErrors } from '@/lib/formErrors';
import { register } from '@/services/auth';
import type { FieldErrors } from '@/services/http';

/**
 * Tela de cadastro (M13). Usuário, e-mail, senha e confirmação. Ao concluir,
 * leva ao login com um toast de sucesso. Exibe os erros da API por campo.
 */
export default function Register() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  // Usuário já logado não precisa se cadastrar: manda para a home.
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!username.trim()) next.username = ['Informe o usuário.'];
    if (!email.trim()) next.email = ['Informe o e-mail.'];
    if (!password) next.password = ['Informe a senha.'];
    if (!password2) next.password2 = ['Confirme a senha.'];
    if (password && password2 && password !== password2) {
      next.password2 = ['As senhas não conferem.'];
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting || !validate()) return;

    setSubmitting(true);
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
        password2,
      });
      toast.success('Conta criada. Faça login para continuar.', {
        duration: 2000,
      });
      navigate('/login', { replace: true });
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, 'Não foi possível criar a conta.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthCard
      title="Criar conta"
      description="Preencha os dados para começar."
      footer={
        <>
          Já tem conta?{' '}
          <Link to="/login" className="text-primary hover:underline">
            Entrar
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
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldError(errors, 'email')}
        />
        <FormField
          label="Senha"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldError(errors, 'password')}
        />
        <FormField
          label="Confirmar senha"
          name="password2"
          type="password"
          autoComplete="new-password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          error={fieldError(errors, 'password2')}
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Criando…' : 'Criar conta'}
        </Button>
      </form>
    </AuthCard>
  );
}
