import {
  collectionsGet,
  type collectionsGetResponseError,
  type collectionsGetResponseSuccess,
} from '@/shared/api/generated/collections/collections';
import { isGeneratedApiError } from '@/shared/lib/api/is-generated-api-error';
import {
  PUBLIC_CATALOG_CACHE_LIFE,
  getCollectionCacheTag,
  getCollectionPlacesCacheTag,
} from '@/shared/lib/cache';
import { cacheLife, cacheTag } from 'next/cache';
import { COLLECTION_PAGE_SIZE } from '../model/types';

/** Нормализованный результат загрузки страницы публичной подборки. */
export type FetchPublicCollectionPageResult =
  | { kind: 'success'; data: collectionsGetResponseSuccess['data'] }
  | { kind: 'not_found'; data: collectionsGetResponseError['data'] };

/** Загружает кешируемую страницу публичной подборки. */
async function fetchCachedPublicCollectionPage(
  collectionSlug: string,
  page: number,
): Promise<collectionsGetResponseSuccess['data']> {
  'use cache';
  cacheLife(PUBLIC_CATALOG_CACHE_LIFE);
  cacheTag(getCollectionCacheTag(collectionSlug));
  cacheTag(getCollectionPlacesCacheTag(collectionSlug));

  const response = await collectionsGet(
    { collectionSlug },
    { page, pageSize: COLLECTION_PAGE_SIZE },
  );
  return response.data;
}

/**
 * Загружает страницу подборки и нормализует ожидаемый 404.
 *
 * @param collectionSlug - Проверенный public slug подборки.
 * @param page - Положительный номер страницы.
 * @returns Результат загрузки со штатными ветками `success` или `not_found`.
 * @throws Исходную техническую ошибку, чтобы её обработал ближайший route error boundary.
 */
export async function fetchPublicCollectionPage(
  collectionSlug: string,
  page: number,
): Promise<FetchPublicCollectionPageResult> {
  try {
    return {
      kind: 'success',
      data: await fetchCachedPublicCollectionPage(collectionSlug, page),
    };
  } catch (error) {
    if (isGeneratedApiError(error) && error.status === 404) {
      return {
        kind: 'not_found',
        data: error.info as collectionsGetResponseError['data'],
      };
    }

    throw error;
  }
}
