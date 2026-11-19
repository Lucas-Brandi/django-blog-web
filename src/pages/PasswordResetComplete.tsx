import { Link } from 'react-router-dom';
import { AuthCard } from '@/components/layout/AuthCard';
import { Button } from '@/components/ui/button';

/**
 * Conclusão da redefinição de senha (M14). Confirma o sucesso e oferece o
 * caminho para o login.
 */
export default function PasswordResetComplete() {
  return (
    <AuthCard
      title="Senha redefinida"
      description="Sua senha foi alterada com sucesso. Agora você já pode entrar com a nova senha."
    >
      <Button className="w-full" render={<Link to="/login" />}>
        Ir para o login
      </Button>
    </AuthCard>
  );
}
