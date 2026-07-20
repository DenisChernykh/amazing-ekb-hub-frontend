import {
  fetchPublicCategory,
  mapCategoryToCardModel,
  type CategoryCardModel,
} from '@/entities/category';
import { fetchPublicCategoryPlacePage, type CategoryPlacesPage } from '@/entities/place';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCategoryPageData } from './get-category-page-data';

vi.mock('@/entities/category', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/category')>();

  return {
    ...actual,
    fetchPublicCategory: vi.fn(),
    mapCategoryToCardModel: vi.fn(),
  };
});

vi.mock('@/entities/place', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/place')>();

  return {
    ...actual,
    fetchPublicCategoryPlacePage: vi.fn(),
  };
});

const fetchPublicCategoryMock = vi.mocked(fetchPublicCategory);
const mapCategoryToCardModelMock = vi.mocked(mapCategoryToCardModel);
const fetchPublicCategoryPlacePageMock = vi.mocked(fetchPublicCategoryPlacePage);

const CATEGORY = {
  id: 'category-spa',
  slug: 'spa',
  title: 'SPA',
};
const CATEGORY_CARD: CategoryCardModel = {
  ...CATEGORY,
  image: {
    kind: 'placeholder',
    src: '/images/categories/category-placeholder.svg',
    alt: '',
  },
};
const PLACES: CategoryPlacesPage = {
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
};

describe('getCategoryPageData', () => {
  beforeEach(() => {
    fetchPublicCategoryMock.mockReset();
    mapCategoryToCardModelMock.mockReset();
    fetchPublicCategoryPlacePageMock.mockReset();
    mapCategoryToCardModelMock.mockReturnValue(CATEGORY_CARD);
  });

  it('rejects an invalid category slug before backend calls', async () => {
    await expect(getCategoryPageData('../admin')).resolves.toEqual({ kind: 'not_found' });

    expect(fetchPublicCategoryMock).not.toHaveBeenCalled();
    expect(fetchPublicCategoryPlacePageMock).not.toHaveBeenCalled();
  });

  it('returns not_found when the category backend returns 404', async () => {
    fetchPublicCategoryMock.mockResolvedValueOnce(null);

    await expect(getCategoryPageData('spa')).resolves.toEqual({ kind: 'not_found' });

    expect(fetchPublicCategoryMock).toHaveBeenCalledOnce();
    expect(fetchPublicCategoryMock).toHaveBeenCalledWith('spa');
    expect(fetchPublicCategoryPlacePageMock).not.toHaveBeenCalled();
  });

  it('loads page one exactly once and returns the ready model', async () => {
    fetchPublicCategoryMock.mockResolvedValueOnce(CATEGORY);
    fetchPublicCategoryPlacePageMock.mockResolvedValueOnce(PLACES);

    await expect(getCategoryPageData('spa')).resolves.toEqual({
      kind: 'ready',
      category: CATEGORY_CARD,
      places: PLACES,
    });

    expect(fetchPublicCategoryPlacePageMock).toHaveBeenCalledOnce();
    expect(fetchPublicCategoryPlacePageMock).toHaveBeenCalledWith({
      categoryId: 'category-spa',
      categorySlug: 'spa',
      page: 1,
    });
  });

  it('keeps an empty successful page ready', async () => {
    const emptyPlaces: CategoryPlacesPage = {
      ...PLACES,
      items: [],
      total: 0,
    };
    fetchPublicCategoryMock.mockResolvedValueOnce(CATEGORY);
    fetchPublicCategoryPlacePageMock.mockResolvedValueOnce(emptyPlaces);

    await expect(getCategoryPageData('spa')).resolves.toEqual({
      kind: 'ready',
      category: CATEGORY_CARD,
      places: emptyPlaces,
    });
  });

  it('propagates unexpected backend errors to the route boundary', async () => {
    const error = new Error('backend offline');
    fetchPublicCategoryMock.mockResolvedValueOnce(CATEGORY);
    fetchPublicCategoryPlacePageMock.mockRejectedValueOnce(error);

    await expect(getCategoryPageData('spa')).rejects.toBe(error);
  });
});
