import { fetchPublicCollections, mapCollectionToCardModel } from '@/entities/collection';

/** View model списка публичных подборок. */
export type CollectionsPageData =
  | { kind: 'ready'; collections: ReturnType<typeof mapCollectionToCardModel>[] }
  | { kind: 'unexpected_error'; message: string };

/** Загружает и преобразует список подборок для server-rendered route. */
export async function getCollectionsPageData(): Promise<CollectionsPageData> {
  const result = await fetchPublicCollections();

  if (result.kind === 'unexpected_error') return result;

  return {
    kind: 'ready',
    collections: result.data.map(mapCollectionToCardModel),
  };
}
