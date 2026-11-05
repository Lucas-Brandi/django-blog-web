import { http } from './http';

export interface HealthResponse {
  status: string;
}

/** GET /api/v1/health/ — usado para validar a conexão com a API (M1). */
export async function getHealth(): Promise<HealthResponse> {
  const { data } = await http.get<HealthResponse>('/health/');
  return data;
}
