import { fetchPublicCollections } from '@/entities/collection';

/** Возвращает известные публичные collection slug для статической подготовки Next.js. */
export async function getCollectionStaticParams() {
  const result = await fetchPublicCollections();

  if (result.kind === 'unexpected_error') {
    throw new Error(result.message);
  }

  return result.data.map(({ slug: collectionSlug }) => ({ collectionSlug }));
}
