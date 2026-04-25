import type { PlaceCardModel } from '@/entities/place';
import type { PlacesPaginationModel } from '@/features/places-pagination';

/**
 * Модель виджета каталога мест.
 */
export type PlacesCatalogModel = {
  items: PlaceCardModel[];
  pagination: PlacesPaginationModel & {
    total: number;
  };
};
