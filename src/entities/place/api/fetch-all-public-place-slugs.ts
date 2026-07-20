import { listPlaces } from '@/shared/api/generated/places/places';
import { PUBLIC_CATALOG_CACHE_LIFE } from '@/shared/lib/cache';
import { cacheLife } from 'next/cache';

const BUILD_PAGE_SIZE = 100;

export async function fetchAllPublicPlaceSlugs(): Promise<string[]> {
  'use cache';
  cacheLife(PUBLIC_CATALOG_CACHE_LIFE);

  const slugs: string[] = [];
  let page = 1;

  while (true) {
    const response = await listPlaces({ page, pageSize: BUILD_PAGE_SIZE });
    slugs.push(...response.data.items.map(({ slug }) => slug));

    if (slugs.length >= response.data.total) return slugs;
    page += 1;
  }
}
