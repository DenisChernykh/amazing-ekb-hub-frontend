import { describe, expect, it } from 'vitest';
import { getPlacesCatalogEmptyState } from './get-places-catalog-empty-state';

describe('getPlacesCatalogEmptyState', () => {
  it('uses page empty state when current page has no items but catalog has results', () => {
    expect(
      getPlacesCatalogEmptyState({
        hasActiveFilters: false,
        total: 2,
        resetHref: '/',
        firstPageHref: '/?pageSize=1',
      }),
    ).toEqual({
      kind: 'page',
      resetHref: '/?pageSize=1',
    });
  });

  it('uses filtered empty state only when filters are active and total is zero', () => {
    expect(
      getPlacesCatalogEmptyState({
        hasActiveFilters: true,
        total: 0,
        resetHref: '/?pageSize=40',
        firstPageHref: '/?pageSize=40&search=spa',
      }),
    ).toEqual({
      kind: 'filtered',
      resetHref: '/?pageSize=40',
    });
  });

  it('uses generic empty state when there are no filters and no catalog results', () => {
    expect(
      getPlacesCatalogEmptyState({
        hasActiveFilters: false,
        total: 0,
        resetHref: '/',
        firstPageHref: '/',
      }),
    ).toEqual({});
  });
});
