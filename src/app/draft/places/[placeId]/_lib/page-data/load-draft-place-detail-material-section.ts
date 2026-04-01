import {
  getPlatformLabel,
  listPlaceMaterials,
  type MaterialList,
  type Platform,
} from '@/modules/material';
import { executeNonCriticalRequest, type NonCriticalRequestResult } from '@/server/std-errors';

/**
 * Успешный результат загрузки одной платформенной секции материалов.
 */
export type DraftPlaceDetailMaterialSectionSuccess = {
  kind: 'success';
  data: MaterialList;
};

/**
 * Ошибка загрузки одной платформенной секции материалов.
 */
export type DraftPlaceDetailMaterialSectionError = {
  kind: 'error';
  message: string;
  requestId?: string;
};

/**
 * Результат загрузки одной платформенной секции материалов.
 */
export type DraftPlaceDetailMaterialSectionResult =
  | DraftPlaceDetailMaterialSectionSuccess
  | DraftPlaceDetailMaterialSectionError;

/**
 * Загружает одну платформенную секцию материалов в best-effort режиме.
 *
 * @param args - Идентификатор места, платформа и страница секции.
 * @returns Платформа и результат её загрузки.
 */
export async function loadDraftPlaceDetailMaterialSection(args: {
  placeId: string;
  platform: Platform;
  page: number;
}): Promise<{
  platform: Platform;
  result: DraftPlaceDetailMaterialSectionResult;
}> {
  const { placeId, platform, page } = args;

  const result: NonCriticalRequestResult<MaterialList> = await executeNonCriticalRequest({
    request: () =>
      listPlaceMaterials({
        placeId,
        platform,
        page,
      }),
    context: `draft-place-detail:${platform}`,
    fallbackMessage: `Не удалось загрузить материалы платформы ${getPlatformLabel(platform)}.`,
  });

  return {
    platform,
    result,
  };
}
