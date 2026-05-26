/**
 * Модель empty-state каталога мест.
 */
export type PlacesCatalogEmptyState =
  | {
      kind?: 'generic';
      resetHref?: never;
    }
  | {
      kind: 'filtered' | 'page';
      resetHref: string;
    };

type GetPlacesCatalogEmptyStateOptions = {
  hasActiveFilters: boolean;
  total: number;
  resetHref: string;
  firstPageHref: string;
};

/**
 * Это хелпер. Выбирает empty-state каталога без вложенных JSX-тернарников.
 *
 * @param options - Признаки текущего состояния каталога.
 * @returns Props для `PlacesCatalogEmpty`.
 */
export function getPlacesCatalogEmptyState(
  options: GetPlacesCatalogEmptyStateOptions,
): PlacesCatalogEmptyState {
  if (options.total > 0) {
    return {
      kind: 'page',
      resetHref: options.firstPageHref,
    };
  }

  if (options.hasActiveFilters) {
    return {
      kind: 'filtered',
      resetHref: options.resetHref,
    };
  }

  return {};
}
