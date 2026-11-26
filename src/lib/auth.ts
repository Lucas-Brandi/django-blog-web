import { createContext, useContext } from 'react';
import type { RegisterPayload } from '@/services/auth';

/**
 * Estado de autenticação da aplicação (M12).
 *
 * A interface pública (AuthUser, AuthState, useAuth) é a mesma que os
 * componentes de layout consomem. A implementação real vive no AuthProvider
 * (`src/components/AuthProvider.tsx`); aqui ficam apenas o contexto e o hook.
 */

export interface AuthUser {
  /** Nome exibido na navbar e usado no fallback do avatar. */
  username: string;
  /** E-mail do usuário autenticado. */
  email: string;
  /** Biografia do perfil (pode ser vazia). */
  bio: string;
  /** URL da foto de perfil. Opcional: sem ela, mostramos as iniciais. */
  imageUrl?: string;
}

export interface AuthState {
  /** true quando há um usuário com sessão válida carregada. */
  isAuthenticated: boolean;
  /** Dados do usuário atual, ou null quando anônimo. */
  user: AuthUser | null;
  /**
   * true enquanto a sessão persistida está sendo restaurada no primeiro
   * carregamento. Rotas protegidas aguardam isto antes de redirecionar.
   */
  isLoading: boolean;
  /** Faz login e carrega o usuário. Lança ApiError em caso de falha. */
  login: (username: string, password: string) => Promise<void>;
  /**
   * Cadastra o usuário e já o deixa logado (o backend devolve os tokens no
   * register). Lança ApiError em caso de falha.
   */
  register: (payload: RegisterPayload) => Promise<void>;
  /** Revoga o refresh token (best-effort) e limpa o estado local. */
  logout: () => Promise<void>;
  /** Recarrega os dados do usuário a partir de GET /users/me/. */
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

/** Acesso ao estado de autenticação. Deve estar dentro de <AuthProvider>. */
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  }
  return ctx;
}
