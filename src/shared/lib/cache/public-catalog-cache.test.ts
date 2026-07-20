import { describe, expect, it } from 'vitest';
import {
  PUBLIC_CATALOG_CACHE_LIFE,
  getCategoriesCacheTag,
  getCategoryCacheTag,
  getCategoryPlacesCacheTag,
  getPlaceCacheTag,
} from './public-catalog-cache';

describe('public catalog cache contract', () => {
  it('uses the approved stale, revalidate, and expire windows', () => {
    expect(PUBLIC_CATALOG_CACHE_LIFE).toEqual({
      stale: 60,
      revalidate: 300,
      expire: 3600,
    });
  });

  it('builds the exact public catalog tags', () => {
    expect(getCategoriesCacheTag()).toBe('categories');
    expect(getCategoryCacheTag('family-spa')).toBe('category:family-spa');
    expect(getCategoryPlacesCacheTag('family-spa')).toBe('category-places:family-spa');
    expect(getPlaceCacheTag('baden-baden-uktus')).toBe('place:baden-baden-uktus');
  });
});
