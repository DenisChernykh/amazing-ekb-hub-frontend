import { describe, expect, it } from 'vitest';
import {
  PUBLIC_CATALOG_CACHE_LIFE,
  getCategoriesCacheTag,
  getCategoryCacheTag,
  getCategoryPlacesCacheTag,
  getCollectionCacheTag,
  getCollectionPlacesCacheTag,
  getCollectionsCacheTag,
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
    expect(getCollectionsCacheTag()).toBe('collections');
    expect(getCategoryCacheTag('family-spa')).toBe('category:family-spa');
    expect(getCategoryPlacesCacheTag('family-spa')).toBe('category-places:family-spa');
    expect(getCollectionCacheTag('weekend-spots')).toBe('collection:weekend-spots');
    expect(getCollectionPlacesCacheTag('weekend-spots')).toBe('collection-places:weekend-spots');
    expect(getPlaceCacheTag('baden-baden-uktus')).toBe('place:baden-baden-uktus');
  });

  it('preserves the exact tag through the 256-character boundary', () => {
    const slugAtBoundary = 'a'.repeat(256 - 'category:'.length);

    expect(getCategoryCacheTag(slugAtBoundary)).toBe(`category:${slugAtBoundary}`);
    expect(getCategoryCacheTag(slugAtBoundary)).toHaveLength(256);
  });

  it('compresses overlong slugs to deterministic scoped SHA-256 tags', () => {
    const overlongSlug = 'a'.repeat(248);
    const firstTag = getCategoryCacheTag(overlongSlug);
    const secondTag = getCategoryCacheTag(overlongSlug);

    expect(firstTag).toBe(secondTag);
    expect(firstTag).toMatch(/^category:sha256:[a-f0-9]{64}$/);
    expect(firstTag.length).toBeLessThanOrEqual(256);
  });

  it('keeps every overlong tag scope and gives different slugs different hash shapes', () => {
    const firstSlug = 'a'.repeat(300);
    const secondSlug = 'b'.repeat(300);

    expect(getCategoryCacheTag(firstSlug)).not.toBe(getCategoryCacheTag(secondSlug));
    expect(getCategoryPlacesCacheTag(firstSlug)).toMatch(/^category-places:sha256:[a-f0-9]{64}$/);
    expect(getCollectionCacheTag(firstSlug)).toMatch(/^collection:sha256:[a-f0-9]{64}$/);
    expect(getCollectionPlacesCacheTag(firstSlug)).toMatch(
      /^collection-places:sha256:[a-f0-9]{64}$/,
    );
    expect(getPlaceCacheTag(firstSlug)).toMatch(/^place:sha256:[a-f0-9]{64}$/);
  });
});
