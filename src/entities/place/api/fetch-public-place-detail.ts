import {
  getPlaceDetail,
  type getPlaceDetailResponseError,
  type getPlaceDetailResponseSuccess,
} from '@/shared/api/generated/places/places';
import { isGeneratedApiError } from '@/shared/lib/api/is-generated-api-error';
import { PUBLIC_CATALOG_CACHE_LIFE, getPlaceCacheTag } from '@/shared/lib/cache';
import { cacheLife, cacheTag } from 'next/cache';

/**
 * Нормализованный результат загрузки публичной detail-карточки места.
 */
export type FetchPublicPlaceDetailResult =
  | { kind: 'success'; data: getPlaceDetailResponseSuccess['data'] }
  | { kind: 'not_found'; data: getPlaceDetailResponseError['data'] }
  | { kind: 'unexpected_error'; message: string };

/** Загружает кешируемые detail-данные публичного места. */
async function fetchCachedPublicPlaceDetail(
  placeSlug: string,
): Promise<getPlaceDetailResponseSuccess['data']> {
  'use cache';
  cacheLife(PUBLIC_CATALOG_CACHE_LIFE);
  cacheTag(getPlaceCacheTag(placeSlug));

  const response = await getPlaceDetail({ placeSlug });
  return response.data;
}

/**
 * Загружает публичную detail-карточку места и приводит ответ API к controlled union.
 *
 * @param placeSlug - Публичный slug места.
 * @returns Результат загрузки со штатными ветками `success`, `not_found` или `unexpected_error`.
 */
export async function fetchPublicPlaceDetail(
  placeSlug: string,
): Promise<FetchPublicPlaceDetailResult> {
  try {
    return {
      kind: 'success',
      data: await fetchCachedPublicPlaceDetail(placeSlug),
    };
  } catch (error) {
    if (isGeneratedApiError(error) && error.status === 404) {
      return {
        kind: 'not_found',
        data: error.info as getPlaceDetailResponseError['data'],
      };
    }

    return { kind: 'unexpected_error', message: 'Не удалось загрузить место.' };
  }
}
