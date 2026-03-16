import type { ListPlacesParams, PlaceCategory } from '@/entities/place';
import { isPlaceCategory } from '@/entities/place';

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
 * Достаёт одно строковое значение из Next `searchParams`.
 *
 * @param value - Значение query-параметра в формате App Router.
 * @returns Непустую строку или `undefined`, если параметр отсутствует или пуст.
 */
function getSingleSearchParam(value: SearchParamValue): string | undefined {
  if (Array.isArray(value)) {
    const firstValue = value[0]?.trim();

    return firstValue && firstValue.length > 0 ? firstValue : undefined;
  }

  const normalizedValue = value?.trim();

  return normalizedValue && normalizedValue.length > 0 ? normalizedValue : undefined;
}

/**
 * Нормализует номер страницы из query-параметра.
 *
 * @param value - Строковое значение `page`.
 * @returns Положительный целый номер страницы или `undefined`, если значение невалидно.
 */
function parsePositivePage(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return undefined;
  }

  return parsedValue;
}

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
