import { buildPathnameHref } from '@/shared/lib/routing';

type BuildPlacesPaginationHrefOptions = {
  currentSearchParams: string;
  page: number;
};

/**
 * Это хелпер. Строит canonical href после перехода на страницу каталога.
 *
 * @param options - Canonical query snapshot и следующая страница.
 * @returns Относительный href домашнего каталога.
 */
export function buildPlacesPaginationHref({
  currentSearchParams,
  page,
}: BuildPlacesPaginationHrefOptions): string {
  const params = new URLSearchParams(currentSearchParams);

  if (page === 1) {
    params.delete('page');
  } else {
    params.set('page', String(page));
  }

  return buildPathnameHref('/', params);
}
