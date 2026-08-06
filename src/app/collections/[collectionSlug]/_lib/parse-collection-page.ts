/** Нормализует query-параметр страницы публичной подборки. */
export function parseCollectionPage(searchParams: { page?: string | string[] }): number {
  const rawPage = Array.isArray(searchParams.page) ? searchParams.page[0] : searchParams.page;

  if (!rawPage || !/^\d+$/.test(rawPage)) return 1;

  const page = Number(rawPage);
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
}
