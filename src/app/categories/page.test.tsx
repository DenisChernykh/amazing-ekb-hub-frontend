import type { CategoryCardModel } from '@/entities/category';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCategoriesPageData } from './_lib/get-categories-page-data';
import CategoriesPage from './page';

vi.mock('./_lib/get-categories-page-data', () => ({
  getCategoriesPageData: vi.fn(),
}));

const getCategoriesPageDataMock = vi.mocked(getCategoriesPageData);

const CATEGORIES: CategoryCardModel[] = [
  {
    id: 'category-spa',
    slug: 'spa',
    title: 'SPA',
    image: {
      kind: 'photo',
      src: '/v1/categories/spa/photo?v=123456789abc',
      alt: '',
    },
  },
  {
    id: 'category-no-photo',
    slug: 'no-photo',
    title: 'Без фото',
    image: {
      kind: 'placeholder',
      src: '/images/categories/category-placeholder.svg',
      alt: '',
    },
  },
];

describe('CategoriesPage', () => {
  beforeEach(() => {
    getCategoriesPageDataMock.mockReset();
    getCategoriesPageDataMock.mockResolvedValue(CATEGORIES);
  });

  it('renders photo and fallback cards on the full category-grid surface', async () => {
    const html = renderToStaticMarkup(await CategoriesPage());

    expect(html).toContain('Все категории');
    expect(html).toContain('/v1/categories/spa/photo?v=123456789abc');
    expect(html).toContain('/images/categories/category-placeholder.svg');
    expect(html.match(/object-cover/g)).toHaveLength(1);
    expect(html.match(/object-contain/g)).toHaveLength(1);
    expect(html.match(/alt=""/g)).toHaveLength(2);
  });
});
