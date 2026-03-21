import type { Platform } from '@/entities/place';
import {
  getSingleSearchParam,
  parsePositivePage,
  type SearchParamValue,
} from '@/shared/lib/search-params';

/**
 * Контракт `searchParams` для detail-страницы места.
 */
export type PlaceDetailPageSearchParams = {
  dzenPage?: SearchParamValue;
  telegramPage?: SearchParamValue;
  instagramPage?: SearchParamValue;
};

/**
 * Канонический shape платформенной пагинации detail-страницы.
 */
export type PlaceDetailPlatformPages = Record<Platform, number>;

/**
 * Нормализует route-level `searchParams` detail-страницы в канонический
 * набор страниц по платформам.
 *
 * @param searchParamsPromise - Promise с query params из Next page.
 * @returns Нормализованные номера страниц по `dzen`, `telegram`, `instagram`.
 */
export async function resolvePlaceDetailPlatformPages(
  searchParamsPromise?: Promise<PlaceDetailPageSearchParams>,
): Promise<PlaceDetailPlatformPages> {
  const searchParams = (await searchParamsPromise) ?? {};

  return {
    dzen: parsePositivePage(getSingleSearchParam(searchParams.dzenPage)) ?? 1,
    telegram: parsePositivePage(getSingleSearchParam(searchParams.telegramPage)) ?? 1,
    instagram: parsePositivePage(getSingleSearchParam(searchParams.instagramPage)) ?? 1,
  };
}
