import {
  buildPlaceMaterialsAnchor,
  formatMaterialDuration,
  formatMaterialPublishedDate,
  getMaterialTypeDisplay,
  getPlatformDisplay,
  PLACE_PLATFORMS,
  type PlaceDetailModel,
  type PlaceMaterialModel,
} from '@/entities/place';
import type { PlaceDetailPreview, PlaceDetailViewModel } from './types';

const PLACE_PLACEHOLDER_IMAGE_SRC = '/images/places/place-placeholder.webp';

/**
 * Это хелпер. Преобразует материал в готовую для архивного UI запись.
 *
 * @param material - Нормализованный материал места.
 * @returns Сериализуемая preview-модель.
 */
function buildMaterialPreview(material: PlaceMaterialModel): PlaceDetailPreview {
  return {
    durationLabel: formatMaterialDuration(material.durationSec),
    id: material.id,
    platform: material.platform,
    platformLabel: getPlatformDisplay(material.platform).label,
    publishedAtLabel: formatMaterialPublishedDate(material.publishedAt),
    redirectUrl: material.redirectUrl,
    title: material.title,
    typeLabel: getMaterialTypeDisplay(material.type),
  };
}

/**
 * Собирает server-owned модель Archive Spine из entity-контракта места.
 *
 * @param place - Нормализованная detail-модель места.
 * @returns Данные для статического индекса и интерактивного preview.
 */
export function buildPlaceDetailViewModel(place: PlaceDetailModel): PlaceDetailViewModel {
  const pinnedId = place.pinnedMaterial?.id ?? null;
  const materials = PLACE_PLATFORMS.flatMap((platform) => place.materialsByPlatform[platform]);
  const previews = materials.map(buildMaterialPreview);
  const pinned = place.pinnedMaterial ? buildMaterialPreview(place.pinnedMaterial) : null;
  const previewsById = Object.fromEntries(
    [...previews, ...(pinned ? [pinned] : [])].map((preview) => [preview.id, preview]),
  );

  const platforms = PLACE_PLATFORMS.flatMap((platform) => {
    const platformMaterials = place.materialsByPlatform[platform];

    if (platformMaterials.length === 0) {
      return [];
    }

    return [
      {
        anchor: buildPlaceMaterialsAnchor(platform),
        count: platformMaterials.length,
        label: getPlatformDisplay(platform).label,
        materials: platformMaterials.filter(({ id }) => id !== pinnedId).map(buildMaterialPreview),
        platform,
      },
    ];
  });

  return {
    category: place.category,
    coverImageUrl: place.coverImageUrl ?? PLACE_PLACEHOLDER_IMAGE_SRC,
    initialPreview: pinned ?? previews[0] ?? null,
    mapsUrl: place.mapsUrl,
    pinned,
    platforms,
    previewsById,
    title: place.title,
    totalCount: materials.length,
  };
}
