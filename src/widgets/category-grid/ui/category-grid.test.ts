import type { CategoryCardModel } from '@/entities/category';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CategoryGrid } from './category-grid';

const CATEGORY = {
  id: 'category_spa',
  slug: 'family-spa',
  title: 'Семейные SPA',
};

const CATEGORIES: CategoryCardModel[] = [
  {
    ...CATEGORY,
    image: {
      kind: 'placeholder',
      src: '/images/categories/category-placeholder.svg',
      alt: '',
    },
  },
  {
    id: 'category_pools',
    slug: 'pools',
    title: 'Бассейны',
    image: {
      kind: 'placeholder',
      src: '/images/categories/category-placeholder.svg',
      alt: '',
    },
  },
];

describe('CategoryGrid', () => {
  it('renders category cards in API order with the responsive grid contract', () => {
    const html = renderToStaticMarkup(
      createElement(CategoryGrid, { categories: CATEGORIES, ariaLabel: 'Категории мест' }),
    );

    expect(html).toContain('grid-cols-2');
    expect(html).toContain('lg:grid-cols-4');
    expect(html).toContain('aria-label="Категории мест"');
    expect(html.indexOf(CATEGORY.title)).toBeLessThan(html.indexOf('Бассейны'));
    expect(html.match(/href="\/categories\//g)).toHaveLength(CATEGORIES.length);
  });
});
