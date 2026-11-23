import { http } from './http';
import type { Paginated } from './posts';

/** Tag com a contagem de posts associada (M5). */
export interface Tag {
  id: number;
  name: string;
  post_count: number;
}

/**
 * GET /api/v1/tags/ — lista paginada de tags, com a contagem de posts.
 * Leitura pública (D2/D3).
 */
export async function listTags(page = 1): Promise<Paginated<Tag>> {
  const { data } = await http.get<Paginated<Tag>>('/tags/', {
    params: { page },
  });
  return data;
}
