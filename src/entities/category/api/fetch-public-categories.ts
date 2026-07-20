import type { PlaceCategory } from '@/shared/api/generated/model/placeCategory';
import { listPlaceCategories } from '@/shared/api/generated/places/places';
import { PUBLIC_CATALOG_CACHE_LIFE, getCategoriesCacheTag } from '@/shared/lib/cache';
import { cacheLife, cacheTag } from 'next/cache';

export async function fetchPublicCategories(): Promise<PlaceCategory[]> {
  'use cache';
  cacheLife(PUBLIC_CATALOG_CACHE_LIFE);
  cacheTag(getCategoriesCacheTag());

  const response = await listPlaceCategories();
  return response.data.items;
}
