import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createMemoryRouter,
  RouterProvider,
  type RouteObject,
} from 'react-router-dom';
import type { AuthState } from '@/lib/auth';
import type { ApiError } from '@/services/http';

// toast (sonner) não tem Toaster montado nos testes; espiamos as chamadas.
const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

// Controla o estado de autenticação consumido por Login via useAuth.
let authState: AuthState;
vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
  return { ...actual, useAuth: () => authState };
});

import Login from './Login';

function makeAuthState(overrides: Partial<AuthState> = {}): AuthState {
  return {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    refreshUser: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

/** Monta o Login num router de memória, com uma rota de destino "/". */
function renderLogin(initialPath = '/login') {
  const routes: RouteObject[] = [
    { path: '/login', element: <Login /> },
    { path: '/', element: <div>home-page</div> },
    { path: '/perfil', element: <div>perfil-page</div> },
  ];
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] });
  render(<RouterProvider router={router} />);
  return router;
}

describe('Login', () => {
  beforeEach(() => {
    authState = makeAuthState();
    toastSuccess.mockClear();
    toastError.mockClear();
  });

  it('exibe os campos de usuário e senha e o botão entrar', () => {
    renderLogin();
    expect(screen.getByLabelText(/usuário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('valida localmente e não chama login quando os campos estão vazios', async () => {
    const user = userEvent.setup();
    renderLogin();

    await user.click(screen.getByRole('button', { name: /entrar/i }));

    expect(authState.login).not.toHaveBeenCalled();
    expect(screen.getByText('Informe o usuário.')).toBeInTheDocument();
    expect(screen.getByText('Informe a senha.')).toBeInTheDocument();
  });

  it('faz login com sucesso e redireciona para a origem', async () => {
    const user = userEvent.setup();
    const login = vi.fn().mockResolvedValue(undefined);
    authState = makeAuthState({ login });
    const router = renderLogin();

    await user.type(screen.getByLabelText(/usuário/i), 'maria');
    await user.type(screen.getByLabelText(/senha/i), 'segredo123');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => expect(login).toHaveBeenCalledWith('maria', 'segredo123'));
    expect(toastSuccess).toHaveBeenCalled();
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
  });

  it('mostra erro por campo e toast quando o backend recusa as credenciais', async () => {
    const user = userEvent.setup();
    const apiError: ApiError = {
      message: 'Credenciais inválidas.',
      status: 401,
      isNetworkError: false,
      fieldErrors: { password: ['Senha incorreta.'] },
    };
    const login = vi.fn().mockRejectedValue(apiError);
    authState = makeAuthState({ login });
    renderLogin();

    await user.type(screen.getByLabelText(/usuário/i), 'maria');
    await user.type(screen.getByLabelText(/senha/i), 'errada');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() =>
      expect(screen.getByText('Senha incorreta.')).toBeInTheDocument(),
    );
    expect(toastError).toHaveBeenCalledWith('Credenciais inválidas.');
  });

  it('redireciona um usuário já autenticado para fora do /login', async () => {
    authState = makeAuthState({ isAuthenticated: true });
    const router = renderLogin();
    await waitFor(() => expect(router.state.location.pathname).toBe('/'));
  });
});
