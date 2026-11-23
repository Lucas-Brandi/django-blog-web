import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext, type AuthState, type AuthUser } from '@/lib/auth';
import * as authApi from '@/services/auth';
import { getMe } from '@/services/users';
import {
  setAuthTokenGetter,
  setAuthTokenRefresher,
} from '@/services/http';
import {
  clearTokens,
  readTokens,
  writeTokens,
  type StoredTokens,
} from '@/lib/tokenStorage';

/**
 * Acrescenta ?v=<versão> à URL da foto. O backend sobrescreve o arquivo quando
 * o nome se repete e devolve a mesma URL; sem isso, o navegador mostraria a
 * foto antiga do cache depois de uma troca.
 */
function withVersion(url: string, version: number): string {
  try {
    const parsed = new URL(url, window.location.origin);
    parsed.searchParams.set('v', String(version));
    return parsed.toString();
  } catch {
    return url;
  }
}

/** Converte o perfil da API no usuário usado pela UI. */
function toAuthUser(
  profile: {
    username: string;
    email: string;
    bio: string;
    image_url: string;
  },
  imageVersion?: number,
): AuthUser {
  const imageUrl = profile.image_url || undefined;
  return {
    username: profile.username,
    email: profile.email,
    bio: profile.bio,
    imageUrl:
      imageUrl && imageVersion !== undefined
        ? withVersion(imageUrl, imageVersion)
        : imageUrl,
  };
}

/**
 * Provedor de autenticação (M12).
 *
 * - Guarda o par de tokens no localStorage (D1, opção C) por meio de
 *   tokenStorage, e mantém o access em memória para o interceptor.
 * - Registra no cliente HTTP como obter o access e como renová-lo no 401.
 * - Ao montar, restaura a sessão: se houver tokens salvos, carrega /users/me/.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tokens em ref: o interceptor lê de forma síncrona, sem re-render.
  const tokensRef = useRef<StoredTokens | null>(readTokens());

  const applyTokens = useCallback((tokens: StoredTokens | null) => {
    tokensRef.current = tokens;
    if (tokens) {
      writeTokens(tokens);
    } else {
      clearTokens();
    }
  }, []);

  const clearSession = useCallback(() => {
    applyTokens(null);
    setUser(null);
  }, [applyTokens]);

  // Renova o access usando o refresh salvo. Em caso de falha, limpa a sessão.
  const doRefresh = useCallback(async (): Promise<string | null> => {
    const current = tokensRef.current;
    if (!current) return null;
    try {
      const pair = await authApi.refresh(current.refresh);
      applyTokens(pair);
      return pair.access;
    } catch {
      clearSession();
      return null;
    }
  }, [applyTokens, clearSession]);

  // Liga o cliente HTTP ao estado de tokens (uma vez).
  useEffect(() => {
    setAuthTokenGetter(() => tokensRef.current?.access ?? null);
    setAuthTokenRefresher(doRefresh);
    return () => {
      setAuthTokenRefresher(null);
    };
  }, [doRefresh]);

  // Chamado depois de login e de edições do perfil: a foto pode ter mudado
  // sem mudar de URL, então marcamos uma versão nova.
  const refreshUser = useCallback(async () => {
    const profile = await getMe();
    setUser(toAuthUser(profile, Date.now()));
  }, []);

  // Restaura a sessão persistida no primeiro carregamento.
  useEffect(() => {
    let active = true;
    async function restore() {
      if (!tokensRef.current) {
        if (active) setIsLoading(false);
        return;
      }
      try {
        const profile = await getMe();
        if (active) setUser(toAuthUser(profile));
      } catch {
        // Token inválido/expirado e refresh falhou: trata como anônimo.
        if (active) clearSession();
      } finally {
        if (active) setIsLoading(false);
      }
    }
    restore();
    return () => {
      active = false;
    };
  }, [clearSession]);

  const login = useCallback(
    async (username: string, password: string) => {
      const pair = await authApi.login({ username, password });
      applyTokens(pair);
      try {
        await refreshUser();
      } catch (err) {
        // Login ok, mas não foi possível carregar o perfil: desfaz a sessão.
        clearSession();
        throw err;
      }
    },
    [applyTokens, clearSession, refreshUser],
  );

  const logout = useCallback(async () => {
    const current = tokensRef.current;
    if (current) {
      try {
        await authApi.logout(current.refresh);
      } catch {
        // Logout é best-effort: mesmo se o backend falhar, limpamos localmente.
      }
    }
    clearSession();
  }, [clearSession]);

  const value = useMemo<AuthState>(
    () => ({
      isAuthenticated: user !== null,
      user,
      isLoading,
      login,
      logout,
      refreshUser,
    }),
    [user, isLoading, login, logout, refreshUser],
  );

  return <AuthContext value={value}>{children}</AuthContext>;
}
