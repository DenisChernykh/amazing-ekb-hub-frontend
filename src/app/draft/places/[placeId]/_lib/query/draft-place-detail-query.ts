import { MATERIAL_PLATFORMS, type Platform } from '@/modules/material';
import {
  getSingleSearchParam,
  parsePositivePage,
  type SearchParamValue,
} from '@/shared/lib/search-params';

/**
 * Контракт `searchParams` для draft detail-экрана места.
 */
export type DraftPlaceDetailSearchParams = {
  dzenPage?: SearchParamValue;
  telegramPage?: SearchParamValue;
  instagramPage?: SearchParamValue;
};

/**
 * Канонический shape платформенной пагинации detail-экрана.
 */
export type DraftPlaceDetailPlatformPages = Record<Platform, number>;

/**
 * Query keys платформенной пагинации detail-экрана.
 */
export const DRAFT_PLACE_DETAIL_PAGE_QUERY_KEYS: Record<
  Platform,
  keyof DraftPlaceDetailSearchParams
> = {
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
export async function resolveDraftPlaceDetailPlatformPages(
  searchParamsPromise?: Promise<DraftPlaceDetailSearchParams>,
): Promise<DraftPlaceDetailPlatformPages> {
  const searchParams = (await searchParamsPromise) ?? {};

  return {
    dzen: parsePositivePage(getSingleSearchParam(searchParams.dzenPage)) ?? 1,
    telegram: parsePositivePage(getSingleSearchParam(searchParams.telegramPage)) ?? 1,
    instagram: parsePositivePage(getSingleSearchParam(searchParams.instagramPage)) ?? 1,
  };
}

/**
 * Строит href draft detail-экрана с учетом пагинации по платформам.
 *
 * @param args - Идентификатор места, текущие страницы платформ и целевая платформа/страница.
 * @returns Href detail-экрана с нормализованным query string.
 */
export function buildDraftPlaceDetailHref(args: {
  placeId: string;
  platform: Platform;
  platformPages: DraftPlaceDetailPlatformPages;
  targetPage: number;
}): string {
  const { placeId, platform, platformPages, targetPage } = args;
  const searchParams = new URLSearchParams();

  for (const currentPlatform of MATERIAL_PLATFORMS) {
    const page = currentPlatform === platform ? targetPage : platformPages[currentPlatform];

    if (page > 1) {
      searchParams.set(DRAFT_PLACE_DETAIL_PAGE_QUERY_KEYS[currentPlatform], String(page));
    }
  }

  const queryString = searchParams.toString();
  const pathname = `/draft/places/${placeId}`;

  return queryString.length > 0 ? `${pathname}?${queryString}` : pathname;
}
