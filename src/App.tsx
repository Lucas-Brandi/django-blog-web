import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from '@/components/AuthProvider';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { router } from '@/routes';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
