import type { PlaceCategory } from '@/shared/api/generated/model/placeCategory';
import type { PlaceSummary } from '@/shared/api/generated/model/placeSummary';
import type { PlaceCardModel, PlatformCounters } from './types';

type PlaceSummaryCardFields = PlaceSummary & {
  coverImageUrl?: string | null;
  counters?: Partial<PlatformCounters> | null;
};

const EMPTY_PLATFORM_COUNTERS: PlatformCounters = {
  dzen: 0,
  telegram: 0,
  instagram: 0,
};

const MOCK_PLATFORM_COUNTERS_BY_CATEGORY: Record<PlaceCategory, PlatformCounters> = {
  pools: {
    dzen: 1,
    telegram: 3,
    instagram: 0,
  },
  spa: {
    dzen: 2,
    telegram: 4,
    instagram: 1,
  },
  cafe: {
    dzen: 1,
    telegram: 2,
    instagram: 3,
  },
  hotels: {
    dzen: 2,
    telegram: 1,
    instagram: 0,
  },
  workshops: {
    dzen: 1,
    telegram: 2,
    instagram: 1,
  },
};

/**
 * Это хелпер. Возвращает временные mock-счетчики платформ до расширения backend-контракта.
 *
 * @param category - Категория места.
 * @returns Детерминированные счетчики материалов для визуального отображения платформ.
 */
function getMockPlatformCounters(category: PlaceCategory): PlatformCounters {
  return MOCK_PLATFORM_COUNTERS_BY_CATEGORY[category];
}

/**
 * Это хелпер. Нормализует частично доступные счетчики материалов.
 *
 * @param counters - Счетчики из будущего backend-контракта или `undefined`.
 * @param category - Категория места для временного mock fallback.
 * @returns Полный объект счетчиков с безопасными нулями.
 */
function normalizePlatformCounters(
  counters: Partial<PlatformCounters> | null | undefined,
  category: PlaceCategory,
): PlatformCounters {
  const fallbackCounters = counters ? EMPTY_PLATFORM_COUNTERS : getMockPlatformCounters(category);

  return {
    dzen: counters?.dzen ?? fallbackCounters.dzen,
    telegram: counters?.telegram ?? fallbackCounters.telegram,
    instagram: counters?.instagram ?? fallbackCounters.instagram,
  };
}

/**
 * Это хелпер. Нормализует URL cover-фото из текущего или будущего backend-контракта.
 *
 * @param coverImageUrl - URL фото из API.
 * @returns Непустой URL или `null`, если фото нет.
 */
function normalizeCoverImageUrl(coverImageUrl?: string | null): string | null {
  const normalizedUrl = coverImageUrl?.trim();

  return normalizedUrl ? normalizedUrl : null;
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
    title: place.title,
    category: place.category,
    coverImageUrl: normalizeCoverImageUrl(place.coverImageUrl),
    platformCounters: normalizePlatformCounters(place.counters, place.category),
  };
}
