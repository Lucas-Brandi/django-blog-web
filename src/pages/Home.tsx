import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { getHealth } from '@/services/health';
import type { ApiError } from '@/services/http';

type HealthState =
  | { status: 'loading' }
  | { status: 'ok'; value: string }
  | { status: 'error'; message: string };

/**
 * Página inicial. Faz uma chamada a /api/v1/health/ para validar a conexão
 * com a API (critério de aceite da M10) e avisa o resultado por toast (M11).
 */
export default function Home() {
  const [health, setHealth] = useState<HealthState>({ status: 'loading' });
  const notified = useRef(false);

  useEffect(() => {
    let active = true;

    getHealth()
      .then((res) => {
        if (!active) return;
        setHealth({ status: 'ok', value: res.status });
        if (!notified.current) {
          notified.current = true;
          toast.success('API conectada com sucesso.');
        }
      })
      .catch((err: ApiError) => {
        if (!active) return;
        setHealth({ status: 'error', message: err.message });
        if (!notified.current) {
          notified.current = true;
          toast.error('Não foi possível conectar à API.');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="flex flex-col gap-4">
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
