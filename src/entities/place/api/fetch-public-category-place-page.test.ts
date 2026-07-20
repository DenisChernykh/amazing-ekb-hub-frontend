import { listPlaces } from '@/shared/api/generated/places/places';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPublicCategoryPlacePage } from './fetch-public-category-place-page';

vi.mock('@/shared/api/generated/places/places', () => ({
  listPlaces: vi.fn(),
}));

const listPlacesMock = vi.mocked(listPlaces);

describe('fetchPublicCategoryPlacePage', () => {
  beforeEach(() => {
    listPlacesMock.mockReset();
  });

  it('requests a fixed-size category page and maps backend summaries to the transport model', async () => {
    listPlacesMock.mockResolvedValueOnce({
      data: {
        items: [
          {
            id: 'place-1',
            slug: 'baden-baden-uktus',
            title: 'Баден-Баден Уктус',
            summary: 'Термальный комплекс',
            tags: ['spa'],
            category: {
              id: 'category-spa',
              slug: 'spa',
              title: 'SPA',
            },
            status: 'active',
            coverImageUrl: null,
            counters: {
              dzen: 0,
              telegram: 0,
              instagram: 0,
            },
          },
        ],
        page: 1,
        pageSize: 20,
        total: 1,
      },
      status: 200,
      headers: new Headers(),
    });

    await expect(
      fetchPublicCategoryPlacePage({
        categoryId: 'category-spa',
        categorySlug: 'spa',
        page: 1,
      }),
    ).resolves.toEqual({
      items: [
        {
          id: 'place-1',
          slug: 'baden-baden-uktus',
          title: 'Баден-Баден Уктус',
          coverImageUrl: null,
        },
      ],
      page: 1,
      pageSize: 20,
      total: 1,
    });

    expect(listPlacesMock).toHaveBeenCalledOnce();
    expect(listPlacesMock).toHaveBeenCalledWith({
      categoryId: 'category-spa',
      page: 1,
      pageSize: 20,
    });
  });
});
