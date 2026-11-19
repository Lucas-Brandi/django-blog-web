import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { FormField } from '@/components/FormField';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/lib/auth';
import { fieldError, getErrorMessage, getFieldErrors } from '@/lib/formErrors';
import { updateMe } from '@/services/users';
import type { FieldErrors } from '@/services/http';

/**
 * Tela de perfil (rota protegida, usada como critério de aceite da M12).
 * Lê os dados do usuário atual do AuthProvider e permite editar username,
 * e-mail e bio via PATCH /users/me/.
 */
export default function Profile() {
  const { user, refreshUser } = useAuth();

  // Profile só renderiza dentro de RequireAuth, então o usuário já está
  // carregado; inicializamos o formulário diretamente a partir dele.
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!username.trim()) next.username = ['Informe o usuário.'];
    if (!email.trim()) next.email = ['Informe o e-mail.'];
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting || !validate()) return;

    setSubmitting(true);
    try {
      await updateMe({
        username: username.trim(),
        email: email.trim(),
        bio: bio.trim(),
      });
      await refreshUser();
      setErrors({});
      toast.success('Perfil atualizado.');
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, 'Não foi possível salvar o perfil.'));
    } finally {
      setSubmitting(false);
    }
  }

  const bioError = fieldError(errors, 'bio');

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">Meu perfil</h1>
        <p className="text-muted-foreground">
          Atualize seus dados de conta.
        </p>
      </div>

      <Card className="p-2">
        <CardHeader>
          <CardTitle className="text-lg">Dados da conta</CardTitle>
          <CardDescription>
            Essas informações identificam você no blog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-4"
            onSubmit={handleSubmit}
            noValidate
          >
            <FormField
              label="Usuário"
              name="username"
              autoComplete="username"
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
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="bio">Bio</Label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                maxLength={300}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                aria-invalid={bioError ? true : undefined}
                aria-describedby={bioError ? 'bio-error' : undefined}
                className="w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"
              />
              {bioError && (
                <p id="bio-error" className="text-sm text-destructive">
                  {bioError}
                </p>
              )}
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Salvando…' : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
