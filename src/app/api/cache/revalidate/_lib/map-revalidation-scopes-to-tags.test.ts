import { describe, expect, it } from 'vitest';
import { mapRevalidationScopesToTags } from './map-revalidation-scopes-to-tags';

describe('mapRevalidationScopesToTags', () => {
  it('maps scopes to unique tags in deterministic scope and slug order', () => {
    expect(
      mapRevalidationScopesToTags({
        categories: true,
        categorySlugs: ['old-slug', 'old-slug', 'new-slug'],
        placeSlugs: ['old-place', 'old-place', 'new-place'],
      }),
    ).toEqual([
      'categories',
      'category:old-slug',
      'category-places:old-slug',
      'category:new-slug',
      'category-places:new-slug',
      'place:old-place',
      'place:new-place',
    ]);
  });
});
