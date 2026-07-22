import type { PlaceDetail } from '@/shared/api/generated/model/placeDetail';
import type { PublicMaterial } from '@/shared/api/generated/model/publicMaterial';
import { normalizeCoverImageUrl } from './normalize-cover-image-url';
import { normalizeMapsUrl } from './normalize-maps-url';
import { normalizeMaterialRedirectUrl } from './normalize-material-redirect-url';
import {
  PLACE_PLATFORMS,
  type PlaceDetailModel,
  type PlaceMaterialModel,
  type PlaceMaterialsByPlatform,
} from './types';

type PlaceDetailFields = PlaceDetail & {
  coverImageUrl?: string | null;
};

type PlaceMaterialsByPlatformInput = Partial<
  Record<PlaceMaterialModel['platform'], PublicMaterial[]>
>;

/**
 * Это хелпер. Преобразует API material в frontend contract материала.
 *
 * @param material - Материал из API.
 * @returns Данные материала для UI детальной страницы места.
 */
function mapMaterialToModel(material: PublicMaterial): PlaceMaterialModel {
  return {
    id: material.id,
    platform: material.platform,
    type: material.type,
    title: material.title ?? 'Без названия',
    publishedAt: material.publishedAt,
    durationSec: material.durationSec,
    redirectUrl: normalizeMaterialRedirectUrl(material.redirectUrl, material.id),
  };
}

/**
 * Это хелпер. Сортирует материалы от новых к старым со стабильным id tie-breaker.
 */
function compareMaterials(left: PublicMaterial, right: PublicMaterial): number {
  const dateComparison = right.publishedAt.localeCompare(left.publishedAt);

  return dateComparison || left.id.localeCompare(right.id);
}

/**
 * Это хелпер. Дедуплицирует и нормализует материалы одной платформы.
 */
function normalizePlatformMaterials(
  materials: PublicMaterial[],
  pinnedMaterial: PublicMaterial | null,
  platform: PlaceMaterialModel['platform'],
): PlaceMaterialModel[] {
  const uniqueMaterials = new Map(
    materials
      .filter((material) => material.platform === platform)
      .map((material) => [material.id, material]),
  );

  if (pinnedMaterial?.platform === platform) {
    uniqueMaterials.set(pinnedMaterial.id, pinnedMaterial);
  }

  return [...uniqueMaterials.values()].sort(compareMaterials).map(mapMaterialToModel);
}

/**
 * Это хелпер. Нормализует материалы по платформам в стабильный frontend contract.
 *
 * @param materialsByPlatform - Частично загруженные материалы по платформам.
 * @returns Полный объект материалов по всем поддержанным платформам.
 */
function normalizeMaterialsByPlatform(
  materialsByPlatform: PlaceMaterialsByPlatformInput,
  pinnedMaterial: PublicMaterial | null,
): PlaceMaterialsByPlatform {
  return PLACE_PLATFORMS.reduce<PlaceMaterialsByPlatform>(
    (result, platform) => ({
      ...result,
      [platform]: normalizePlatformMaterials(
        materialsByPlatform[platform] ?? [],
        pinnedMaterial,
        platform,
      ),
    }),
    {
      dzen: [],
      telegram: [],
      instagram: [],
    },
  );
}

/**
 * Это хелпер. Преобразует API detail и списки материалов в frontend contract страницы места.
 *
 * @param place - Детальная карточка места из API.
 * @param materialsByPlatform - Списки материалов, загруженные отдельно по платформам.
 * @returns Данные, с которыми работает UI детальной страницы.
 */
export function mapPlaceDetailToModel(
  place: PlaceDetailFields,
  materialsByPlatform: PlaceMaterialsByPlatformInput,
): PlaceDetailModel {
  return {
    id: place.id,
    slug: place.slug,
    title: place.title,
    summary: place.summary,
    tags: place.tags,
    category: place.category,
    coverImageUrl: normalizeCoverImageUrl(place.coverImageUrl),
    mapsUrl: normalizeMapsUrl(place.mapsUrl),
    platformCounters: place.counters,
    pinnedMaterial: place.pinnedMaterial ? mapMaterialToModel(place.pinnedMaterial) : null,
    materialsByPlatform: normalizeMaterialsByPlatform(materialsByPlatform, place.pinnedMaterial),
  };
}
