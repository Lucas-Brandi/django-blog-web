import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { toast } from 'sonner';
import { FormField } from '@/components/FormField';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';
import { fieldError, getErrorMessage, getFieldErrors } from '@/lib/formErrors';
import { deleteMyImage, updateMe } from '@/services/users';
import type { FieldErrors } from '@/services/http';

/** Limite da bio, igual ao max_length do model Profile no backend. */
const BIO_MAX_LENGTH = 300;

/** Tipos de imagem aceitos no envio da foto. */
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png'];

/** Iniciais usadas no fallback do avatar. */
function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

/**
 * Tela de perfil (M17, rota protegida). Cabeçalho com avatar, usuário e bio;
 * formulário com usuário, e-mail, foto (com pré-visualização) e bio, salvo
 * com PATCH /users/me/ em multipart/form-data. A foto pode ser removida com
 * DELETE /users/me/image/. Depois de salvar, o AuthProvider é recarregado e a
 * navbar passa a mostrar o novo avatar.
 */
export default function Profile() {
  const { user, refreshUser } = useAuth();

  // Profile só renderiza dentro de RequireAuth, então o usuário já está
  // carregado; inicializamos o formulário diretamente a partir dele.
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [bio, setBio] = useState(user?.bio ?? '');
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Libera a URL da pré-visualização quando ela muda ou a tela é desmontada.
  useEffect(() => {
    if (!previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function selectImage(file: File | null) {
    setImage(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
    if (!file && fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    if (file && !ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: ['Envie uma imagem JPG ou PNG.'] }));
      selectImage(null);
      return;
    }
    setErrors((prev) => {
      const next = { ...prev };
      delete next.image;
      return next;
    });
    selectImage(file);
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!username.trim()) next.username = ['Informe o usuário.'];
    if (!email.trim()) next.email = ['Informe o e-mail.'];
    if (bio.length > BIO_MAX_LENGTH) {
      next.bio = [`A bio pode ter no máximo ${BIO_MAX_LENGTH} caracteres.`];
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting || removing || !validate()) return;

    setSubmitting(true);
    try {
      const saved = await updateMe({
        username: username.trim(),
        email: email.trim(),
        bio: bio.trim(),
        image: image ?? undefined,
      });
      setUsername(saved.username);
      setEmail(saved.email);
      setBio(saved.bio);
      selectImage(null);
      setErrors({});
      await refreshUser();
      toast.success('Perfil atualizado.');
    } catch (err) {
      const fieldErrors = getFieldErrors(err);
      setErrors(fieldErrors);
      // Com erros por campo, o detalhe já aparece junto de cada campo.
      toast.error(
        Object.keys(fieldErrors).length > 0
          ? 'Confira os campos destacados.'
          : getErrorMessage(err, 'Não foi possível salvar o perfil.'),
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemoveImage() {
    if (submitting || removing) return;

    setRemoving(true);
    try {
      await deleteMyImage();
      selectImage(null);
      await refreshUser();
      toast.success('Foto removida.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível remover a foto.'));
    } finally {
      setRemoving(false);
    }
  }

  if (!user) return null;

  const busy = submitting || removing;
  const bioError = fieldError(errors, 'bio');
  const imageError = fieldError(errors, 'image');
  const avatarSrc = previewUrl ?? user.imageUrl;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      {/* Cabeçalho: dados salvos do usuário. */}
      <div className="flex items-center gap-4">
        <Avatar className="size-20">
          {user.imageUrl && <AvatarImage src={user.imageUrl} alt={user.username} />}
          <AvatarFallback className="text-xl">
            {getInitials(user.username)}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="truncate text-3xl font-bold">{user.username}</h1>
          <p className="whitespace-pre-line break-words text-muted-foreground">
            {user.bio || 'Sem bio por enquanto.'}
          </p>
        </div>
      </div>

      <Card className="p-2">
        <CardHeader>
          <CardTitle className="text-lg">Editar perfil</CardTitle>
          <CardDescription>
            Essas informações identificam você no blog.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="flex flex-col gap-6"
            onSubmit={handleSubmit}
            noValidate
          >
            <fieldset className="flex flex-col gap-4" disabled={busy}>
              <legend className="mb-2 text-sm font-semibold">
                Informações básicas
              </legend>
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
            </fieldset>

            <fieldset className="flex flex-col gap-3" disabled={busy}>
              <legend className="mb-2 text-sm font-semibold">
                Foto de perfil
              </legend>
              <div className="flex items-center gap-4">
                <Avatar className="size-16">
                  {avatarSrc && (
                    <AvatarImage
                      src={avatarSrc}
                      alt={previewUrl ? 'Pré-visualização da nova foto' : user.username}
                    />
                  )}
                  <AvatarFallback>{getInitials(user.username)}</AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <Label htmlFor="image">Nova foto</Label>
                  {/* Input nativo escondido: o texto "Nenhum arquivo
                      escolhido" é do navegador e não pode ser alterado, então
                      disparamos o seletor por um botão próprio. */}
                  <input
                    ref={fileInputRef}
                    id="image"
                    name="image"
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(',')}
                    onChange={handleImageChange}
                    aria-invalid={imageError ? true : undefined}
                    aria-describedby={imageError ? 'image-hint image-error' : 'image-hint'}
                    className="sr-only"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Escolher foto
                    </Button>
                    {image && (
                      <span className="min-w-0 truncate text-sm text-muted-foreground">
                        {image.name}
                      </span>
                    )}
                  </div>
                  <p id="image-hint" className="text-xs text-muted-foreground">
                    JPG ou PNG. Imagens grandes são redimensionadas
                    automaticamente.
                  </p>
                  {imageError && (
                    <p id="image-error" className="text-sm text-destructive">
                      {imageError}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                >
                  {removing ? 'Removendo…' : 'Remover foto'}
                </Button>
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-1.5" disabled={busy}>
              <div className="flex items-baseline justify-between">
                <Label htmlFor="bio">Bio</Label>
                <span id="bio-count" className="text-xs text-muted-foreground">
                  {bio.length}/{BIO_MAX_LENGTH}
                </span>
              </div>
              <Textarea
                id="bio"
                name="bio"
                rows={3}
                maxLength={BIO_MAX_LENGTH}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                aria-invalid={bioError ? true : undefined}
                aria-describedby={bioError ? 'bio-count bio-error' : 'bio-count'}
              />
              {bioError && (
                <p id="bio-error" className="text-sm text-destructive">
                  {bioError}
                </p>
              )}
            </fieldset>

            <div className="flex justify-end">
              <Button type="submit" disabled={busy}>
                {submitting ? 'Salvando…' : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
