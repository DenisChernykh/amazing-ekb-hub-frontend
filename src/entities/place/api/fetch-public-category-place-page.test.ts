import { placesList } from '@/shared/api/generated/places/places';
import { cacheLife, cacheTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPublicCategoryPlacePage } from './fetch-public-category-place-page';

vi.mock('@/shared/api/generated/places/places', () => ({
  placesList: vi.fn(),
}));

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

const placesListMock = vi.mocked(placesList);
const cacheLifeMock = vi.mocked(cacheLife);
const cacheTagMock = vi.mocked(cacheTag);

describe('fetchPublicCategoryPlacePage', () => {
  beforeEach(() => {
    placesListMock.mockReset();
    cacheLifeMock.mockReset();
    cacheTagMock.mockReset();
  });

  it('requests a fixed-size category page and maps backend summaries to the transport model', async () => {
    placesListMock.mockResolvedValueOnce({
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
              coverImageUrl: null,
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

    expect(placesListMock).toHaveBeenCalledOnce();
    expect(placesListMock).toHaveBeenCalledWith({
      categoryId: 'category-spa',
      page: 1,
      pageSize: 20,
    });
    expect(cacheLifeMock).toHaveBeenCalledWith({
      stale: 60,
      revalidate: 300,
      expire: 3600,
    });
    expect(cacheTagMock).toHaveBeenCalledWith('category-places:spa');
  });
});
