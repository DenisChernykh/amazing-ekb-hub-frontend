import type { Platform } from '@/shared/api/generated/model/platform';
import type { ListPlaceMaterialsParams } from '@/shared/api/generated/operation/listPlaceMaterialsParams';
import {
  listPlaceMaterials,
  type listPlaceMaterialsResponseError,
  type listPlaceMaterialsResponseSuccess,
} from '@/shared/api/generated/places/places';
import { isGeneratedApiError } from '@/shared/lib/api/is-generated-api-error';

/**
 * Нормализованный результат загрузки публичных материалов места.
 */
export type FetchPublicPlaceMaterialsResult =
  | { kind: 'success'; data: listPlaceMaterialsResponseSuccess['data'] }
  | { kind: 'bad_request'; data: listPlaceMaterialsResponseError['data'] }
  | { kind: 'not_found'; data: listPlaceMaterialsResponseError['data'] }
  | { kind: 'unexpected_error'; message: string };

/**
 * Загружает материалы места по платформе и приводит ответ API к controlled union.
 *
 * @param placeId - Идентификатор места.
 * @param platform - Платформа, по которой нужно получить материалы.
 * @returns Результат загрузки материалов со штатными error-ветками.
 */
export async function fetchPublicPlaceMaterials(
  placeId: string,
  platform: Platform,
): Promise<FetchPublicPlaceMaterialsResult> {
  const query: ListPlaceMaterialsParams = {
    page: 1,
    pageSize: 100,
    platform,
  };

  try {
    const response = await listPlaceMaterials({ placeId }, query, {
      cache: 'no-store',
    });

    return {
      kind: 'success',
      data: response.data,
    };
  } catch (error) {
    if (isGeneratedApiError(error) && error.status === 400) {
      return {
        kind: 'bad_request',
        data: error.info as listPlaceMaterialsResponseError['data'],
      };
    }

    if (isGeneratedApiError(error) && error.status === 404) {
      return {
        kind: 'not_found',
        data: error.info as listPlaceMaterialsResponseError['data'],
      };
    }

    return {
      kind: 'unexpected_error',
      message: 'Не удалось загрузить материалы места.',
    };
  }
}
