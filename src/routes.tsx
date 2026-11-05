import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import Home from '@/pages/Home';
import About from '@/pages/About';
import NotFound from '@/pages/NotFound';

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
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
        path: '*',
        element: <NotFound />,
        handle: { title: 'Página não encontrada' },
      },
    ],
  },
]);
