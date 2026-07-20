import type { Platform } from '@/shared/api/generated/model/platform';
import type { ListPlaceMaterialsParams } from '@/shared/api/generated/operation/listPlaceMaterialsParams';
import {
  listPlaceMaterials,
  type listPlaceMaterialsResponseError,
  type listPlaceMaterialsResponseSuccess,
} from '@/shared/api/generated/places/places';
import { isGeneratedApiError } from '@/shared/lib/api/is-generated-api-error';
import { PUBLIC_CATALOG_CACHE_LIFE, getPlaceCacheTag } from '@/shared/lib/cache';
import { cacheLife, cacheTag } from 'next/cache';

/**
 * Нормализованный результат загрузки публичных материалов места.
 */
export type FetchPublicPlaceMaterialsResult =
  | { kind: 'success'; data: listPlaceMaterialsResponseSuccess['data'] }
  | { kind: 'bad_request'; data: listPlaceMaterialsResponseError['data'] }
  | { kind: 'not_found'; data: listPlaceMaterialsResponseError['data'] }
  | { kind: 'unexpected_error'; message: string };

async function fetchCachedPublicPlaceMaterials(
  placeSlug: string,
  platform: Platform,
): Promise<listPlaceMaterialsResponseSuccess['data']> {
  'use cache';
  cacheLife(PUBLIC_CATALOG_CACHE_LIFE);
  cacheTag(getPlaceCacheTag(placeSlug));

  const query: ListPlaceMaterialsParams = { platform };
  const response = await listPlaceMaterials({ placeSlug }, query);
  return response.data;
}

/**
 * Загружает материалы места по платформе и приводит ответ API к controlled union.
 *
 * @param placeSlug - Публичный slug места.
 * @param platform - Платформа, по которой нужно получить материалы.
 * @returns Результат загрузки материалов со штатными error-ветками.
 */
export async function fetchPublicPlaceMaterials(
  placeSlug: string,
  platform: Platform,
): Promise<FetchPublicPlaceMaterialsResult> {
  try {
    return {
      kind: 'success',
      data: await fetchCachedPublicPlaceMaterials(placeSlug, platform),
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
