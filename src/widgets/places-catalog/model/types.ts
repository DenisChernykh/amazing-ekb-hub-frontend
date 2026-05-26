import type { PlaceCardModel, PlaceCategory } from '@/entities/place';
import type { PlacesPaginationModel } from '@/features/places-pagination';

/**
 * Модель виджета каталога мест.
 */
export type PlacesCatalogModel = {
  items: PlaceCardModel[];
  filters: {
    search?: string;
    category?: PlaceCategory;
    resetHref: string;
  };
  pagination: PlacesPaginationModel & {
    total: number;
  };
};
