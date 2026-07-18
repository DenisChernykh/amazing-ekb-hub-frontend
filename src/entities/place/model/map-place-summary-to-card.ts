import type { PublicPlaceSummary } from '@/shared/api/generated/model/publicPlaceSummary';
import { normalizeCoverImageUrl } from './normalize-cover-image-url';
import type { PlaceCardModel, PlatformCounters } from './types';

type PlaceSummaryCardFields = Omit<PublicPlaceSummary, 'counters' | 'coverImageUrl'> & {
  coverImageUrl?: string | null;
  counters?: Partial<PlatformCounters> | null;
};

const EMPTY_PLATFORM_COUNTERS: PlatformCounters = {
  dzen: 0,
  telegram: 0,
  instagram: 0,
};

/**
 * Это хелпер. Нормализует частично доступные счетчики материалов.
 *
 * @param counters - Счетчики из backend-контракта или `undefined`.
 * @returns Полный объект счетчиков с безопасными нулями.
 */
function normalizePlatformCounters(
  counters: Partial<PlatformCounters> | null | undefined,
): PlatformCounters {
  return {
    dzen: counters?.dzen ?? EMPTY_PLATFORM_COUNTERS.dzen,
    telegram: counters?.telegram ?? EMPTY_PLATFORM_COUNTERS.telegram,
    instagram: counters?.instagram ?? EMPTY_PLATFORM_COUNTERS.instagram,
  };
}

/**
 * Это хелпер. Преобразует API summary в frontend contract карточки места.
 *
 * @param place - Краткая карточка места из текущего или будущего API.
 * @returns Данные, с которыми работает UI карточки.
 */
export function mapPlaceSummaryToCardModel(place: PlaceSummaryCardFields): PlaceCardModel {
  return {
    id: place.id,
    slug: place.slug,
    title: place.title,
    category: place.category,
    coverImageUrl: normalizeCoverImageUrl(place.coverImageUrl),
    platformCounters: normalizePlatformCounters(place.counters),
  };
}
