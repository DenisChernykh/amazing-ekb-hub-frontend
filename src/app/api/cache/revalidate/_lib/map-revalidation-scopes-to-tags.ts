import {
  getCategoriesCacheTag,
  getCategoryCacheTag,
  getCategoryPlacesCacheTag,
  getPlaceCacheTag,
} from '@/shared/lib/cache';
import type { CacheRevalidationPayload } from './cache-revalidation-schema';

/** Преобразует доменные области webhook-события в уникальные cache tags Next.js. */
export function mapRevalidationScopesToTags(scopes: CacheRevalidationPayload['scopes']): string[] {
  const tags = new Set<string>();

  if (scopes.categories) tags.add(getCategoriesCacheTag());
  for (const slug of scopes.categorySlugs ?? []) {
    tags.add(getCategoryCacheTag(slug));
    tags.add(getCategoryPlacesCacheTag(slug));
  }
  for (const slug of scopes.placeSlugs ?? []) {
    tags.add(getPlaceCacheTag(slug));
  }

  return [...tags];
}
