import { mapPlaceDetailToModel, PLACE_PLATFORMS, type PlaceDetailModel } from '@/entities/place';
import { fetchPublicPlaceDetail } from '@/entities/place/api/fetch-public-place-detail';
import { fetchPublicPlaceMaterials } from '@/entities/place/api/fetch-public-place-materials';
import { normalizePlaceIdForBackendPath } from '@/entities/place/model/normalize-place-id';
import type { Material } from '@/shared/api/generated/model/material';
import type { Platform } from '@/shared/api/generated/model/platform';

/**
 * View model route-страницы места.
 */
export type PlacePageModel =
  | {
      kind: 'ready';
      place: PlaceDetailModel;
    }
  | {
      kind: 'not_found';
    }
  | {
      kind: 'unexpected_error';
      message: string;
    };

/**
 * Собирает server-side данные для детальной страницы места.
 *
 * @param placeId - Идентификатор места из route params.
 * @returns Готовую модель страницы для success-, not-found- или error-состояния.
 */
export async function getPlacePageData(placeId: string): Promise<PlacePageModel> {
  const normalizedPlaceId = normalizePlaceIdForBackendPath(placeId);

  if (!normalizedPlaceId) {
    return { kind: 'not_found' };
  }

  const placeResult = await fetchPublicPlaceDetail(normalizedPlaceId);

  if (placeResult.kind === 'not_found') {
    return { kind: 'not_found' };
  }

  if (placeResult.kind === 'unexpected_error') {
    return {
      kind: 'unexpected_error',
      message: placeResult.message,
    };
  }

  const materialResults = await Promise.all(
    PLACE_PLATFORMS.map(async (platform) => ({
      platform,
      result: await fetchPublicPlaceMaterials(normalizedPlaceId, platform),
    })),
  );

  const failedResult = materialResults.find(({ result }) => result.kind !== 'success');

  if (failedResult) {
    if (failedResult.result.kind === 'not_found') {
      return { kind: 'not_found' };
    }

    return {
      kind: 'unexpected_error',
      message:
        failedResult.result.kind === 'unexpected_error'
          ? failedResult.result.message
          : 'Не удалось загрузить материалы места.',
    };
  }

  const materialsByPlatform = materialResults.reduce<Partial<Record<Platform, Material[]>>>(
    (result, { platform, result: materialResult }) => ({
      ...result,
      [platform]: materialResult.kind === 'success' ? materialResult.data.items : [],
    }),
    {},
  );

  return {
    kind: 'ready',
    place: mapPlaceDetailToModel(placeResult.data, materialsByPlatform),
  };
}
