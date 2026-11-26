import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps extends React.ComponentProps<'input'> {
  /** Rótulo visível, associado ao input por id. */
  label: string;
  /** Mensagem de erro exibida abaixo do campo (de validação local ou da API). */
  error?: string;
  /**
   * Dica fixa exibida abaixo do campo (ex.: formato aceito). Independente do
   * erro: continua visível mesmo quando há mensagem de erro.
   */
  hint?: string;
}

/**
 * Campo de formulário acessível: label associado ao input, com exibição de
 * erro e marcação aria-invalid/aria-describedby para leitores de tela.
 */
export function FormField({
  label,
  error,
  hint,
  className,
  id,
  ...inputProps
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  const describedBy =
    [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(' ') ||
    undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
      {hint && (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
