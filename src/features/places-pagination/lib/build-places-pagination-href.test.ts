import { describe, expect, it } from 'vitest';
import { buildPlacesPaginationHref } from './build-places-pagination-href';

describe('buildPlacesPaginationHref', () => {
  it('changes only page and keeps canonical parameters', () => {
    expect(
      buildPlacesPaginationHref({
        currentSearchParams: 'search=spa&category=family-spa&sort=title_asc&pageSize=40&page=2',
        page: 3,
      }),
    ).toBe('/?search=spa&category=family-spa&sort=title_asc&pageSize=40&page=3');
  });

  it('removes page when navigating to the first page', () => {
    expect(
      buildPlacesPaginationHref({
        currentSearchParams: 'search=spa&page=4',
        page: 1,
      }),
    ).toBe('/?search=spa');
  });
});
