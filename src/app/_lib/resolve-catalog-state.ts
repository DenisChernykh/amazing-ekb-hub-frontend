import type { PlaceCategory } from '@/entities/place';
import type { CatalogUrlState } from './normalize-home-search-params';

export type ResolvedCatalogState = {
  urlState: CatalogUrlState;
  categoryId?: string;
};

/**
 * Это хелпер. Сверяет публичный category slug с backend-справочником.
 *
 * @param urlState - Нормализованное публичное URL-состояние каталога.
 * @param categories - Категории из backend-справочника.
 * @returns Согласованное URL-состояние и backend category id.
 */
export function resolveCatalogState(
  urlState: CatalogUrlState,
  categories: PlaceCategory[],
): ResolvedCatalogState {
  if (!urlState.category) {
    return { urlState };
  }

  const activeCategory = categories.find((category) => category.slug === urlState.category);

  if (activeCategory) {
    return {
      urlState: { ...urlState, category: activeCategory.slug },
      categoryId: activeCategory.id,
    };
  }

  const resolvedUrlState = { ...urlState };
  delete resolvedUrlState.category;

  return { urlState: resolvedUrlState };
}
