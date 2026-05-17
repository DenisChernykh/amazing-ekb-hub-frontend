import {
  getPlaceDetail,
  type getPlaceDetailResponseError,
  type getPlaceDetailResponseSuccess,
} from '@/shared/api/generated/places/places';
import { isGeneratedApiError } from '@/shared/lib/api/is-generated-api-error';

/**
 * Нормализованный результат загрузки публичной detail-карточки места.
 */
export type FetchPublicPlaceDetailResult =
  | { kind: 'success'; data: getPlaceDetailResponseSuccess['data'] }
  | { kind: 'not_found'; data: getPlaceDetailResponseError['data'] }
  | { kind: 'unexpected_error'; message: string };

/**
 * Загружает публичную detail-карточку места и приводит ответ API к controlled union.
 *
 * @param placeId - Идентификатор места.
 * @returns Результат загрузки со штатными ветками `success`, `not_found` или `unexpected_error`.
 */
export async function fetchPublicPlaceDetail(
  placeId: string,
): Promise<FetchPublicPlaceDetailResult> {
  try {
    const response = await getPlaceDetail(
      { placeId },
      {
        cache: 'no-store',
      },
    );

    return {
      kind: 'success',
      data: response.data,
    };
  } catch (error) {
    if (isGeneratedApiError(error) && error.status === 404) {
      return {
        kind: 'not_found',
        data: error.info as getPlaceDetailResponseError['data'],
      };
    }

    return {
      kind: 'unexpected_error',
      message: 'Не удалось загрузить место.',
    };
  }
}
