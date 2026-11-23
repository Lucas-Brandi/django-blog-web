import { useState, type FormEvent } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getErrorMessage } from '@/lib/formErrors';
import { createComment, type Comment } from '@/services/comments';

interface CommentFormProps {
  postId: number;
  /** Avisa o pai do comentário criado, para adicioná-lo à lista. */
  onCreated: (comment: Comment) => void;
}

/** Formulário de novo comentário (para usuários logados). */
export function CommentForm({ postId, onCreated }: CommentFormProps) {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = content.trim();
    if (submitting || !trimmed) return;

    setSubmitting(true);
    try {
      const comment = await createComment(postId, trimmed);
      onCreated(comment);
      setContent('');
      toast.success('Comentário publicado.', { duration: 1500 });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível comentar.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
      <Label htmlFor="comment-content">Deixe um comentário</Label>
      <Textarea
        id="comment-content"
        name="content"
        rows={3}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escreva algo…"
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={submitting || !content.trim()}>
          {submitting ? 'Publicando…' : 'Comentar'}
        </Button>
      </div>
    </form>
  );
}
