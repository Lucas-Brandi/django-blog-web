import { useEffect, useState } from 'react';
import { getHealth } from '@/services/health';
import type { ApiError } from '@/services/http';

type HealthState =
  | { status: 'loading' }
  | { status: 'ok'; value: string }
  | { status: 'error'; message: string };

/**
 * Página inicial. Faz uma chamada a /api/v1/health/ para validar a conexão
 * com a API (critério de aceite da M10).
 */
export default function Home() {
  const [health, setHealth] = useState<HealthState>({ status: 'loading' });

  useEffect(() => {
    let active = true;

    getHealth()
      .then((res) => {
        if (active) setHealth({ status: 'ok', value: res.status });
      })
      .catch((err: ApiError) => {
        if (active) setHealth({ status: 'error', message: err.message });
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold">django-blog</h1>
      <p className="text-muted-foreground">Fundação do front (M10).</p>

      <div className="rounded-lg border border-border px-4 py-3 text-sm">
        {health.status === 'loading' && <span>Verificando a API…</span>}
        {health.status === 'ok' && (
          <span className="text-green-600">
            API conectada: health = {health.value}
          </span>
        )}
        {health.status === 'error' && (
          <span className="text-destructive">
            Falha ao conectar à API: {health.message}
          </span>
        )}
      </div>
    </div>
  );
}
