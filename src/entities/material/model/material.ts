import { MaterialType, Platform } from '@/entities/place';

/**
 * Доменная модель материала места.
 */
export type Material = {
  id: string;
  placeId: string;
  platform: Platform;
  type: MaterialType;
  title: string;
  publishedAt: string;
  durationSec: number | null;
  url: string;
};
/**
 * Доменная модель пагинированного списка материалов места.
 */
export type MaterialList = {
  items: Material[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * Параметры запроса материалов места.
 *
 * В текущем detail-сценарии список всегда строится внутри конкретной платформы,
 * поэтому `platform` обязателен.
 */
export type ListPlaceMaterialsParams = {
  placeId: string;
  page: number;
  platform: Platform;
};
