import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AuthCard } from '@/components/layout/AuthCard';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import { fieldError, getFieldErrors } from '@/lib/formErrors';
import { requestPasswordReset } from '@/services/auth';
import type { FieldErrors } from '@/services/http';

/**
 * Solicitação de redefinição de senha (M14). Pede o e-mail e, após o envio,
 * mostra sempre uma mensagem neutra — não revela se a conta existe.
 */
export default function PasswordResetRequest() {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    if (!email.trim()) {
      setErrors({ email: ['Informe o e-mail.'] });
      return;
    }

    setSubmitting(true);
    try {
      await requestPasswordReset({ email: email.trim() });
      // Mensagem neutra tanto no sucesso quanto quando o backend valida o campo.
      setSent(true);
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      if (fieldErrors.email) {
        setErrors(fieldErrors);
      } else {
        // Qualquer outra falha não deve revelar nada: mantém a mensagem neutra.
        setSent(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <AuthCard
        title="Verifique seu e-mail"
        description="Se houver uma conta com esse e-mail, enviamos um link para redefinir a senha. O link expira em algumas horas."
        footer={
          <Link to="/login" className="text-primary hover:underline">
            Voltar para o login
          </Link>
        }
      >
        <p className="text-sm text-muted-foreground">
          Não recebeu? Confira a caixa de spam ou tente novamente em instantes.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Recuperar senha"
      description="Informe o e-mail da sua conta e enviaremos um link para criar uma nova senha."
      footer={
        <Link to="/login" className="text-primary hover:underline">
          Voltar para o login
        </Link>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
        <FormField
          label="E-mail"
          name="email"
          type="email"
          autoComplete="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldError(errors, 'email')}
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Enviando…' : 'Enviar link'}
        </Button>
      </form>
    </AuthCard>
  );
}
