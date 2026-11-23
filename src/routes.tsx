import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { RequireAuth } from '@/components/RequireAuth';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import PasswordResetRequest from '@/pages/PasswordResetRequest';
import PasswordResetConfirm from '@/pages/PasswordResetConfirm';
import PasswordResetComplete from '@/pages/PasswordResetComplete';
import Profile from '@/pages/Profile';
import PostDetail from '@/pages/PostDetail';
import PostForm from '@/pages/PostForm';
import NotFound from '@/pages/NotFound';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      // Rotas públicas (D2).
      {
        path: '/',
        element: <Home />,
        handle: { title: 'Início' },
      },
      {
        path: '/sobre',
        element: <About />,
        handle: { title: 'Sobre' },
      },
      {
        // Leitura de posts é pública (D2).
        path: '/posts/:id',
        element: <PostDetail />,
        handle: { title: 'Post' },
      },
      {
        path: '/login',
        element: <Login />,
        handle: { title: 'Entrar' },
      },
      {
        path: '/registrar',
        element: <Register />,
        handle: { title: 'Criar conta' },
      },
      {
        path: '/password-reset',
        element: <PasswordResetRequest />,
        handle: { title: 'Recuperar senha' },
      },
      {
        path: '/password-reset/confirm/:uid/:token',
        element: <PasswordResetConfirm />,
        handle: { title: 'Definir nova senha' },
      },
      {
        path: '/password-reset/complete',
        element: <PasswordResetComplete />,
        handle: { title: 'Senha redefinida' },
      },
      // Rotas protegidas (D2): exigem login.
      {
        element: <RequireAuth />,
        children: [
          {
            path: '/perfil',
            element: <Profile />,
            handle: { title: 'Meu perfil' },
          },
          // Criar e editar post exigem login (só o autor edita).
          {
            path: '/posts/new',
            element: <PostForm />,
            handle: { title: 'Novo post' },
          },
          {
            path: '/posts/:id/edit',
            element: <PostForm />,
            handle: { title: 'Editar post' },
          },
        ],
      },
      {
        path: '*',
        element: <NotFound />,
        handle: { title: 'Página não encontrada' },
      },
    ],
  },
]);
