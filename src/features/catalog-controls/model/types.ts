import type { PlaceCategory } from '@/entities/place';

/**
 * Модель элементов управления каталогом мест.
 */
export type CatalogControlsModel = {
  categories: PlaceCategory[];
  search?: string;
  activeCategorySlug?: string;
};
