import type { PlaceCategory } from '@/shared/api/generated/model/placeCategory';
import type { Platform } from '@/shared/api/generated/model/platform';

/**
 * Счетчики материалов места по платформам.
 */
export type PlatformCounters = Record<Platform, number>;

/**
 * Frontend contract карточки места.
 */
export type PlaceCardModel = {
  id: string;
  title: string;
  category: PlaceCategory;
  coverImageUrl: string | null;
  platformCounters: PlatformCounters;
};

/**
 * Визуальные данные для категории или платформы.
 */
export type PlaceDisplayMeta = {
  label: string;
  color: string;
  backgroundColor: string;
};

/**
 * Это хелпер. Фиксированный порядок платформ в карточке.
 */
export const PLACE_PLATFORMS = [
  'dzen',
  'telegram',
  'instagram',
] as const satisfies readonly Platform[];
