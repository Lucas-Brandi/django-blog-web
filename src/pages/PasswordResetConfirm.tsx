import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AuthCard } from '@/components/layout/AuthCard';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { fieldError, getErrorMessage, getFieldErrors } from '@/lib/formErrors';
import { confirmPasswordReset } from '@/services/auth';
import type { FieldErrors } from '@/services/http';

/**
 * Confirmação de redefinição de senha (M14), na rota
 * /password-reset/confirm/:uid/:token. Recebe uid e token da URL (do link do
 * e-mail), pede a nova senha e confirmação, e trata token inválido/expirado.
 */
export default function PasswordResetConfirm() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [invalidLink, setInvalidLink] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!password) next.new_password = ['Informe a nova senha.'];
    if (!password2) next.new_password2 = ['Confirme a nova senha.'];
    if (password && password2 && password !== password2) {
      next.new_password2 = ['As senhas não conferem.'];
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting || !uid || !token || !validate()) return;

    setSubmitting(true);
    try {
      await confirmPasswordReset({
        uid,
        token,
        new_password: password,
        new_password2: password2,
      });
      toast.success('Senha redefinida com sucesso.');
      navigate('/password-reset/complete', { replace: true });
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      // O backend sinaliza link inválido/expirado pela chave "token".
      if (fieldErrors.token) {
        setInvalidLink(true);
      } else {
        setErrors(fieldErrors);
        toast.error(getErrorMessage(err, 'Não foi possível redefinir a senha.'));
      }
    } finally {
      setSubmitting(false);
    }
  }

  // Link malformado (sem uid/token) ou rejeitado pelo backend.
  if (!uid || !token || invalidLink) {
    return (
      <AuthCard
        title="Link inválido ou expirado"
        description="Este link de redefinição não é mais válido. Solicite um novo para continuar."
        footer={
          <Link to="/login" className="text-primary hover:underline">
            Voltar para o login
          </Link>
        }
      >
        <Button
          className="w-full"
          render={<Link to="/password-reset" />}
        >
          Solicitar novo link
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Definir nova senha"
      description="Escolha uma nova senha para a sua conta."
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <FormField
          label="Nova senha"
          name="new_password"
          type="password"
          autoComplete="new-password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldError(errors, 'new_password')}
        />
        <FormField
          label="Confirmar nova senha"
          name="new_password2"
          type="password"
          autoComplete="new-password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          error={fieldError(errors, 'new_password2')}
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Salvando…' : 'Redefinir senha'}
        </Button>
      </form>
    </AuthCard>
  );
}
