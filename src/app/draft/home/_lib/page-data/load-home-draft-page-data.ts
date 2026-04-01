import { listPlacesForHome, type ListPlacesParams, type PlaceList } from '@/modules/place';

/**
 * Полный server-side payload draft home-страницы.
 */
export interface HomeDraftPageData {
  /**
   * Нормализованные route params списка мест.
   */
  params: ListPlacesParams;

  /**
   * Доменная модель списка мест.
   */
  placeList: PlaceList;
}

/**
 * Загружает server-side данные, необходимые для draft home-страницы.
 *
 * @param params - Backend-ready параметры списка мест.
 * @returns Page-level data для route-level screen composition.
 */
export async function loadHomeDraftPageData(params: ListPlacesParams): Promise<HomeDraftPageData> {
  const placeList = await listPlacesForHome(params);

  return {
    params,
    placeList,
  };
}
