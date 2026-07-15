type PageItem = {
  type: 'page';
  page: number;
};

type EllipsisItem = {
  type: 'ellipsis';
  key: 'start' | 'end';
};

/** Элемент компактной постраничной навигации каталога мест. */
export type PlacesPaginationItem = PageItem | EllipsisItem;

type BuildPlacesPaginationItemsOptions = {
  page: number;
  pageCount: number;
};

const MAX_VISIBLE_ITEMS = 7;

/**
 * Это хелпер. Строит включительный диапазон номеров страниц.
 *
 * @param start - Первый номер.
 * @param end - Последний номер.
 * @returns Последовательность page items.
 */
function buildPageRange(start: number, end: number): PageItem[] {
  return Array.from({ length: end - start + 1 }, (_, index) => ({
    type: 'page',
    page: start + index,
  }));
}

/**
 * Это хелпер. Строит MUI-equivalent compact range с boundary/sibling страницами.
 *
 * @param options - Текущая страница и общее число страниц.
 * @returns Page и ellipsis items в порядке отображения.
 */
export function buildPlacesPaginationItems({
  page,
  pageCount,
}: BuildPlacesPaginationItemsOptions): PlacesPaginationItem[] {
  if (pageCount <= MAX_VISIBLE_ITEMS) {
    return buildPageRange(1, pageCount);
  }

  if (page <= 4) {
    return [
      ...buildPageRange(1, 5),
      { type: 'ellipsis', key: 'end' },
      { type: 'page', page: pageCount },
    ];
  }

  if (page >= pageCount - 3) {
    return [
      { type: 'page', page: 1 },
      { type: 'ellipsis', key: 'start' },
      ...buildPageRange(pageCount - 4, pageCount),
    ];
  }

  return [
    { type: 'page', page: 1 },
    { type: 'ellipsis', key: 'start' },
    ...buildPageRange(page - 1, page + 1),
    { type: 'ellipsis', key: 'end' },
    { type: 'page', page: pageCount },
  ];
}
