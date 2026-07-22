import { fetchPublicCategories } from '@/entities/category';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCategoryStaticParams } from './get-category-static-params';

vi.mock('@/entities/category', () => ({
  fetchPublicCategories: vi.fn(),
}));

const fetchPublicCategoriesMock = vi.mocked(fetchPublicCategories);

describe('getCategoryStaticParams', () => {
  beforeEach(() => {
    fetchPublicCategoriesMock.mockReset();
  });

  it('maps every known category slug to a route parameter', async () => {
    fetchPublicCategoriesMock.mockResolvedValueOnce([
      { id: 'category-spa', slug: 'spa', title: 'SPA', coverImageUrl: null },
      { id: 'category-pools', slug: 'pools', title: 'Бассейны', coverImageUrl: null },
    ]);

    await expect(getCategoryStaticParams()).resolves.toEqual([
      { categorySlug: 'spa' },
      { categorySlug: 'pools' },
    ]);
  });

  it('propagates enumeration failures so build cannot hide an unreachable API', async () => {
    const error = new Error('backend offline');
    fetchPublicCategoriesMock.mockRejectedValueOnce(error);

    await expect(getCategoryStaticParams()).rejects.toBe(error);
  });
});
