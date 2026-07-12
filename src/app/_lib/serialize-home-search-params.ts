import {
  listPlacesQueryPageDefault,
  listPlacesQueryPageSizeDefault,
  listPlacesQuerySortDefault,
} from '@/shared/api/generated-zod/places/places.zod';
import type { ResolvedCatalogState } from './resolve-catalog-state';

/**
 * Это хелпер. Сериализует resolved catalog state в canonical public query string.
 *
 * @param state - Согласованное состояние каталога.
 * @returns Query string без default-значений и backend category id.
 */
export function serializeHomeSearchParams(state: ResolvedCatalogState): string {
  const { query } = state;
  const params = new URLSearchParams();

  if (query.search) params.set('search', query.search);
  if (query.category) params.set('category', query.category);
  if (query.sort !== listPlacesQuerySortDefault) params.set('sort', query.sort);
  if (query.pageSize !== listPlacesQueryPageSizeDefault) {
    params.set('pageSize', String(query.pageSize));
  }
  if (query.page !== listPlacesQueryPageDefault) params.set('page', String(query.page));

  return params.toString();
}
