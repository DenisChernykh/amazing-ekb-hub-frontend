import { fetchAllPublicPlaceSlugs } from '@/entities/place';

/** Возвращает slug мест, которые Next.js может подготовить во время сборки. */
export async function getPlaceStaticParams() {
  const slugs = await fetchAllPublicPlaceSlugs();
  return slugs.map((placeSlug) => ({ placeSlug }));
}
