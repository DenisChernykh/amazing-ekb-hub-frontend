import { categoriesList } from '@/shared/api/generated/categories/categories';
import type { PlaceCategoryPublicResponseDto } from '@/shared/api/generated/model/placeCategoryPublicResponseDto';
import { PUBLIC_CATALOG_CACHE_LIFE, getCategoriesCacheTag } from '@/shared/lib/cache';
import { cacheLife, cacheTag } from 'next/cache';

/** Загружает кешируемый список публичных категорий. */
export async function fetchPublicCategories(): Promise<PlaceCategoryPublicResponseDto[]> {
  'use cache';
  cacheLife(PUBLIC_CATALOG_CACHE_LIFE);
  cacheTag(getCategoriesCacheTag());

  const response = await categoriesList();
  return response.data.items;
}
