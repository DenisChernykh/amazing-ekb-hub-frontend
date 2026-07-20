import { describe, expect, it } from 'vitest';
import { mapCategoryToCardModel } from './map-category-to-card-model';

const CATEGORY = {
  id: 'category_spa',
  slug: 'family-spa',
  title: 'Семейные SPA',
};

describe('mapCategoryToCardModel', () => {
  it('maps the public category to a literal placeholder card model', () => {
    expect(mapCategoryToCardModel(CATEGORY)).toEqual({
      id: 'category_spa',
      slug: 'family-spa',
      title: 'Семейные SPA',
      image: {
        kind: 'placeholder',
        src: '/images/categories/category-placeholder.svg',
        alt: '',
      },
    });
  });
});
