import { getPlaceCategory } from '@/shared/api/generated/places/places';
import { cacheLife, cacheTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPublicCategory } from './fetch-public-category';

vi.mock('@/shared/api/generated/places/places', () => ({
  getPlaceCategory: vi.fn(),
}));

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

const getPlaceCategoryMock = vi.mocked(getPlaceCategory);
const cacheLifeMock = vi.mocked(cacheLife);
const cacheTagMock = vi.mocked(cacheTag);

describe('fetchPublicCategory', () => {
  beforeEach(() => {
    getPlaceCategoryMock.mockReset();
    cacheLifeMock.mockReset();
    cacheTagMock.mockReset();
  });

  it('caches a successful category by its slug tag', async () => {
    getPlaceCategoryMock.mockResolvedValueOnce({
      data: { id: 'category-spa', slug: 'family-spa', title: 'Семейные SPA' },
      status: 200,
      headers: new Headers(),
    });

    await expect(fetchPublicCategory('family-spa')).resolves.toMatchObject({
      slug: 'family-spa',
    });

    expect(cacheLifeMock).toHaveBeenCalledWith({
      stale: 60,
      revalidate: 300,
      expire: 3600,
    });
    expect(cacheTagMock).toHaveBeenCalledWith('category:family-spa');
  });

  it('keeps a category 404 as null', async () => {
    getPlaceCategoryMock.mockRejectedValueOnce(
      Object.assign(new Error('not found'), {
        status: 404,
        info: { code: 'CATEGORY_NOT_FOUND', message: 'Категория не найдена' },
      }),
    );

    await expect(fetchPublicCategory('missing')).resolves.toBeNull();
  });

  it('rethrows a technical failure', async () => {
    const error = new Error('backend offline');
    getPlaceCategoryMock.mockRejectedValueOnce(error);

    await expect(fetchPublicCategory('family-spa')).rejects.toBe(error);
  });
});
