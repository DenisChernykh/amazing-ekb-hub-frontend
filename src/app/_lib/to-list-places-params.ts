import type { ListPlacesParams } from '@/shared/api/generated/operation/listPlacesParams';
import type { ResolvedCatalogState } from './resolve-catalog-state';

/**
 * Это хелпер. Преобразует resolved catalog state в query generated `/places` client.
 *
 * @param state - Согласованное публичное и backend-состояние каталога.
 * @returns Параметры запроса списка мест.
 */
export function toListPlacesParams(state: ResolvedCatalogState): ListPlacesParams {
  const { query, categoryId } = state;

  return {
    page: query.page,
    pageSize: query.pageSize,
    sort: query.sort,
    ...(query.search ? { search: query.search } : {}),
    ...(categoryId ? { categoryId } : {}),
  };
}
