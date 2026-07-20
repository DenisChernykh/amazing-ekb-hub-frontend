import { createHash } from 'node:crypto';

const CACHE_TAG_MAX_LENGTH = 256;

function buildBoundedSlugCacheTag(scope: string, slug: string): string {
  const tag = `${scope}:${slug}`;
  if (tag.length <= CACHE_TAG_MAX_LENGTH) return tag;

  const digest = createHash('sha256').update(tag).digest('hex');
  return `${scope}:sha256:${digest}`;
}

export const PUBLIC_CATALOG_CACHE_LIFE = {
  stale: 60,
  revalidate: 300,
  expire: 3600,
} as const;

export const getCategoriesCacheTag = () => 'categories';
export const getCategoryCacheTag = (slug: string) => buildBoundedSlugCacheTag('category', slug);
export const getCategoryPlacesCacheTag = (slug: string) =>
  buildBoundedSlugCacheTag('category-places', slug);
export const getPlaceCacheTag = (slug: string) => buildBoundedSlugCacheTag('place', slug);
