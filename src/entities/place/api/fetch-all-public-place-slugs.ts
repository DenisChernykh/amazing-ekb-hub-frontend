import { listPlaces } from '@/shared/api/generated/places/places';
import { PUBLIC_CATALOG_CACHE_LIFE } from '@/shared/lib/cache';
import { cacheLife } from 'next/cache';

const BUILD_PAGE_SIZE = 100;

/** Перечисляет slug всех активных публичных мест для статической генерации. */
export async function fetchAllPublicPlaceSlugs(): Promise<string[]> {
  'use cache';
  cacheLife(PUBLIC_CATALOG_CACHE_LIFE);

  const slugs: string[] = [];
  let seenItems = 0;
  let page = 1;

  while (true) {
    const response = await listPlaces({ page, pageSize: BUILD_PAGE_SIZE });
    const { items, total } = response.data;

    if (items.length === 0 && seenItems < total) {
      throw new Error(
        `Public place slug enumeration stopped: page ${page} returned no items before total ${total} was reached (${seenItems} items seen).`,
      );
    }

    seenItems += items.length;
    slugs.push(...items.filter(({ status }) => status === 'active').map(({ slug }) => slug));

    if (seenItems >= total) return slugs;
    page += 1;
  }
}
