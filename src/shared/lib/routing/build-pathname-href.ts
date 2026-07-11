/**
 * Это хелпер. Собирает относительный href из pathname и URLSearchParams.
 *
 * @param pathname - Путь без query string.
 * @param params - Готовые query-параметры.
 * @returns Pathname с query string или без него, если параметры пусты.
 */
export function buildPathnameHref(pathname: string, params: URLSearchParams): string {
  const queryString = params.toString();

  return queryString ? `${pathname}?${queryString}` : pathname;
}
