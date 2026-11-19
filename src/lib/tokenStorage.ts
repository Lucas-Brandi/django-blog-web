/**
 * Armazenamento dos tokens JWT.
 *
 * Decisão D1 (opção C): access e refresh ficam no localStorage, para que a
 * sessão sobreviva ao recarregar a página (critério de aceite da M12). Como o
 * backend entrega os tokens no corpo (não em cookie httpOnly), este é o ponto
 * único de persistência; qualquer troca de estratégia acontece só aqui.
 */

const ACCESS_KEY = 'auth.access';
const REFRESH_KEY = 'auth.refresh';

export interface StoredTokens {
  access: string;
  refresh: string;
}

/** Lê o par de tokens salvo, ou null se não houver sessão persistida. */
export function readTokens(): StoredTokens | null {
  try {
    const access = localStorage.getItem(ACCESS_KEY);
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (access && refresh) {
      return { access, refresh };
    }
  } catch {
    // localStorage pode estar indisponível (modo privado, etc.).
  }
  return null;
}

/** Persiste o par de tokens. */
export function writeTokens(tokens: StoredTokens): void {
  try {
    localStorage.setItem(ACCESS_KEY, tokens.access);
    localStorage.setItem(REFRESH_KEY, tokens.refresh);
  } catch {
    // Sem persistência: a sessão vale só enquanto a aba estiver aberta.
  }
}

/** Remove o par de tokens (logout). */
export function clearTokens(): void {
  try {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    // Ignora falhas de acesso ao localStorage.
  }
}
