import { describe, expect, it } from 'vitest';
import { normalizeHomeSearchParams } from './normalize-home-search-params';

describe('normalizeHomeSearchParams', () => {
  it('falls back when page is invalid', () => {
    expect(normalizeHomeSearchParams({ page: '0' })).toMatchObject({
      page: 1,
      pageSize: 20,
    });
  });

  it('falls back oversized page without dropping other valid fields', () => {
    expect(
      normalizeHomeSearchParams({
        page: '1001',
        search: 'spa',
        category: 'family-spa',
      }),
    ).toEqual({
      page: 1,
      pageSize: 20,
      search: 'spa',
      category: 'family-spa',
    });
  });

  it('falls back oversized pageSize without dropping other valid fields', () => {
    expect(
      normalizeHomeSearchParams({
        page: '2',
        pageSize: '10000',
        search: 'spa',
        category: 'family-spa',
      }),
    ).toEqual({
      page: 2,
      pageSize: 20,
      search: 'spa',
      category: 'family-spa',
    });
  });

  it('drops a retired sort parameter without dropping other valid fields', () => {
    expect(
      normalizeHomeSearchParams({
        page: '2',
        search: 'spa',
        sort: 'newest',
        category: 'family-spa',
      }),
    ).toEqual({
      page: 2,
      pageSize: 20,
      search: 'spa',
      category: 'family-spa',
    });
  });

  it('drops oversized search without resetting other valid fields', () => {
    expect(
      normalizeHomeSearchParams({
        page: '2',
        pageSize: '40',
        search: 's'.repeat(101),
        category: 'family-spa',
      }),
    ).toEqual({
      page: 2,
      pageSize: 40,
      category: 'family-spa',
    });
  });

  it('uses the first value when Next provides repeated parameters', () => {
    expect(
      normalizeHomeSearchParams({
        page: ['3', '4'],
        search: ['spa', 'pool'],
        category: ['family-spa', 'sauna'],
      }),
    ).toMatchObject({
      page: 3,
      search: 'spa',
      category: 'family-spa',
    });
  });

  it('drops unsafe category slugs', () => {
    expect(normalizeHomeSearchParams({ category: 'spa/../../admin' })).toEqual({
      page: 1,
      pageSize: 20,
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
        category: 'spa',
      }),
    ).toEqual({
      page: 2,
      pageSize: 40,
      search: 'spa',
      category: 'spa',
    });
  });
});
