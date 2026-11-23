import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import { getErrorMessage } from '@/lib/formErrors';
import { deleteComment, type Comment } from '@/services/comments';

interface CommentItemProps {
  comment: Comment;
  /** Se o usuário atual pode excluir (heurística: autor do comentário ou do post). */
  canDelete: boolean;
  /** Avisa o pai que o comentário foi removido, para atualizar a lista. */
  onDeleted: (id: number) => void;
}

/** Iniciais usadas no fallback do avatar. */
function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

/** Um comentário: autor, data, conteúdo e (quando permitido) excluir. */
export function CommentItem({ comment, canDelete, onDeleted }: CommentItemProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteComment(comment.id);
      onDeleted(comment.id);
      setOpen(false);
      toast.success('Comentário excluído.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Não foi possível excluir.'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <li className="flex gap-3">
      <Avatar size="sm" className="mt-0.5">
        {comment.author.image_url && (
          <AvatarImage
            src={comment.author.image_url}
            alt={comment.author.username}
          />
        )}
        <AvatarFallback>{getInitials(comment.author.username)}</AvatarFallback>
      </Avatar>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {comment.author.username}
          </span>
          <time
            dateTime={comment.created_at}
            className="text-xs text-muted-foreground"
          >
            {formatDate(comment.created_at)}
          </time>
          {canDelete && (
            <AlertDialog open={open} onOpenChange={setOpen}>
              <AlertDialogTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label="Excluir comentário"
                    className="ml-auto text-muted-foreground"
                  />
                }
              >
                <Trash2 />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir este comentário?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O comentário será removido permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={(event) => {
                      event.preventDefault();
                      handleDelete();
                    }}
                    disabled={deleting}
                  >
                    {deleting ? 'Excluindo…' : 'Excluir'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-line">
          {comment.content}
        </p>
      </div>
    </li>
  );
}
