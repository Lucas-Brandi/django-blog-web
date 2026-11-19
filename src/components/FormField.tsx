import { useId } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface FormFieldProps extends React.ComponentProps<'input'> {
  /** Rótulo visível, associado ao input por id. */
  label: string;
  /** Mensagem de erro exibida abaixo do campo (de validação local ou da API). */
  error?: string;
}

/**
 * Campo de formulário acessível: label associado ao input, com exibição de
 * erro e marcação aria-invalid/aria-describedby para leitores de tela.
 */
export function FormField({
  label,
  error,
  className,
  id,
  ...inputProps
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  const errorId = `${fieldId}-error`;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={fieldId}>{label}</Label>
      <Input
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
