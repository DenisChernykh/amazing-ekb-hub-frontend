import type { PlaceDetailPageData } from '@/app/di/place-detail';
import { MATERIAL_PLATFORMS } from '@/entities/material';
import { getPlaceCategoryLabel } from '@/entities/place';
import { getRemoteFailureMessage } from '@/shared/failures';
import { buildPlaceDetailPinnedCardViewModel } from './place-detail-pinned-card.view-model';
import type { PlaceDetailScreenViewModel } from './place-detail-screen.view-model.types';
import { buildPlaceDetailSectionViewModel } from './place-detail-section.view-model';

/**
 * Преобразует server-side payload detail-страницы в screen-level view model.
 *
 * @param data - Полный payload detail-страницы из app/di.
 * @returns View model ошибки или успешного detail-экрана.
 */
export function buildPlaceDetailScreenViewModel(
  data: PlaceDetailPageData,
): PlaceDetailScreenViewModel {
  if (!data.placeDetailResult.ok) {
    return {
      kind: 'error',
      title: 'Не удалось загрузить место',
      description: getRemoteFailureMessage(data.placeDetailResult.error),
    };
  }

  const place = data.placeDetailResult.data;

  return {
    kind: 'success',
    actions: {
      backHref: '/',
      favoriteDisabled: true,
    },
    summary: {
      title: place.title,
      summary: place.summary,
      tags: place.tags,
      categoryLabel: getPlaceCategoryLabel(place.category),
    },
    counters: {
      dzen: place.counters.dzen,
      telegram: place.counters.telegram,
      instagram: place.counters.instagram,
    },
    pinned: buildPlaceDetailPinnedCardViewModel(place.pinnedMaterial),
    sections: MATERIAL_PLATFORMS.map((platform) =>
      buildPlaceDetailSectionViewModel({
        placeId: data.placeId,
        platform,
        counter: place.counters[platform],
        platformPages: data.platformPages,
        materialResult: data.materialResultsByPlatform[platform],
      }),
    ),
  };
}
