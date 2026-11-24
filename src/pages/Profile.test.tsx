import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AuthState, AuthUser } from '@/lib/auth';
import type { Profile as ApiProfile } from '@/services/users';

const toastSuccess = vi.fn();
const toastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

const updateMe = vi.fn();
const deleteMyImage = vi.fn();
vi.mock('@/services/users', () => ({
  updateMe: (...args: unknown[]) => updateMe(...args),
  deleteMyImage: (...args: unknown[]) => deleteMyImage(...args),
}));

let authState: AuthState;
vi.mock('@/lib/auth', async () => {
  const actual = await vi.importActual<typeof import('@/lib/auth')>('@/lib/auth');
  return { ...actual, useAuth: () => authState };
});

import Profile from './Profile';

const baseUser: AuthUser = {
  username: 'maria',
  email: 'maria@exemplo.com',
  bio: 'Olá, mundo.',
};

function makeAuthState(user: AuthUser | null = baseUser): AuthState {
  return {
    isAuthenticated: user !== null,
    user,
    isLoading: false,
    login: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    refreshUser: vi.fn().mockResolvedValue(undefined),
  };
}

function apiProfile(overrides: Partial<ApiProfile> = {}): ApiProfile {
  return {
    username: 'maria',
    email: 'maria@exemplo.com',
    bio: 'Olá, mundo.',
    image_url: '',
    ...overrides,
  };
}

describe('Profile', () => {
  beforeEach(() => {
    authState = makeAuthState();
    updateMe.mockReset();
    deleteMyImage.mockReset();
    toastSuccess.mockClear();
    toastError.mockClear();
  });

  it('preenche o formulário com os dados do usuário atual', () => {
    render(<Profile />);
    expect(screen.getByLabelText(/usuário/i)).toHaveValue('maria');
    expect(screen.getByLabelText(/e-mail/i)).toHaveValue('maria@exemplo.com');
    expect(screen.getByLabelText(/bio/i)).toHaveValue('Olá, mundo.');
  });

  it('salva as alterações com updateMe e avisa sucesso', async () => {
    const user = userEvent.setup();
    updateMe.mockResolvedValue(
      apiProfile({ bio: 'Nova bio.', email: 'nova@exemplo.com' }),
    );
    render(<Profile />);

    const emailField = screen.getByLabelText(/e-mail/i);
    await user.clear(emailField);
    await user.type(emailField, 'nova@exemplo.com');

    await user.click(screen.getByRole('button', { name: /salvar alterações/i }));

    await waitFor(() => expect(updateMe).toHaveBeenCalledTimes(1));
    expect(updateMe).toHaveBeenCalledWith(
      expect.objectContaining({ username: 'maria', email: 'nova@exemplo.com' }),
    );
    await waitFor(() =>
      expect(authState.refreshUser).toHaveBeenCalled(),
    );
    expect(toastSuccess).toHaveBeenCalledWith('Perfil atualizado.');
  });

  it('bloqueia o envio e mostra erro local quando o usuário fica vazio', async () => {
    const user = userEvent.setup();
    render(<Profile />);

    await user.clear(screen.getByLabelText(/usuário/i));
    await user.click(screen.getByRole('button', { name: /salvar alterações/i }));

    expect(updateMe).not.toHaveBeenCalled();
    expect(screen.getByText('Informe o usuário.')).toBeInTheDocument();
  });

  it('mostra erros por campo vindos do backend ao salvar', async () => {
    const user = userEvent.setup();
    updateMe.mockRejectedValue({
      message: 'Erro 400',
      status: 400,
      isNetworkError: false,
      fieldErrors: { email: ['Esse e-mail já está em uso.'] },
    });
    render(<Profile />);

    await user.click(screen.getByRole('button', { name: /salvar alterações/i }));

    await waitFor(() =>
      expect(screen.getByText('Esse e-mail já está em uso.')).toBeInTheDocument(),
    );
    expect(toastError).toHaveBeenCalledWith('Confira os campos destacados.');
  });

  it('remove a foto chamando deleteMyImage', async () => {
    const user = userEvent.setup();
    deleteMyImage.mockResolvedValue(apiProfile({ image_url: '' }));
    render(<Profile />);

    await user.click(screen.getByRole('button', { name: /remover foto/i }));

    await waitFor(() => expect(deleteMyImage).toHaveBeenCalledTimes(1));
    expect(toastSuccess).toHaveBeenCalledWith('Foto removida.');
  });

  it('não renderiza nada quando não há usuário', () => {
    authState = makeAuthState(null);
    const { container } = render(<Profile />);
    expect(container).toBeEmptyDOMElement();
  });
});
