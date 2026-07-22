import { describe, expect, it } from 'vitest';
import { mapCategoryToCardModel } from './map-category-to-card-model';

const CATEGORY = {
  id: 'category_spa',
  slug: 'family-spa',
  title: 'Семейные SPA',
  coverImageUrl: null,
};

describe('mapCategoryToCardModel', () => {
  it('maps a non-empty cover URL to a decorative photo', () => {
    expect(
      mapCategoryToCardModel({
        ...CATEGORY,
        coverImageUrl: ' /v1/categories/family-spa/photo?v=123456789abc ',
      }),
    ).toEqual({
      id: 'category_spa',
      slug: 'family-spa',
      title: 'Семейные SPA',
      image: {
        kind: 'photo',
        src: '/v1/categories/family-spa/photo?v=123456789abc',
        alt: '',
      },
    });
  });

  it.each([null, '', '   '])('keeps the placeholder for an empty cover URL %#', (coverImageUrl) => {
    expect(mapCategoryToCardModel({ ...CATEGORY, coverImageUrl })).toEqual({
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
