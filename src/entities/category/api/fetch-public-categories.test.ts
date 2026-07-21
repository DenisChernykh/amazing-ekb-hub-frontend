import { listPlaceCategories } from '@/shared/api/generated/places/places';
import { cacheLife, cacheTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPublicCategories } from './fetch-public-categories';

vi.mock('@/shared/api/generated/places/places', () => ({
  listPlaceCategories: vi.fn(),
}));

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

const listPlaceCategoriesMock = vi.mocked(listPlaceCategories);
const cacheLifeMock = vi.mocked(cacheLife);
const cacheTagMock = vi.mocked(cacheTag);

describe('fetchPublicCategories', () => {
  beforeEach(() => {
    listPlaceCategoriesMock.mockReset();
    cacheLifeMock.mockReset();
    cacheTagMock.mockReset();
  });

  it('caches a successful category list with the shared life and categories tag', async () => {
    listPlaceCategoriesMock.mockResolvedValueOnce({
      data: {
        items: [{ id: 'category-spa', slug: 'spa', title: 'SPA' }],
      },
      status: 200,
      headers: new Headers(),
    });

    await expect(fetchPublicCategories()).resolves.toEqual([
      { id: 'category-spa', slug: 'spa', title: 'SPA' },
    ]);

    expect(cacheLifeMock).toHaveBeenCalledOnce();
    expect(cacheLifeMock).toHaveBeenCalledWith({
      stale: 60,
      revalidate: 300,
      expire: 3600,
    });
    expect(cacheTagMock).toHaveBeenCalledOnce();
    expect(cacheTagMock).toHaveBeenCalledWith('categories');
  });

  it('does not convert a technical failure into a result object', async () => {
    const error = new Error('backend offline');
    listPlaceCategoriesMock.mockRejectedValueOnce(error);

    await expect(fetchPublicCategories()).rejects.toBe(error);
  });
});
