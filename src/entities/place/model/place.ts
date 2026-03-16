/**
 * Канонический список категорий места во frontend-домене.
 */
export const PLACE_CATEGORIES = ['pools', 'spa', 'cafe', 'hotels', 'workshops'] as const;

/**
 * Категория места в доменной модели frontend.
 */
export type PlaceCategory = (typeof PLACE_CATEGORIES)[number];
/**
 * Проверяет, что строка является допустимой категорией места.
 *
 * @param value - Значение, пришедшее из URL, формы или внешнего источника.
 * @returns `true`, если значение входит в доменный список `PLACE_CATEGORIES`.
 */
export function isPlaceCategory(value: string): value is PlaceCategory {
  return PLACE_CATEGORIES.includes(value as PlaceCategory);
}
/**
 * Статус места в доменной модели frontend.
 */
export type PlaceStatus = 'active' | 'hidden';

/**
 * Доменная модель карточки места.
 */
export type PlaceSummary = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  category: PlaceCategory;
  status: PlaceStatus;
  popularityWeight: number;
};

/**
 * Доменная модель ответа списка мест.
 */
export type PlaceList = {
  items: PlaceSummary[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * Параметры запроса списка мест.
 *
 * @remarks
 * Даже если часть параметров пока не управляется UI,
 * мы сразу фиксируем целевой shape для URL-driven home.
 */
export type ListPlacesParams = {
  page: number;
  pageSize: number;
  sort: 'popular';
  search?: string;
  category?: PlaceCategory;
};
