import type { PlaceMaterialsListParams } from '@/shared/api/generated/operation/placeMaterialsListParams';
import {
  placeMaterialsList,
  type placeMaterialsListResponseError,
  type placeMaterialsListResponseSuccess,
} from '@/shared/api/generated/places/places';
import { isGeneratedApiError } from '@/shared/lib/api/is-generated-api-error';
import { PUBLIC_CATALOG_CACHE_LIFE, getPlaceCacheTag } from '@/shared/lib/cache';
import { cacheLife, cacheTag } from 'next/cache';
import type { Platform } from '../model/types';

/**
 * Нормализованный результат загрузки публичных материалов места.
 */
export type FetchPublicPlaceMaterialsResult =
  | { kind: 'success'; data: placeMaterialsListResponseSuccess['data'] }
  | { kind: 'validation_error'; data: placeMaterialsListResponseError['data'] }
  | { kind: 'not_found'; data: placeMaterialsListResponseError['data'] }
  | { kind: 'unexpected_error'; message: string };

/** Загружает кешируемые материалы публичного места для одной платформы. */
async function fetchCachedPublicPlaceMaterials(
  placeSlug: string,
  platform: Platform,
): Promise<placeMaterialsListResponseSuccess['data']> {
  'use cache';
  cacheLife(PUBLIC_CATALOG_CACHE_LIFE);
  cacheTag(getPlaceCacheTag(placeSlug));

  const query: PlaceMaterialsListParams = { platform };
  const response = await placeMaterialsList({ placeSlug }, query);
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
    if (isGeneratedApiError(error) && error.status === 422) {
      return {
        kind: 'validation_error',
        data: error.info as placeMaterialsListResponseError['data'],
      };
    }

    if (isGeneratedApiError(error) && error.status === 404) {
      return {
        kind: 'not_found',
        data: error.info as placeMaterialsListResponseError['data'],
      };
    }

    return {
      kind: 'unexpected_error',
      message: 'Не удалось загрузить материалы места.',
    };
  }
}
