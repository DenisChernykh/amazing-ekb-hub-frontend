import type { PlaceCardModel, PlaceCategory } from '@/entities/place';
import type { PlacesPaginationModel } from '@/features/places-pagination';

/**
 * Модель виджета каталога мест.
 */
export type PlacesCatalogModel = {
  items: PlaceCardModel[];
  categories: PlaceCategory[];
  filters: {
    search?: string;
    activeCategorySlug?: string;
    resetHref: string;
    firstPageHref: string;
  };
  pagination: PlacesPaginationModel & {
    total: number;
  };
};
