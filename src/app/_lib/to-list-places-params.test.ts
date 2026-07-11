import { describe, expect, it } from 'vitest';
import { toListPlacesParams } from './to-list-places-params';

describe('toListPlacesParams', () => {
  it('maps resolved public state to the backend query without the category slug', () => {
    expect(
      toListPlacesParams({
        query: {
          page: 3,
          pageSize: 40,
          search: 'spa',
          sort: 'title_asc',
          category: 'family-spa',
        },
        categoryId: 'category_family_spa',
      }),
    ).toEqual({
      page: 3,
      pageSize: 40,
      search: 'spa',
      sort: 'title_asc',
      categoryId: 'category_family_spa',
    });
  });
});
