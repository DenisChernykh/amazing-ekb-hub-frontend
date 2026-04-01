import { buildPlaceDetailSectionViewModel, MATERIAL_PLATFORMS } from '@/modules/material';
import {
  buildPlaceDetailPinnedCardViewModel,
  buildPlaceDetailSummaryViewModel,
} from '@/modules/place';
import type { DraftPlaceDetailPageData } from '../page-data';
import { buildDraftPlaceDetailHref } from '../query';
import type { DraftPlaceDetailScreenSuccessViewModel } from './draft-place-detail-screen.view-model.types';

/**
 * Строит screen-level view model успешного draft detail-экрана.
 *
 * @param data - Полный page payload draft detail-страницы.
 * @returns Готовую success view model для route-level экрана.
 */
export function buildDraftPlaceDetailScreenViewModel(
  data: DraftPlaceDetailPageData,
): DraftPlaceDetailScreenSuccessViewModel {
  const { placeId, placeDetail, platformPages, materialResultsByPlatform } = data;

  return {
    actions: {
      backHref: '/draft/home',
      favoriteDisabled: true,
    },
    summary: buildPlaceDetailSummaryViewModel(placeDetail),
    counters: placeDetail.counters,
    pinned: buildPlaceDetailPinnedCardViewModel(placeDetail.pinnedMaterial),
    sections: MATERIAL_PLATFORMS.map((platform) =>
      buildPlaceDetailSectionViewModel({
        placeId,
        platform,
        counter: placeDetail.counters[platform],
        platformPages,
        materialResult: materialResultsByPlatform[platform],
        buildDetailHref: buildDraftPlaceDetailHref,
      }),
    ),
  };
}
