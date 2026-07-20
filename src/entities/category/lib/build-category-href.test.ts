import { describe, expect, it } from 'vitest';
import { buildCategoryHref } from './build-category-href';

const CATEGORY = {
  id: 'category_spa',
  slug: 'family-spa',
  title: 'Семейные SPA',
};

describe('buildCategoryHref', () => {
  it('builds the public category route from its slug', () => {
    expect(buildCategoryHref(CATEGORY.slug)).toBe('/categories/family-spa');
  });
});
