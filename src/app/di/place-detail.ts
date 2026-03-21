import 'server-only';

import { listPlaceMaterials } from '@/app/di/material';
import { getPlaceDetail } from '@/app/di/place';
import type { MaterialListResult } from '@/entities/material';
import type { PlaceDetailResult, Platform } from '@/entities/place';

const PLATFORM_ORDER: readonly Platform[] = ['dzen', 'telegram', 'instagram'];

/**
 * Локальный app-layer shape страниц по платформам.
 *
 * Не тянем page-specific type из feature-слоя в `app/di`.
 */
type PlatformPages = Record<Platform, number>;

/**
 * Карта result-first ответов материалов по платформам.
 *
 * Платформы с нулевым счетчиком не запрашиваются и отсутствуют в объекте.
 */
export type MaterialResultsByPlatform = Partial<Record<Platform, MaterialListResult>>;

/**
 * Полный server-side payload detail-страницы места до преобразования во view model.
 */
export type PlaceDetailPageData = {
  placeId: string;
  placeDetailResult: PlaceDetailResult;
  materialResultsByPlatform: MaterialResultsByPlatform;
  platformPages: PlatformPages;
};

/**
 * Загружает материалы места по всем непустым платформам.
 *
 * @param args - Идентификатор места, номер страницы по каждой платформе и счетчики из place detail.
 * @returns Объект result-first ответов по платформам.
 */
async function loadMaterialResultsByPlatform(args: {
  placeId: string;
  platformPages: PlatformPages;
  counters: Record<Platform, number>;
}): Promise<MaterialResultsByPlatform> {
  const { placeId, platformPages, counters } = args;

  const results = await Promise.all(
    PLATFORM_ORDER.map(async (platform) => {
      if (counters[platform] === 0) {
        return null;
      }

      const result = await listPlaceMaterials({
        placeId,
        platform,
        page: platformPages[platform],
      });

      return { platform, result };
    }),
  );

  const materialResultsByPlatform: MaterialResultsByPlatform = {};

  for (const entry of results) {
    if (!entry) {
      continue;
    }

    materialResultsByPlatform[entry.platform] = entry.result;
  }

  return materialResultsByPlatform;
}

/**
 * Загружает все server-side данные, необходимые для detail-страницы места.
 *
 * @param args - Идентификатор места и нормализованные страницы по платформам.
 * @returns Page-level data до маппинга в presentation-ready view model.
 */
export async function loadPlaceDetailPageData(args: {
  placeId: string;
  platformPages: PlatformPages;
}): Promise<PlaceDetailPageData> {
  const { placeId, platformPages } = args;
  const placeDetailResult = await getPlaceDetail(placeId);

  if (!placeDetailResult.ok) {
    return {
      placeId,
      placeDetailResult,
      materialResultsByPlatform: {},
      platformPages,
    };
  }

  const materialResultsByPlatform = await loadMaterialResultsByPlatform({
    placeId,
    platformPages,
    counters: placeDetailResult.data.counters,
  });

  return {
    placeId,
    placeDetailResult,
    materialResultsByPlatform,
    platformPages,
  };
}
