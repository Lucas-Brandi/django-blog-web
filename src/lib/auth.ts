/**
 * Estado de autenticação TEMPORÁRIO.
 *
 * TODO(M12): a autenticação de verdade (login, logout, token e dados do
 * usuário) chega na M12. Este arquivo é o ÚNICO ponto que a navbar usa para
 * saber se há um usuário logado. Quando a M12 existir, troque a implementação
 * de `useAuth` por um hook ligado ao contexto/serviço real de autenticação e
 * remova o estado simulado abaixo. A interface pública (`AuthUser`, `AuthState`
 * e `useAuth`) deve ser mantida para não quebrar os componentes de layout.
 */

export interface AuthUser {
  /** Nome exibido na navbar e usado no fallback do avatar. */
  username: string;
  /** URL da foto de perfil. Opcional: sem ela, mostramos as iniciais. */
  imageUrl?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  /** Placeholder de logout. TODO(M12): ligar ao serviço real. */
  logout: () => void;
}

/**
 * Enquanto a M12 não existe, alterne este valor para visualizar os dois
 * estados da navbar (autenticado e anônimo). Mantido isolado de propósito.
 */
const MOCK_IS_AUTHENTICATED = false;

const MOCK_USER: AuthUser = {
  username: 'usuario',
};

/**
 * Hook de acesso ao estado de autenticação.
 *
 * TODO(M12): substituir o corpo por leitura do estado real de autenticação.
 */
export function useAuth(): AuthState {
  return {
    isAuthenticated: MOCK_IS_AUTHENTICATED,
    user: MOCK_IS_AUTHENTICATED ? MOCK_USER : null,
    logout: () => {
      // TODO(M12): chamar o endpoint de logout e limpar o token.
    },
  };
}
