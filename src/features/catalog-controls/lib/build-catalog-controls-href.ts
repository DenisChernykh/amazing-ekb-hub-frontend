import { buildPathnameHref } from '@/shared/lib/routing';

type CatalogControlsNextState = {
  search?: string;
  category?: string | null;
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

    return buildPathnameHref('/', toCanonicalCatalogParams(params));
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
    if (next.category === null) {
      params.delete('category');
    } else {
      params.set('category', next.category);
    }
  }

  return buildPathnameHref('/', toCanonicalCatalogParams(params));
}

/**
 * Это хелпер. Восстанавливает стабильный порядок canonical catalog query.
 *
 * @param params - Изменённый canonical query snapshot.
 * @returns Query-параметры в canonical порядке.
 */
function toCanonicalCatalogParams(params: URLSearchParams): URLSearchParams {
  const canonicalParams = new URLSearchParams();

  ['search', 'category', 'pageSize', 'page'].forEach((key) => {
    const value = params.get(key);
    if (value !== null) canonicalParams.set(key, value);
  });

  return canonicalParams;
}
