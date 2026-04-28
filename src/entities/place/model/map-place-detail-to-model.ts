import type { Material } from '@/shared/api/generated/model/material';
import type { PlaceDetail } from '@/shared/api/generated/model/placeDetail';
import { normalizeCoverImageUrl } from './normalize-cover-image-url';
import {
  PLACE_PLATFORMS,
  type PlaceDetailModel,
  type PlaceMaterialModel,
  type PlaceMaterialsByPlatform,
} from './types';

type PlaceDetailFields = PlaceDetail & {
  coverImageUrl?: string | null;
};

type PlaceMaterialsByPlatformInput = Partial<Record<PlaceMaterialModel['platform'], Material[]>>;

/**
 * Это хелпер. Преобразует API material в frontend contract материала.
 *
 * @param material - Материал из API.
 * @returns Данные материала для UI детальной страницы места.
 */
function mapMaterialToModel(material: Material): PlaceMaterialModel {
  return {
    id: material.id,
    platform: material.platform,
    type: material.type,
    title: material.title,
    publishedAt: material.publishedAt,
    durationSec: material.durationSec,
    url: material.url,
  };
}

/**
 * Это хелпер. Нормализует материалы по платформам в стабильный frontend contract.
 *
 * @param materialsByPlatform - Частично загруженные материалы по платформам.
 * @returns Полный объект материалов по всем поддержанным платформам.
 */
function normalizeMaterialsByPlatform(
  materialsByPlatform: PlaceMaterialsByPlatformInput,
): PlaceMaterialsByPlatform {
  return PLACE_PLATFORMS.reduce<PlaceMaterialsByPlatform>(
    (result, platform) => ({
      ...result,
      [platform]: (materialsByPlatform[platform] ?? []).map(mapMaterialToModel),
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
    title: place.title,
    summary: place.summary,
    tags: place.tags,
    category: place.category,
    coverImageUrl: normalizeCoverImageUrl(place.coverImageUrl),
    platformCounters: place.counters,
    pinnedMaterial: place.pinnedMaterial ? mapMaterialToModel(place.pinnedMaterial) : null,
    materialsByPlatform: normalizeMaterialsByPlatform(materialsByPlatform),
  };
}
