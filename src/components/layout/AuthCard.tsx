import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AuthCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  /** Conteúdo auxiliar sob o card (ex.: link para outra tela). */
  footer?: React.ReactNode;
}

/**
 * Moldura comum às telas de conta (login, cadastro, recuperação de senha):
 * centraliza um card estreito com título, descrição e o conteúdo do formulário.
 */
export function AuthCard({
  title,
  description,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-4">
      <Card className="p-2">
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      {footer && (
        <div className="text-center text-sm text-muted-foreground">
          {footer}
        </div>
      )}
    </div>
  );
}
