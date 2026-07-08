import { fetchPublicPlaceCategories } from '@/entities/place/api/fetch-public-place-categories';
import { fetchPublicPlaceList } from '@/entities/place/api/fetch-public-place-list';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getHomePageData } from './get-home-page-data';

vi.mock('@/entities/place/api/fetch-public-place-categories', () => ({
  fetchPublicPlaceCategories: vi.fn(),
}));

vi.mock('@/entities/place/api/fetch-public-place-list', () => ({
  fetchPublicPlaceList: vi.fn(),
}));

const fetchPublicPlaceCategoriesMock = vi.mocked(fetchPublicPlaceCategories);
const fetchPublicPlaceListMock = vi.mocked(fetchPublicPlaceList);

const FAMILY_SPA_CATEGORY = {
  id: 'category_family_spa',
  slug: 'family-spa',
  title: 'Family SPA',
  badgeBackgroundColor: '#faf0ed',
};

describe('getHomePageData', () => {
  beforeEach(() => {
    fetchPublicPlaceCategoriesMock.mockReset();
    fetchPublicPlaceListMock.mockReset();
  });

  it('maps public category slug to backend categoryId before loading places', async () => {
    fetchPublicPlaceCategoriesMock.mockResolvedValueOnce({
      kind: 'success',
      data: { items: [FAMILY_SPA_CATEGORY] },
    });
    fetchPublicPlaceListMock.mockResolvedValueOnce({
      kind: 'success',
      data: {
        items: [],
        page: 1,
        pageSize: 20,
        total: 0,
      },
    });

    await expect(getHomePageData({ category: 'family-spa' })).resolves.toMatchObject({
      kind: 'ready',
      catalog: {
        categories: [FAMILY_SPA_CATEGORY],
        filters: {
          activeCategorySlug: 'family-spa',
        },
      },
    });

    expect(fetchPublicPlaceListMock).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      sort: 'popular',
      categoryId: 'category_family_spa',
    });
  });

  it('ignores well-formed category slug when it is absent from category dictionary', async () => {
    fetchPublicPlaceCategoriesMock.mockResolvedValueOnce({
      kind: 'success',
      data: { items: [FAMILY_SPA_CATEGORY] },
    });
    fetchPublicPlaceListMock.mockResolvedValueOnce({
      kind: 'success',
      data: {
        items: [],
        page: 1,
        pageSize: 20,
        total: 0,
      },
    });

    await expect(getHomePageData({ category: 'unknown-spa' })).resolves.toMatchObject({
      kind: 'ready',
      catalog: {
        filters: {
          activeCategorySlug: undefined,
        },
      },
    });

    expect(fetchPublicPlaceListMock).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      sort: 'popular',
    });
  });
});
