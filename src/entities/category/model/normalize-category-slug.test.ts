import { describe, expect, it } from 'vitest';
import { normalizeCategorySlug } from './normalize-category-slug';

const CATEGORY = {
  id: 'category_spa',
  slug: 'family-spa',
  title: 'Семейные SPA',
};

describe('normalizeCategorySlug', () => {
  it('keeps the valid public category slug', () => {
    expect(normalizeCategorySlug(CATEGORY.slug)).toBe('family-spa');
  });

  it.each(['', 'Family-Spa', 'family_spa', '../admin', ' family-spa '])(
    'rejects an invalid public category slug: %s',
    (slug) => {
      expect(normalizeCategorySlug(slug)).toBeNull();
    },
  );
});
