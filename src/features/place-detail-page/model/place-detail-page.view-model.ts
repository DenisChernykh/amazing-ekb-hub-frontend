import { PlaceDetailPageData } from '@/app/di/place-detail';
import { PlaceCategory, Platform } from '@/entities/place';
import { PlaceDetailPageViewModel } from '@/features/place-detail-page/model/place-detail-page.view-model.types';
import { getRemoteFailureMessage } from '@/shared/failures';

const PLATFORM_ORDER: readonly Platform[] = ['dzen', 'telegram', 'instagram'];

const CATEGORY_LABELS: Record<PlaceCategory, string> = {
  pools: 'Бассейны',
  spa: 'Спа',
  cafe: 'Кафе',
  hotels: 'Отели',
  workshops: 'Мастер-классы',
};

/**
 * Преобразует server-side payload detail-страницы в тонкий page-level view model.
 *
 * Этот builder осознанно не пытается полностью собрать presentation state для
 * всех дочерних блоков. Он отдает только page-level данные, а `pinned` и
 * платформенные секции сами решают свои локальные `empty/error/success` состояния.
 *
 * @param data - Полный payload detail-страницы из app/di.
 * @returns View model page-level ошибки или успешного detail-экрана.
 */
export function buildPlaceDetailPageViewModel(data: PlaceDetailPageData): PlaceDetailPageViewModel {
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
      categoryLabel: CATEGORY_LABELS[place.category],
    },
    counters: {
      dzen: place.counters.dzen,
      telegram: place.counters.telegram,
      instagram: place.counters.instagram,
    },
    pinnedMaterial: place.pinnedMaterial,
    sections: PLATFORM_ORDER.map((platform) => ({
      placeId: data.placeId,
      platform,
      counter: place.counters[platform],
      currentPage: data.platformPages[platform],
      platformPages: data.platformPages,
      materialResult: data.materialResultsByPlatform[platform],
    })),
  };
}
