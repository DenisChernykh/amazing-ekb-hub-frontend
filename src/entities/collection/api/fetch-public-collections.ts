import { collectionsList } from '@/shared/api/generated/collections/collections';
import type { PublicCollectionListResponseDto } from '@/shared/api/generated/model/publicCollectionListResponseDto';
import { PUBLIC_CATALOG_CACHE_LIFE, getCollectionsCacheTag } from '@/shared/lib/cache';
import { cacheLife, cacheTag } from 'next/cache';

/** Нормализованный результат загрузки списка публичных подборок. */
export type FetchPublicCollectionsResult = {
  kind: 'success';
  data: PublicCollectionListResponseDto['items'];
};

/** Загружает кешируемый список публичных подборок. */
async function fetchCachedPublicCollections(): Promise<PublicCollectionListResponseDto['items']> {
  'use cache';
  cacheLife(PUBLIC_CATALOG_CACHE_LIFE);
  cacheTag(getCollectionsCacheTag());

  const response = await collectionsList();
  return response.data.items;
}

/**
 * Загружает список публичных подборок, сохраняя технические ошибки для route error boundary.
 *
 * @returns Упорядоченный список подборок.
 * @throws Исходную техническую ошибку загрузки или разбора ответа.
 */
export async function fetchPublicCollections(): Promise<FetchPublicCollectionsResult> {
  return { kind: 'success', data: await fetchCachedPublicCollections() };
}
