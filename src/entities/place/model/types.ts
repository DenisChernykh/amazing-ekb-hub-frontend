import type { PlaceSummaryCategoryResponseDto } from '@/shared/api/generated/model/placeSummaryCategoryResponseDto';
import type { PublicMaterialResponseDtoPlatform } from '@/shared/api/generated/model/publicMaterialResponseDtoPlatform';
import type { PublicMaterialResponseDtoType } from '@/shared/api/generated/model/publicMaterialResponseDtoType';

/** Стабильный тип материала, принадлежащий сущности места. */
export type MaterialType = PublicMaterialResponseDtoType;

/** Стабильный тип категории, принадлежащий сущности места. */
export type PlaceCategory = PlaceSummaryCategoryResponseDto;

/** Стабильный тип платформы, принадлежащий сущности места. */
export type Platform = PublicMaterialResponseDtoPlatform;

/**
 * Счетчики материалов места по платформам.
 */
export type PlatformCounters = Record<Platform, number>;

/**
 * Frontend contract карточки места.
 */
export type PlaceCardModel = {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string | null;
};

/** Визуальный размер карточки места внутри неравномерной сетки. */
export type PlaceCardVariant = 'regular' | 'tall';

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
  redirectUrl: string | null;
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
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  category: PlaceCategory;
  coverImageUrl: string | null;
  mapsUrl: string | null;
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
