import type { MaterialType } from '@/shared/api/generated/model/materialType';
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
 * Frontend contract материала места.
 */
export type PlaceMaterialModel = {
  id: string;
  platform: Platform;
  type: MaterialType;
  title: string;
  publishedAt: string;
  durationSec: number | null;
  url: string;
};

/**
 * Материалы места, сгруппированные по платформам.
 */
export type PlaceMaterialsByPlatform = Record<Platform, PlaceMaterialModel[]>;

/**
 * Frontend contract детальной страницы места.
 */
export type PlaceDetailModel = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  category: PlaceCategory;
  coverImageUrl: string | null;
  platformCounters: PlatformCounters;
  pinnedMaterial: PlaceMaterialModel | null;
  materialsByPlatform: PlaceMaterialsByPlatform;
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
