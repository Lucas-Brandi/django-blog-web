import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  createMemoryRouter,
  RouterProvider,
  type RouteObject,
} from 'react-router-dom';
import type { AuthState } from '@/lib/auth';

let authState: AuthState;
vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
  return { ...actual, useAuth: () => authState };
});

import { RequireAuth } from './RequireAuth';

function makeAuthState(overrides: Partial<AuthState> = {}): AuthState {
  return {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    login: vi.fn().mockResolvedValue(undefined),
    register: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    refreshUser: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

/** Monta RequireAuth como rota pai de uma rota protegida "/perfil". */
function renderGuarded(initialPath = '/perfil') {
  const routes: RouteObject[] = [
    {
      element: <RequireAuth />,
      children: [{ path: '/perfil', element: <div>conteúdo protegido</div> }],
    },
    { path: '/login', element: <div>tela de login</div> },
  ];
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('RequireAuth', () => {
  beforeEach(() => {
    authState = makeAuthState();
  });

  it('mostra o estado de carregamento enquanto a sessão é restaurada', () => {
    authState = makeAuthState({ isLoading: true });
    renderGuarded();

    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    expect(screen.queryByText('conteúdo protegido')).not.toBeInTheDocument();
  });

  it('redireciona para /login quando não há usuário autenticado', () => {
    authState = makeAuthState({ isAuthenticated: false });
    const router = renderGuarded();

    expect(router.state.location.pathname).toBe('/login');
    expect(screen.getByText('tela de login')).toBeInTheDocument();
    expect(screen.queryByText('conteúdo protegido')).not.toBeInTheDocument();
  });

  it('guarda a rota de origem em location.state.from ao redirecionar', () => {
    authState = makeAuthState({ isAuthenticated: false });
    const router = renderGuarded();

    const state = router.state.location.state as { from?: { pathname?: string } };
    expect(state?.from?.pathname).toBe('/perfil');
  });

  it('renderiza a rota filha quando o usuário está autenticado', () => {
    authState = makeAuthState({
      isAuthenticated: true,
      user: { username: 'maria', email: 'maria@ex.com', bio: '' },
    });
    renderGuarded();

    expect(screen.getByText('conteúdo protegido')).toBeInTheDocument();
  });
});
