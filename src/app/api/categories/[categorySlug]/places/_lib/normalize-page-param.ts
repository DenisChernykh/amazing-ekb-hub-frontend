const MIN_PAGE = 1;
const MAX_PAGE = 1000;

/** Преобразует query-параметр страницы в безопасный номер либо отклоняет его. */
export function normalizePageParam(rawPage: string | null): number | null {
  if (!rawPage || !/^\d+$/.test(rawPage)) return null;

  const page = Number(rawPage);
  if (!Number.isSafeInteger(page) || page < MIN_PAGE || page > MAX_PAGE) return null;

  return page;
}
