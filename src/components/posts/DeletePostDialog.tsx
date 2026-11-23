import { useState } from 'react';
import { Trash2 } from 'lucide-react';
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

interface DeletePostDialogProps {
  /** Título do post, exibido na confirmação. */
  postTitle: string;
  /** Executa a exclusão; deve lançar em caso de erro. */
  onConfirm: () => Promise<void>;
}

/**
 * Botão "Excluir" com confirmação (alert-dialog) antes de apagar um post.
 * Mantém o diálogo aberto e o botão em estado de carregamento até a exclusão
 * terminar; em caso de erro, o chamador (onConfirm) trata a notificação.
 */
export function DeletePostDialog({
  postTitle,
  onConfirm,
}: DeletePostDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleConfirm() {
    if (deleting) return;
    setDeleting(true);
    try {
      await onConfirm();
      setOpen(false);
    } catch {
      // onConfirm cuida do feedback de erro; mantemos o diálogo aberto.
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={<Button variant="destructive" />}
      >
        <Trash2 />
        Excluir
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir este post?</AlertDialogTitle>
          <AlertDialogDescription>
            O post “{postTitle}” será removido permanentemente. Esta ação não
            pode ser desfeita.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={(event) => {
              // Impede o fechamento automático: fechamos só após concluir.
              event.preventDefault();
              handleConfirm();
            }}
            disabled={deleting}
          >
            {deleting ? 'Excluindo…' : 'Excluir'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
