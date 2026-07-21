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

const CATEGORIES: CategoryCardModel[] = Array.from({ length: 5 }, (_, index) => ({
  ...CATEGORY,
  id: `category_${index + 1}`,
  slug: `category-${index + 1}`,
  title: `Категория ${index + 1}`,
  image: {
    kind: 'placeholder',
    src: '/images/categories/category-placeholder.svg',
    alt: '',
  },
}));

describe('CategoryGrid', () => {
  it('renders category cards in API order with the responsive grid contract', () => {
    const html = renderToStaticMarkup(
      createElement(CategoryGrid, { categories: CATEGORIES, ariaLabel: 'Категории мест' }),
    );

    expect(html).toContain('grid-cols-2');
    expect(html).toContain('lg:grid-cols-4');
    expect(html).toContain('aria-label="Категории мест"');
    expect(html.indexOf('Категория 1')).toBeLessThan(html.indexOf('Категория 2'));
    expect(html.match(/href="\/categories\//g)).toHaveLength(CATEGORIES.length);
  });

  it('eagerly loads only the first desktop row of category images', () => {
    const html = renderToStaticMarkup(
      createElement(CategoryGrid, { categories: CATEGORIES, ariaLabel: 'Категории мест' }),
    );

    expect(html.match(/loading="eager"/g)).toHaveLength(4);
    expect(html.match(/loading="lazy"/g)).toHaveLength(1);
  });
});
