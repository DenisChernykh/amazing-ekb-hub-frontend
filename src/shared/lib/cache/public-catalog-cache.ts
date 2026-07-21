import { createHash } from 'node:crypto';

const CACHE_TAG_MAX_LENGTH = 256;

/** Ограничивает длину slug-based cache tag стабильным SHA-256 fallback. */
function buildBoundedSlugCacheTag(scope: string, slug: string): string {
  const tag = `${scope}:${slug}`;
  if (tag.length <= CACHE_TAG_MAX_LENGTH) return tag;

  const digest = createHash('sha256').update(tag).digest('hex');
  return `${scope}:sha256:${digest}`;
}

/** Общая Cache Components политика публичного каталога. */
export const PUBLIC_CATALOG_CACHE_LIFE = {
  stale: 60,
  revalidate: 300,
  expire: 3600,
} as const;

/** Возвращает cache tag списка категорий. */
export const getCategoriesCacheTag = () => 'categories';
/** Возвращает ограниченный cache tag конкретной категории. */
export const getCategoryCacheTag = (slug: string) => buildBoundedSlugCacheTag('category', slug);
/** Возвращает ограниченный cache tag ленты мест категории. */
export const getCategoryPlacesCacheTag = (slug: string) =>
  buildBoundedSlugCacheTag('category-places', slug);
/** Возвращает ограниченный cache tag конкретного места. */
export const getPlaceCacheTag = (slug: string) => buildBoundedSlugCacheTag('place', slug);
