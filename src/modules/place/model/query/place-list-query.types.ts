import type { PlaceCategory } from '../entity';

/**
 * Query keys списка мест.
 */
export const PLACE_LIST_QUERY_KEYS = {
  page: 'page',
  search: 'search',
  category: 'category',
} as const;

/**
 * Канонические параметры запроса списка мест.
 *
 * @remarks
 * Это уже backend-ready shape, который должен получать data-access слой.
 */
export type ListPlacesParams = {
  page: number;
  pageSize: number;
  sort: 'popular';
  search?: string;
  category?: PlaceCategory;
};

/**
 * Базовые параметры списка мест.
 */
export const DEFAULT_PLACE_LIST_PARAMS: Readonly<ListPlacesParams> = {
  page: 1,
  pageSize: 20,
  sort: 'popular',
};

/**
 * Входные данные для сборки canonical params списка мест.
 */
export interface BuildPlaceListParamsInput {
  /**
   * Номер страницы после route-level нормализации.
   */
  page?: number;

  /**
   * Поисковая строка.
   */
  search?: string;

  /**
   * Строковое значение категории из URL или UI.
   */
  category?: string;
}
