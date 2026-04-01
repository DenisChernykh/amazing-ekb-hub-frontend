import { getPlaceDetail, type PlaceDetail } from '@/modules/place';
import type { DraftPlaceDetailPlatformPages } from '../query';
import {
  loadDraftPlaceDetailMaterialResults,
  type DraftPlaceDetailMaterialResultsByPlatform,
} from './load-draft-place-detail-material-results';

/**
 * Полный server-side payload draft detail-страницы места.
 */
export interface DraftPlaceDetailPageData {
  placeId: string;
  placeDetail: PlaceDetail;
  materialResultsByPlatform: DraftPlaceDetailMaterialResultsByPlatform;
  platformPages: DraftPlaceDetailPlatformPages;
}

/**
 * Загружает все server-side данные, необходимые для draft detail-страницы места.
 *
 * @param args - Идентификатор места и нормализованные страницы по платформам.
 * @returns Page-level data для route-level screen composition.
 */
export async function loadDraftPlaceDetailPageData(args: {
  placeId: string;
  platformPages: DraftPlaceDetailPlatformPages;
}): Promise<DraftPlaceDetailPageData> {
  const { placeId, platformPages } = args;
  const placeDetail = await getPlaceDetail(placeId);

  const materialResultsByPlatform = await loadDraftPlaceDetailMaterialResults({
    placeId,
    platformPages,
    counters: placeDetail.counters,
  });

  return {
    placeId,
    placeDetail,
    materialResultsByPlatform,
    platformPages,
  };
}
