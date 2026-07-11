import type { PlaceCategory } from '@/entities/place';
import type { HomeQuery } from './normalize-home-search-params';

export type ResolvedCatalogState = {
  query: HomeQuery;
  categoryId?: string;
};

/**
 * Это хелпер. Сверяет публичный category slug с backend-справочником.
 *
 * @param query - Нормализованное публичное состояние каталога.
 * @param categories - Категории из backend-справочника.
 * @returns Согласованное URL-состояние и backend category id.
 */
export function resolveCatalogState(
  query: HomeQuery,
  categories: PlaceCategory[],
): ResolvedCatalogState {
  if (!query.category) {
    return { query };
  }

  const activeCategory = categories.find((category) => category.slug === query.category);

  if (activeCategory) {
    return {
      query: { ...query, category: activeCategory.slug },
      categoryId: activeCategory.id,
    };
  }

  const resolvedQuery = { ...query };
  delete resolvedQuery.category;

  return { query: resolvedQuery };
}
