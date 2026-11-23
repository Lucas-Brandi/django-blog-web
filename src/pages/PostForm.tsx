import { useEffect, useId, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { FormField } from '@/components/FormField';
import { TagSelect } from '@/components/posts/TagSelect';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth';
import { fieldError, getErrorMessage, getFieldErrors } from '@/lib/formErrors';
import { isAuthor } from '@/lib/postAuthor';
import { createPost, getPost, updatePost } from '@/services/posts';
import type { FieldErrors } from '@/services/http';

const TITLE_MAX = 100;

/** Converte o id da rota em número; valores inválidos viram NaN. */
function parseId(value: string | undefined): number {
  return Number(value);
}

type LoadState = 'idle' | 'loading' | 'error';

/**
 * Formulário de criar/editar post (M19). A mesma página atende /posts/new e
 * /posts/:id/edit (rotas protegidas). No modo edição, carrega o post e só
 * permite seguir se o usuário for o autor; caso contrário, volta ao detalhe.
 */
export default function PostForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = id !== undefined;
  const postId = parseId(id);
  const tagsLabelId = useId();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>(
    isEdit ? 'loading' : 'idle',
  );

  // Modo edição: carrega o post e protege contra editar post de terceiros.
  useEffect(() => {
    if (!isEdit) return;
    let active = true;
    // Id inválido cai no catch, sem setState síncrono dentro do efeito.
    const request = Number.isInteger(postId)
      ? getPost(postId)
      : Promise.reject(new Error('id inválido'));
    request
      .then((post) => {
        if (!active) return;
        if (!isAuthor(post.author, user)) {
          toast.error('Você não pode editar este post.');
          navigate(`/posts/${postId}`, { replace: true });
          return;
        }
        setTitle(post.title);
        setContent(post.content);
        setTags(post.tags);
        setLoadState('idle');
      })
      .catch(() => {
        if (active) setLoadState('error');
      });
    return () => {
      active = false;
    };
  }, [isEdit, postId, user, navigate]);

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!title.trim()) next.title = ['Informe o título.'];
    else if (title.trim().length > TITLE_MAX)
      next.title = [`O título deve ter no máximo ${TITLE_MAX} caracteres.`];
    if (!content.trim()) next.content = ['Escreva o conteúdo.'];
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting || !validate()) return;

    setSubmitting(true);
    const payload = {
      title: title.trim(),
      content: content.trim(),
      tags,
    };
    try {
      const post = isEdit
        ? await updatePost(postId, payload)
        : await createPost(payload);
      setErrors({});
      toast.success(isEdit ? 'Post atualizado.' : 'Post criado.');
      // Vai para o detalhe do post salvo (critério da M19).
      navigate(`/posts/${post.id}`);
    } catch (err) {
      setErrors(getFieldErrors(err));
      toast.error(getErrorMessage(err, 'Não foi possível salvar o post.'));
    } finally {
      setSubmitting(false);
    }
  }

  if (loadState === 'loading') {
    return (
      <div className="mx-auto flex w-full max-w-xl flex-col gap-4" aria-busy="true">
        <span className="sr-only">Carregando post…</span>
        <Skeleton className="h-9 w-1/2" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (loadState === 'error') {
    return (
      <div
        role="alert"
        className="mx-auto flex w-full max-w-xl flex-col items-center gap-3 rounded-lg border border-border p-6 text-center"
      >
        <p className="text-destructive">
          Não foi possível carregar o post para edição.
        </p>
        <Button variant="outline" nativeButton={false} render={<Link to="/" />}>
          Voltar para a home
        </Button>
      </div>
    );
  }

  const contentError = fieldError(errors, 'content');

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold">
          {isEdit ? 'Editar post' : 'Novo post'}
        </h1>
        <p className="text-muted-foreground">
          {isEdit
            ? 'Atualize o título, o conteúdo e as tags.'
            : 'Compartilhe algo novo no blog.'}
        </p>
      </div>

      <Card className="p-2">
        <CardHeader>
          <CardTitle className="text-lg">Conteúdo do post</CardTitle>
          <CardDescription>
            O título tem no máximo {TITLE_MAX} caracteres.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <FormField
              label="Título"
              name="title"
              value={title}
              maxLength={TITLE_MAX}
              onChange={(e) => setTitle(e.target.value)}
              error={fieldError(errors, 'title')}
            />

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="content">Conteúdo</Label>
              <Textarea
                id="content"
                name="content"
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                aria-invalid={contentError ? true : undefined}
                aria-describedby={contentError ? 'content-error' : undefined}
              />
              {contentError && (
                <p id="content-error" className="text-sm text-destructive">
                  {contentError}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label id={tagsLabelId}>Tags</Label>
              <TagSelect value={tags} onChange={setTags} labelId={tagsLabelId} />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                nativeButton={false}
                render={
                  <Link to={isEdit ? `/posts/${postId}` : '/'} />
                }
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? 'Salvando…'
                  : isEdit
                    ? 'Salvar alterações'
                    : 'Publicar'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
