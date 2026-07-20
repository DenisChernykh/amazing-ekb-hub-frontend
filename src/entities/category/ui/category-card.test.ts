import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { CategoryCardModel } from '../model/types';
import { CategoryCard } from './category-card';

const CATEGORY = {
  id: 'category_spa',
  slug: 'family-spa',
  title: 'Семейные SPA',
};

const CATEGORY_CARD: CategoryCardModel = {
  ...CATEGORY,
  image: {
    kind: 'placeholder',
    src: '/images/categories/category-placeholder.svg',
    alt: '',
  },
};

describe('CategoryCard', () => {
  it('renders one literal category link with a placeholder image and no metadata', () => {
    const html = renderToStaticMarkup(createElement(CategoryCard, { category: CATEGORY_CARD }));

    expect(html.match(/href="\/categories\/family-spa"/g)).toHaveLength(1);
    expect(html.match(/>Семейные SPA</g)).toHaveLength(1);
    expect(html).toContain('alt=""');
    expect(html).toContain('object-contain');
    expect(html).toContain('border border-border');
    expect(html).not.toMatch(/description|count|badge|arrow|divide/i);
  });
});
