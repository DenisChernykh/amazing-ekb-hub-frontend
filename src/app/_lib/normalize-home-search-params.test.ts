import { describe, expect, it } from 'vitest';
import { normalizeHomeSearchParams } from './normalize-home-search-params';

describe('normalizeHomeSearchParams', () => {
  it('falls back when page is invalid', () => {
    expect(normalizeHomeSearchParams({ page: '0' })).toMatchObject({
      page: 1,
      pageSize: 20,
      sort: 'popular',
    });
  });

  it('falls back when pageSize is oversized', () => {
    expect(normalizeHomeSearchParams({ pageSize: '10000' })).toMatchObject({
      page: 1,
      pageSize: 20,
      sort: 'popular',
    });
  });

  it('drops unsafe category slugs', () => {
    expect(normalizeHomeSearchParams({ category: 'spa/../../admin' })).toEqual({
      page: 1,
      pageSize: 20,
      sort: 'popular',
    });
  });

  it('preserves well-formed custom category slugs', () => {
    expect(normalizeHomeSearchParams({ category: 'family-spa-2' })).toMatchObject({
      category: 'family-spa-2',
    });
  });

  it('preserves valid catalog params', () => {
    expect(
      normalizeHomeSearchParams({
        page: '2',
        pageSize: '40',
        search: '  spa  ',
        sort: 'popular',
        category: 'spa',
      }),
    ).toEqual({
      page: 2,
      pageSize: 40,
      search: 'spa',
      sort: 'popular',
      category: 'spa',
    });
  });
});
