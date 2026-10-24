import { fetchPublicCollections, mapCollectionToCardModel } from '@/entities/collection';

/** View model списка публичных подборок. */
export type CollectionsPageData = {
  kind: 'ready';
  collections: ReturnType<typeof mapCollectionToCardModel>[];
};

/** Загружает и преобразует список подборок для server-rendered route. */
export async function getCollectionsPageData(): Promise<CollectionsPageData> {
  const result = await fetchPublicCollections();

  return {
    kind: 'ready',
    collections: result.data.map(mapCollectionToCardModel),
  };
}
