import type { PlaceCategory } from '@/entities/place';

type CatalogControlsNextState = {
  search?: string;
  category?: PlaceCategory | 'all';
  reset?: boolean;
};

type BuildCatalogControlsHrefOptions = {
  currentSearchParams: string;
  next: CatalogControlsNextState;
};

/**
 * Это хелпер. Строит URL каталога после изменения поиска, категории или сброса фильтров.
 *
 * @param options - Текущие query-параметры и следующее состояние controls.
 * @returns Относительный href домашнего каталога.
 */
export function buildCatalogControlsHref({
  currentSearchParams,
  next,
}: BuildCatalogControlsHrefOptions): string {
  const params = new URLSearchParams(currentSearchParams);

  params.delete('page');

  if (next.reset) {
    params.delete('search');
    params.delete('category');

    return buildHomeHref(params);
  }

  if (next.search !== undefined) {
    const search = next.search.trim();

    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
  }

  if (next.category !== undefined) {
    if (next.category === 'all') {
      params.delete('category');
    } else {
      params.set('category', next.category);
    }
  }

  return buildHomeHref(params);
}

/**
 * Это хелпер. Превращает query-параметры в относительный href главной страницы.
 *
 * @param params - Подготовленные query-параметры.
 * @returns `/?query` или `/`, если query пустой.
 */
function buildHomeHref(params: URLSearchParams): string {
  const queryString = params.toString();

  return queryString ? `/?${queryString}` : '/';
}
