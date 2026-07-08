import { describe, expect, it } from 'vitest';
import { buildCatalogControlsHref } from './build-catalog-controls-href';

describe('buildCatalogControlsHref', () => {
  it('trims search, writes it to the URL, and resets pagination', () => {
    expect(
      buildCatalogControlsHref({
        currentSearchParams: 'page=3&pageSize=40&category=spa',
        next: { search: '  бассейн  ' },
      }),
    ).toBe('/?pageSize=40&category=spa&search=%D0%B1%D0%B0%D1%81%D1%81%D0%B5%D0%B9%D0%BD');
  });

  it('removes search when the next search value is empty', () => {
    expect(
      buildCatalogControlsHref({
        currentSearchParams: 'page=2&pageSize=40&search=spa&category=spa',
        next: { search: '   ' },
      }),
    ).toBe('/?pageSize=40&category=spa');
  });

  it('writes a category value and resets pagination', () => {
    expect(
      buildCatalogControlsHref({
        currentSearchParams: 'page=4&pageSize=20&search=spa',
        next: { category: 'family-spa' },
      }),
    ).toBe('/?pageSize=20&search=spa&category=family-spa');
  });

  it('writes all as a real dynamic category slug', () => {
    expect(
      buildCatalogControlsHref({
        currentSearchParams: 'page=4&pageSize=20&search=spa',
        next: { category: 'all' },
      }),
    ).toBe('/?pageSize=20&search=spa&category=all');
  });

  it('removes category when the next category value is null', () => {
    expect(
      buildCatalogControlsHref({
        currentSearchParams: 'page=4&pageSize=20&search=spa&category=family-spa',
        next: { category: null },
      }),
    ).toBe('/?pageSize=20&search=spa');
  });

  it('resets filters and preserves unrelated safe params', () => {
    expect(
      buildCatalogControlsHref({
        currentSearchParams: 'page=5&pageSize=40&search=spa&category=spa&sort=popular',
        next: { reset: true },
      }),
    ).toBe('/?pageSize=40&sort=popular');
  });

  it('moves to the first page while preserving active filters', () => {
    expect(
      buildCatalogControlsHref({
        currentSearchParams: 'page=5&pageSize=40&search=spa&category=spa',
        next: { page: 'first' },
      }),
    ).toBe('/?pageSize=40&search=spa&category=spa');
  });
});
