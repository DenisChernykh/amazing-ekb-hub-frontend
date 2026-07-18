import { describe, expect, it } from 'vitest';
import { buildCatalogControlsHref } from './build-catalog-controls-href';

describe('buildCatalogControlsHref', () => {
  it('trims search, writes it to the URL, and resets pagination', () => {
    expect(
      buildCatalogControlsHref({
        currentSearchParams: 'category=spa&pageSize=40&page=3',
        next: { search: '  бассейн  ' },
      }),
    ).toBe('/?search=%D0%B1%D0%B0%D1%81%D1%81%D0%B5%D0%B9%D0%BD&category=spa&pageSize=40');
  });

  it('removes search when the next search value is empty', () => {
    expect(
      buildCatalogControlsHref({
        currentSearchParams: 'search=spa&category=spa&pageSize=40&page=2',
        next: { search: '   ' },
      }),
    ).toBe('/?category=spa&pageSize=40');
  });

  it('writes a category value and resets pagination', () => {
    expect(
      buildCatalogControlsHref({
        currentSearchParams: 'search=spa&pageSize=40&page=4',
        next: { category: 'family-spa' },
      }),
    ).toBe('/?search=spa&category=family-spa&pageSize=40');
  });

  it('writes all as a real dynamic category slug', () => {
    expect(
      buildCatalogControlsHref({
        currentSearchParams: 'search=spa&page=4',
        next: { category: 'all' },
      }),
    ).toBe('/?search=spa&category=all');
  });

  it('removes category when the next category value is null', () => {
    expect(
      buildCatalogControlsHref({
        currentSearchParams: 'search=spa&category=family-spa&page=4',
        next: { category: null },
      }),
    ).toBe('/?search=spa');
  });

  it('resets filters, drops a retired sort parameter, and preserves page size', () => {
    expect(
      buildCatalogControlsHref({
        currentSearchParams: 'search=spa&category=spa&sort=title_asc&pageSize=40&page=5',
        next: { reset: true },
      }),
    ).toBe('/?pageSize=40');
  });
});
