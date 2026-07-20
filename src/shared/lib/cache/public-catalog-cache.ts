export const PUBLIC_CATALOG_CACHE_LIFE = {
  stale: 60,
  revalidate: 300,
  expire: 3600,
} as const;

export const getCategoriesCacheTag = () => 'categories';
export const getCategoryCacheTag = (slug: string) => `category:${slug}`;
export const getCategoryPlacesCacheTag = (slug: string) => `category-places:${slug}`;
export const getPlaceCacheTag = (slug: string) => `place:${slug}`;
