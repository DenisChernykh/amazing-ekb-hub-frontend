import { describe, expect, it } from 'vitest';
import { serializeHomeSearchParams } from './serialize-home-search-params';

describe('serializeHomeSearchParams', () => {
  it('omits default values', () => {
    expect(
      serializeHomeSearchParams({
        urlState: {
          page: 1,
          pageSize: 20,
          sort: 'popular',
        },
      }),
    ).toBe('');
  });

  it('serializes public fields in stable order without the backend category id', () => {
    expect(
      serializeHomeSearchParams({
        urlState: {
          page: 3,
          pageSize: 40,
          search: 'family spa',
          sort: 'title_asc',
          category: 'family-spa',
        },
        categoryId: 'category_family_spa',
      }),
    ).toBe('search=family+spa&category=family-spa&sort=title_asc&pageSize=40&page=3');
  });
});
