import type { ListPlacesParams, PlaceCategory } from '@/entities/place';
import { isPlaceCategory } from '@/entities/place';
import {
  getSingleSearchParam,
  parsePositivePage,
  type SearchParamValue,
} from '@/shared/lib/search-params';

/**
 * Контракт `searchParams` для home/place-feed экрана.
 */
export type PlaceFeedScreenSearchParams = {
  page?: SearchParamValue;
  search?: SearchParamValue;
  category?: SearchParamValue;
};

/**
 * Query keys home/place-feed экрана.
 */
export const PLACE_FEED_QUERY_KEYS = {
  page: 'page',
  search: 'search',
  category: 'category',
} as const;

const DEFAULT_PLACE_FEED_PARAMS: ListPlacesParams = {
  page: 1,
  pageSize: 20,
  sort: 'popular',
};

/**
 * Нормализует категорию места из query-параметра.
 *
 * @param value - Строковое значение `category`.
 * @returns Валидную `PlaceCategory` или `undefined`, если категория отсутствует или неизвестна.
 */
function parsePlaceCategory(value: string | undefined): PlaceCategory | undefined {
  if (!value) {
    return undefined;
  }

  return isPlaceCategory(value) ? value : undefined;
}

/**
 * Нормализует route-level `searchParams` home-экрана в канонический `ListPlacesParams`.
 *
 * @param searchParamsPromise - Promise с query params из Next page.
 * @returns Параметры списка мест с default-значениями и отброшенными невалидными значениями.
 */
export async function resolvePlaceFeedSearchParams(
  searchParamsPromise?: Promise<PlaceFeedScreenSearchParams>,
): Promise<ListPlacesParams> {
  const searchParams = (await searchParamsPromise) ?? {};

  const page = parsePositivePage(getSingleSearchParam(searchParams.page));
  const category = parsePlaceCategory(getSingleSearchParam(searchParams.category));
  const search = getSingleSearchParam(searchParams.search);

  return {
    ...DEFAULT_PLACE_FEED_PARAMS,
    ...(page ? { page } : {}),
    ...(category ? { category } : {}),
    ...(search ? { search } : {}),
  };
}
