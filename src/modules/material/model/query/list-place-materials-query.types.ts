import type { Platform } from '../entity';

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
