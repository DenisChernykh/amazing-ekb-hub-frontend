import { fetchAllPublicPlaceSlugs } from '@/entities/place';

export async function getPlaceStaticParams() {
  const slugs = await fetchAllPublicPlaceSlugs();
  return slugs.map((placeSlug) => ({ placeSlug }));
}
