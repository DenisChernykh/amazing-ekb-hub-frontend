import { MATERIAL_PLATFORMS, Platform } from '@/entities/material';
import {
  getSingleSearchParam,
  parsePositivePage,
  SearchParamValue,
} from '@/shared/lib/search-params';

/**
 * Контракт `searchParams` для detail-экрана места.
 */
export type PlaceDetailScreenSearchParams = {
  dzenPage?: SearchParamValue;
  telegramPage?: SearchParamValue;
  instagramPage?: SearchParamValue;
};

/**
 * Канонический shape платформенной пагинации detail-экрана.
 */
export type PlaceDetailPlatformPages = Record<Platform, number>;
/**
 * Query keys платформенной пагинации detail-экрана.
 */
export const PLACE_DETAIL_PAGE_QUERY_KEYS: Record<Platform, keyof PlaceDetailScreenSearchParams> = {
  dzen: 'dzenPage',
  telegram: 'telegramPage',
  instagram: 'instagramPage',
};
/**
 * Нормализует route-level `searchParams` detail-экрана в канонический
 * набор страниц по платформам.
 *
 * @param searchParamsPromise - Promise с query params из Next page.
 * @returns Нормализованные номера страниц по платформам.
 */
export async function resolvePlaceDetailPlatformPages(
  searchParamsPromise?: Promise<PlaceDetailScreenSearchParams>,
): Promise<PlaceDetailPlatformPages> {
  const searchParams = (await searchParamsPromise) ?? {};

  return {
    dzen: parsePositivePage(getSingleSearchParam(searchParams.dzenPage)) ?? 1,
    telegram: parsePositivePage(getSingleSearchParam(searchParams.telegramPage)) ?? 1,
    instagram: parsePositivePage(getSingleSearchParam(searchParams.instagramPage)) ?? 1,
  };
}
/**
 * Строит href detail-экрана с учетом пагинации по платформам.
 *
 * @param args - Идентификатор места, текущие страницы платформ и целевая платформа/страница.
 * @returns Href detail-экрана с нормализованным query string.
 */
export function buildPlaceDetailPageHref(args: {
  placeId: string;
  platform: Platform;
  platformPages: PlaceDetailPlatformPages;
  targetPage: number;
}): string {
  const { placeId, platform, platformPages, targetPage } = args;
  const searchParams = new URLSearchParams();

  for (const currentPlatform of MATERIAL_PLATFORMS) {
    const page = currentPlatform === platform ? targetPage : platformPages[currentPlatform];

    if (page > 1) {
      searchParams.set(PLACE_DETAIL_PAGE_QUERY_KEYS[currentPlatform], String(page));
    }
  }

  const queryString = searchParams.toString();

  return queryString.length > 0 ? `/places/${placeId}?${queryString}` : `/places/${placeId}`;
}
