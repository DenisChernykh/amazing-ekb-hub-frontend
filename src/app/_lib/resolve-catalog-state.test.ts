import { describe, expect, it } from 'vitest';
import { resolveCatalogState } from './resolve-catalog-state';

const FAMILY_SPA_CATEGORY = {
  id: 'category_family_spa',
  slug: 'family-spa',
  title: 'Family SPA',
  badgeBackgroundColor: '#faf0ed',
};

describe('resolveCatalogState', () => {
  it('keeps a known public category slug and adds its backend id', () => {
    expect(
      resolveCatalogState(
        {
          page: 2,
          pageSize: 20,
          search: 'spa',
          sort: 'popular',
          category: 'family-spa',
        },
        [FAMILY_SPA_CATEGORY],
      ),
    ).toEqual({
      urlState: {
        page: 2,
        pageSize: 20,
        search: 'spa',
        sort: 'popular',
        category: 'family-spa',
      },
      categoryId: 'category_family_spa',
    });
  });

  it('removes a category that is missing from the backend dictionary', () => {
    expect(
      resolveCatalogState(
        {
          page: 3,
          pageSize: 40,
          search: 'spa',
          sort: 'title_asc',
          category: 'missing',
        },
        [FAMILY_SPA_CATEGORY],
      ),
    ).toEqual({
      urlState: {
        page: 3,
        pageSize: 40,
        search: 'spa',
        sort: 'title_asc',
      },
    });
  });
});
