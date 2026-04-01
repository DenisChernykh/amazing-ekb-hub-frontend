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
 * @param value - Значение из URL или внешнего источника.
 * @returns `true`, если значение входит в доменный whitelist категорий.
 */
export function isPlaceCategory(value: string): value is PlaceCategory {
  return PLACE_CATEGORIES.includes(value as PlaceCategory);
}

/**
 * Статус места в доменной модели frontend.
 */
export type PlaceStatus = 'active' | 'hidden';

/**
 * Платформа материала внутри detail-ответа места.
 */
export type PlaceMaterialPlatform = 'dzen' | 'telegram' | 'instagram';

/**
 * Тип материала внутри detail-ответа места.
 */
export type PlaceMaterialType = 'post' | 'reel' | 'video';

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
 * Короткое представление pinned material внутри detail-ответа места.
 */
export type PlaceMaterialPreview = {
  id: string;
  placeId: string;
  platform: PlaceMaterialPlatform;
  type: PlaceMaterialType;
  title: string;
  publishedAt: string;
  durationSec: number | null;
  url: string;
};

/**
 * Счетчики материалов по платформам.
 */
export type PlaceCounters = {
  dzen: number;
  telegram: number;
  instagram: number;
};

/**
 * Доменная модель детальной карточки места.
 */
export type PlaceDetail = PlaceSummary & {
  pinnedMaterial: PlaceMaterialPreview | null;
  counters: PlaceCounters;
};
