import { fetchPublicCategories } from '@/entities/category';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCategoriesPageData } from './get-categories-page-data';

vi.mock('@/entities/category', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/category')>();

  return {
    ...actual,
    fetchPublicCategories: vi.fn(),
  };
});

const fetchPublicCategoriesMock = vi.mocked(fetchPublicCategories);

const CATEGORIES = Array.from({ length: 10 }, (_, index) => ({
  id: `category-${index + 1}`,
  slug: `category-${index + 1}`,
  title: `Категория ${index + 1}`,
  coverImageUrl: null,
}));

describe('getCategoriesPageData', () => {
  beforeEach(() => {
    fetchPublicCategoriesMock.mockReset();
  });

  it('keeps every category in backend order', async () => {
    fetchPublicCategoriesMock.mockResolvedValue(CATEGORIES);

    const categories = await getCategoriesPageData();

    expect(categories.map(({ slug }) => slug)).toEqual([
      'category-1',
      'category-2',
      'category-3',
      'category-4',
      'category-5',
      'category-6',
      'category-7',
      'category-8',
      'category-9',
      'category-10',
    ]);
  });
});
