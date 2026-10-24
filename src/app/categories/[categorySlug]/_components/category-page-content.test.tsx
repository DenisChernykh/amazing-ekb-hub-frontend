import type { CategoryCardModel } from '@/entities/category';
import type { CategoryPlacesPage } from '@/entities/place';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CategoryPageContent } from './category-page-content';

const CATEGORY: CategoryCardModel = {
  id: 'category-spa',
  slug: 'spa',
  title: 'SPA',
  image: {
    kind: 'placeholder',
    src: '/images/categories/category-placeholder.svg',
    alt: '',
  },
};
const PLACES: CategoryPlacesPage = {
  items: Array.from({ length: 5 }, (_, index) => ({
    id: `place-${index + 1}`,
    slug: `place-${index + 1}`,
    title: `Место ${index + 1}`,
    coverImageUrl: null,
  })),
  page: 1,
  pageSize: 20,
  total: 25,
};

describe('CategoryPageContent', () => {
  it('renders semantic breadcrumbs, the category heading, and the mounted place feed', () => {
    const html = renderToStaticMarkup(
      createElement(CategoryPageContent, {
        category: CATEGORY,
        places: PLACES,
      }),
    );

    expect(html).toContain('<main');
    expect(html).toContain('aria-label="Хлебные крошки"');
    expect(html).toContain('href="/"');
    expect(html).toContain('href="/categories"');
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('<h1');
    expect(html).toContain('>SPA</h1>');
    expect(html).toContain('aria-label="Места"');
    expect(html).toContain('place-feed-module');
    expect(html.match(/href="\/places\/place-[1-5]"/g)).toHaveLength(5);
    expect(html).toContain('data-category-places-sentinel="true"');
    expect(html).toContain('focus-visible:outline-2');
    expect(html).not.toContain('В этой категории пока нет мест.');
  });

  it('renders the empty state instead of an empty feed', () => {
    const html = renderToStaticMarkup(
      createElement(CategoryPageContent, {
        category: CATEGORY,
        places: {
          ...PLACES,
          items: [],
          total: 0,
        },
      }),
    );

    expect(html).toContain('В этой категории пока нет мест.');
    expect(html).not.toContain('aria-label="Места"');
  });
});
