import type { ListPlacesParams, PlaceCategory } from '@/entities/place';
import { isPlaceCategory } from '@/entities/place';
import { getSingleSearchParam, parsePositivePage } from '@/shared/lib/search-params';

type SearchParamValue = string | string[] | undefined;

/**
 * Контракт `searchParams` для главной страницы в Next App Router.
 */
export type HomePageSearchParams = {
  page?: SearchParamValue;
  search?: SearchParamValue;
  category?: SearchParamValue;
};

const DEFAULT_HOME_PLACES_PARAMS: ListPlacesParams = {
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
 * Нормализует route-level `searchParams` главной страницы в канонический `ListPlacesParams`.
 *
 * @param searchParamsPromise - Promise с query params из Next page.
 * @returns Параметры списка мест с default-значениями и отброшенными невалидными значениями.
 */
export async function resolveHomePageParams(
  searchParamsPromise?: Promise<HomePageSearchParams>,
): Promise<ListPlacesParams> {
  const searchParams = (await searchParamsPromise) ?? {};

  const page = parsePositivePage(getSingleSearchParam(searchParams.page));
  const search = getSingleSearchParam(searchParams.search);
  const category = parsePlaceCategory(getSingleSearchParam(searchParams.category));

  return {
    ...DEFAULT_HOME_PLACES_PARAMS,
    ...(page ? { page } : {}),
    ...(search ? { search } : {}),
    ...(category ? { category } : {}),
  };
}
