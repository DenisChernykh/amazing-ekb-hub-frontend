import { categoriesList } from '@/shared/api/generated/categories/categories';
import { cacheLife, cacheTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPublicCategories } from './fetch-public-categories';

vi.mock('@/shared/api/generated/categories/categories', () => ({
  categoriesList: vi.fn(),
}));

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

const categoriesListMock = vi.mocked(categoriesList);
const cacheLifeMock = vi.mocked(cacheLife);
const cacheTagMock = vi.mocked(cacheTag);

describe('fetchPublicCategories', () => {
  beforeEach(() => {
    categoriesListMock.mockReset();
    cacheLifeMock.mockReset();
    cacheTagMock.mockReset();
  });

  it('caches a successful category list with the shared life and categories tag', async () => {
    categoriesListMock.mockResolvedValueOnce({
      data: {
        items: [{ id: 'category-spa', slug: 'spa', title: 'SPA', coverImageUrl: null }],
      },
      status: 200,
      headers: new Headers(),
    });

    await expect(fetchPublicCategories()).resolves.toEqual([
      { id: 'category-spa', slug: 'spa', title: 'SPA', coverImageUrl: null },
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
    categoriesListMock.mockRejectedValueOnce(error);

    await expect(fetchPublicCategories()).rejects.toBe(error);
  });
});
