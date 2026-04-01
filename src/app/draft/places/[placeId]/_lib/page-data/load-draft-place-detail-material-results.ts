import { MATERIAL_PLATFORMS, type Platform } from '@/modules/material';
import type { PlaceCounters } from '@/modules/place';
import type { DraftPlaceDetailPlatformPages } from '../query';
import {
  loadDraftPlaceDetailMaterialSection,
  type DraftPlaceDetailMaterialSectionResult,
} from './load-draft-place-detail-material-section';

/**
 * Карта результатов загрузки материалов по платформам.
 */
export type DraftPlaceDetailMaterialResultsByPlatform = Partial<
  Record<Platform, DraftPlaceDetailMaterialSectionResult>
>;

/**
 * Загружает материалы места по всем непустым платформам.
 *
 * @param args - Идентификатор места, номер страницы по каждой платформе и счетчики из place detail.
 * @returns Объект результатов по платформам.
 */
export async function loadDraftPlaceDetailMaterialResults(args: {
  placeId: string;
  platformPages: DraftPlaceDetailPlatformPages;
  counters: PlaceCounters;
}): Promise<DraftPlaceDetailMaterialResultsByPlatform> {
  const { placeId, platformPages, counters } = args;

  const tasks = MATERIAL_PLATFORMS.filter((platform) => counters[platform] > 0).map((platform) =>
    loadDraftPlaceDetailMaterialSection({
      placeId,
      platform,
      page: platformPages[platform],
    }),
  );

  const results = await Promise.all(tasks);
  const materialResultsByPlatform: DraftPlaceDetailMaterialResultsByPlatform = {};

  for (const entry of results) {
    materialResultsByPlatform[entry.platform] = entry.result;
  }

  return materialResultsByPlatform;
}
