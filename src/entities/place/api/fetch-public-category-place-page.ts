import { listPlaces } from '@/shared/api/generated/places/places';
import { PUBLIC_CATALOG_CACHE_LIFE, getCategoryPlacesCacheTag } from '@/shared/lib/cache';
import { cacheLife, cacheTag } from 'next/cache';
import type { CategoryPlacesPage } from '../model/category-places-page-schema';
import { mapPlaceSummaryToCardModel } from '../model/map-place-summary-to-card';

/** Параметры кешируемой страницы мест категории. */
export type FetchPublicCategoryPlacePageInput = {
  categoryId: string;
  categorySlug: string;
  page: number;
};

/** Загружает и преобразует одну публичную страницу мест категории. */
export async function fetchPublicCategoryPlacePage({
  categoryId,
  categorySlug,
  page,
}: FetchPublicCategoryPlacePageInput): Promise<CategoryPlacesPage> {
  'use cache';
  cacheLife(PUBLIC_CATALOG_CACHE_LIFE);
  cacheTag(getCategoryPlacesCacheTag(categorySlug));

  const response = await listPlaces({ categoryId, page, pageSize: 20 });

  return {
    items: response.data.items.map(mapPlaceSummaryToCardModel),
    page: response.data.page,
    pageSize: 20,
    total: response.data.total,
  };
}
