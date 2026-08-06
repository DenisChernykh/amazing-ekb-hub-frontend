import { collectionsList } from '@/shared/api/generated/collections/collections';
import type { PublicCollectionListResponseDto } from '@/shared/api/generated/model/publicCollectionListResponseDto';
import { PUBLIC_CATALOG_CACHE_LIFE, getCollectionsCacheTag } from '@/shared/lib/cache';
import { cacheLife, cacheTag } from 'next/cache';

/** Нормализованный результат загрузки списка публичных подборок. */
export type FetchPublicCollectionsResult =
  | { kind: 'success'; data: PublicCollectionListResponseDto['items'] }
  | { kind: 'unexpected_error'; message: string };

/** Загружает кешируемый список публичных подборок. */
async function fetchCachedPublicCollections(): Promise<PublicCollectionListResponseDto['items']> {
  'use cache';
  cacheLife(PUBLIC_CATALOG_CACHE_LIFE);
  cacheTag(getCollectionsCacheTag());

  const response = await collectionsList();
  return response.data.items;
}

/**
 * Загружает список публичных подборок и приводит технический сбой к controlled union.
 *
 * @returns Упорядоченный список подборок или deterministic error state.
 */
export async function fetchPublicCollections(): Promise<FetchPublicCollectionsResult> {
  try {
    return { kind: 'success', data: await fetchCachedPublicCollections() };
  } catch {
    return { kind: 'unexpected_error', message: 'Не удалось загрузить подборки.' };
  }
}
