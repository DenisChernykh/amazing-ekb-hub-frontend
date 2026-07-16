import { describe, expect, it } from 'vitest';
import { buildPlacesPaginationItems } from './build-places-pagination-items';

describe('buildPlacesPaginationItems', () => {
  it('returns every page when the count fits the seven-item window', () => {
    expect(buildPlacesPaginationItems({ page: 3, pageCount: 7 })).toEqual([
      { type: 'page', page: 1 },
      { type: 'page', page: 2 },
      { type: 'page', page: 3 },
      { type: 'page', page: 4 },
      { type: 'page', page: 5 },
      { type: 'page', page: 6 },
      { type: 'page', page: 7 },
    ]);
  });

  it('keeps the first five pages, an end ellipsis, and the boundary page near the start', () => {
    expect(buildPlacesPaginationItems({ page: 2, pageCount: 20 })).toEqual([
      { type: 'page', page: 1 },
      { type: 'page', page: 2 },
      { type: 'page', page: 3 },
      { type: 'page', page: 4 },
      { type: 'page', page: 5 },
      { type: 'ellipsis', key: 'end' },
      { type: 'page', page: 20 },
    ]);
  });

  it('keeps boundary pages, one sibling on each side, and two ellipses in the middle', () => {
    expect(buildPlacesPaginationItems({ page: 10, pageCount: 20 })).toEqual([
      { type: 'page', page: 1 },
      { type: 'ellipsis', key: 'start' },
      { type: 'page', page: 9 },
      { type: 'page', page: 10 },
      { type: 'page', page: 11 },
      { type: 'ellipsis', key: 'end' },
      { type: 'page', page: 20 },
    ]);
  });

  it('keeps the boundary page, a start ellipsis, and the final five pages near the end', () => {
    expect(buildPlacesPaginationItems({ page: 19, pageCount: 20 })).toEqual([
      { type: 'page', page: 1 },
      { type: 'ellipsis', key: 'start' },
      { type: 'page', page: 16 },
      { type: 'page', page: 17 },
      { type: 'page', page: 18 },
      { type: 'page', page: 19 },
      { type: 'page', page: 20 },
    ]);
  });

  it('never emits duplicate page numbers or adjacent ellipses', () => {
    for (let page = 1; page <= 30; page += 1) {
      const items = buildPlacesPaginationItems({ page, pageCount: 30 });
      const pages = items.filter((item) => item.type === 'page').map((item) => item.page);

      expect(new Set(pages).size).toBe(pages.length);
      expect(
        items.some(
          (item, index) => item.type === 'ellipsis' && items[index + 1]?.type === 'ellipsis',
        ),
      ).toBe(false);
    }
  });
});
