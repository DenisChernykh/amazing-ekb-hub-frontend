import { fetchPublicCategory } from '@/entities/category';
import { fetchPublicCategoryPlacePage, type CategoryPlacesPage } from '@/entities/place';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from './route';

vi.mock('@/entities/category', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/entities/category')>();

  return {
    ...original,
    fetchPublicCategory: vi.fn(),
  };
});

vi.mock('@/entities/place', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/entities/place')>();

  return {
    ...original,
    fetchPublicCategoryPlacePage: vi.fn(),
  };
});

const fetchPublicCategoryMock = vi.mocked(fetchPublicCategory);
const fetchPublicCategoryPlacePageMock = vi.mocked(fetchPublicCategoryPlacePage);
const PAGE: CategoryPlacesPage = {
  items: [
    {
      id: 'place-21',
      slug: 'place-21',
      title: 'Место 21',
      coverImageUrl: null,
    },
  ],
  page: 2,
  pageSize: 20,
  total: 21,
};

function callGet(categorySlug: string, page: string | null) {
  const url = new URL('http://localhost/api/categories/category/places');
  if (page !== null) url.searchParams.set('page', page);

  return GET(new Request(url), {
    params: Promise.resolve({ categorySlug }),
  });
}

describe('GET category places page', () => {
  beforeEach(() => {
    fetchPublicCategoryMock.mockReset();
    fetchPublicCategoryPlacePageMock.mockReset();
  });

  it('returns only the frontend CategoryPlacesPage contract', async () => {
    fetchPublicCategoryMock.mockResolvedValueOnce({
      id: 'category-spa',
      slug: 'spa',
      title: 'SPA',
    });
    fetchPublicCategoryPlacePageMock.mockResolvedValueOnce(PAGE);

    const response = await callGet('spa', '2');

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(PAGE);
    expect(JSON.stringify(PAGE)).not.toContain('summary');
    expect(JSON.stringify(PAGE)).not.toContain('counters');
    expect(JSON.stringify(PAGE)).not.toContain('status');
    expect(fetchPublicCategoryPlacePageMock).toHaveBeenCalledWith({
      categoryId: 'category-spa',
      categorySlug: 'spa',
      page: 2,
    });
  });

  it.each([
    ['BAD', '2'],
    ['spa', null],
    ['spa', '0'],
    ['spa', '1001'],
  ])('returns 400 for slug %s and page %s without calling adapters', async (slug, page) => {
    const response = await callGet(slug, page);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      message: 'Некорректные параметры.',
    });
    expect(fetchPublicCategoryMock).not.toHaveBeenCalled();
    expect(fetchPublicCategoryPlacePageMock).not.toHaveBeenCalled();
  });

  it('returns 404 when the category does not exist', async () => {
    fetchPublicCategoryMock.mockResolvedValueOnce(null);

    const response = await callGet('unknown', '2');

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      message: 'Категория не найдена.',
    });
    expect(fetchPublicCategoryPlacePageMock).not.toHaveBeenCalled();
  });
});
