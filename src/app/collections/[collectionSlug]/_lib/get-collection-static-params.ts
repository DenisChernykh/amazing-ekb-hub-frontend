import { fetchPublicCollections } from '@/entities/collection';

/** Возвращает известные публичные collection slug для статической подготовки Next.js. */
export async function getCollectionStaticParams() {
  const result = await fetchPublicCollections();

  return result.data.map(({ slug: collectionSlug }) => ({ collectionSlug }));
}
