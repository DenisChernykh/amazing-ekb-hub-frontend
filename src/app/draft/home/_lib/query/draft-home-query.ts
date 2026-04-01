import { buildPlaceListParams, type ListPlacesParams } from '@/modules/place';
import {
  getSingleSearchParam,
  parsePositivePage,
  type SearchParamValue,
} from '@/shared/lib/search-params';

/**
 * Контракт `searchParams` для draft home-страницы.
 */
export interface DraftHomeSearchParams {
  /**
   * Номер страницы.
   */
  page?: SearchParamValue;

  /**
   * Поисковая строка.
   */
  search?: SearchParamValue;

  /**
   * Категория места.
   */
  category?: SearchParamValue;
}

/**
 * Нормализует route-level `searchParams` draft home-экрана
 * в канонический `ListPlacesParams`.
 *
 * @param searchParamsPromise - Promise с query params из Next page.
 * @returns Backend-ready параметры списка мест.
 */
export async function resolveDraftHomeSearchParams(
  searchParamsPromise?: Promise<DraftHomeSearchParams>,
): Promise<ListPlacesParams> {
  const searchParams = (await searchParamsPromise) ?? {};

  return buildPlaceListParams({
    page: parsePositivePage(getSingleSearchParam(searchParams.page)),
    search: getSingleSearchParam(searchParams.search),
    category: getSingleSearchParam(searchParams.category),
  });
}
