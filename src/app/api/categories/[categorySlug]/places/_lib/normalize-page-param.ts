const MIN_PAGE = 1;
const MAX_PAGE = 1000;

export function normalizePageParam(rawPage: string | null): number | null {
  if (!rawPage || !/^\d+$/.test(rawPage)) return null;

  const page = Number(rawPage);
  if (!Number.isSafeInteger(page) || page < MIN_PAGE || page > MAX_PAGE) return null;

  return page;
}
