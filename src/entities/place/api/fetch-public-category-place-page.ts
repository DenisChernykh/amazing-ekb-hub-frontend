import { listPlaces } from '@/shared/api/generated/places/places';
import type { CategoryPlacesPage } from '../model/category-places-page-schema';
import { mapPlaceSummaryToCardModel } from '../model/map-place-summary-to-card';

export type FetchPublicCategoryPlacePageInput = {
  categoryId: string;
  categorySlug: string;
  page: number;
};

export async function fetchPublicCategoryPlacePage({
  categoryId,
  page,
}: FetchPublicCategoryPlacePageInput): Promise<CategoryPlacesPage> {
  const response = await listPlaces({
    categoryId,
    page,
    pageSize: 20,
  });

  return {
    items: response.data.items.map(mapPlaceSummaryToCardModel),
    page: response.data.page,
    pageSize: 20,
    total: response.data.total,
  };
}
