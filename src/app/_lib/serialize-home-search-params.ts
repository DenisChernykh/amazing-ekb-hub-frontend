import {
  listPlacesQueryPageDefault,
  listPlacesQueryPageSizeDefault,
} from '@/shared/api/generated-zod/places/places.zod';
import type { ResolvedCatalogState } from './resolve-catalog-state';

/**
 * Это хелпер. Сериализует resolved catalog state в canonical public query string.
 *
 * @param state - Согласованное состояние каталога.
 * @returns Query string без default-значений и backend category id.
 */
export function serializeHomeSearchParams(state: ResolvedCatalogState): string {
  const { urlState } = state;
  const params = new URLSearchParams();

  if (urlState.search) params.set('search', urlState.search);
  if (urlState.category) params.set('category', urlState.category);
  if (urlState.pageSize !== listPlacesQueryPageSizeDefault) {
    params.set('pageSize', String(urlState.pageSize));
  }
  if (urlState.page !== listPlacesQueryPageDefault) params.set('page', String(urlState.page));

  return params.toString();
}
