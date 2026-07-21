import type { PlaceCategory } from '@/shared/api/generated/model/placeCategory';
import { getPlaceCategory } from '@/shared/api/generated/places/places';
import { isGeneratedApiError } from '@/shared/lib/api/is-generated-api-error';
import { PUBLIC_CATALOG_CACHE_LIFE, getCategoryCacheTag } from '@/shared/lib/cache';
import { cacheLife, cacheTag } from 'next/cache';

/** Загружает публичную категорию по slug или возвращает `null`. */
export async function fetchPublicCategory(categorySlug: string): Promise<PlaceCategory | null> {
  'use cache';
  cacheLife(PUBLIC_CATALOG_CACHE_LIFE);
  cacheTag(getCategoryCacheTag(categorySlug));

  try {
    const response = await getPlaceCategory({ categorySlug });
    return response.data;
  } catch (error) {
    if (isGeneratedApiError(error) && error.status === 404) return null;
    throw error;
  }
}
