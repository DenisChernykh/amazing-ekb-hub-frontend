import type { PlaceCardModel } from '@/entities/place';
import type { CatalogControlsModel } from '@/features/catalog-controls';
import type { PlacesPaginationModel } from '@/features/places-pagination';

type PlacesCatalogResultsModel = {
  items: PlaceCardModel[];
  total: number;
};

type PlacesCatalogLinksModel = {
  resetFilters: string;
  firstPage: string;
};

type PlacesCatalogNavigationModel = {
  currentSearchParams: string;
};

/**
 * Модель виджета каталога мест.
 */
export type PlacesCatalogModel = {
  results: PlacesCatalogResultsModel;
  controls: CatalogControlsModel;
  pagination: PlacesPaginationModel;
  links: PlacesCatalogLinksModel;
  navigation: PlacesCatalogNavigationModel;
};
