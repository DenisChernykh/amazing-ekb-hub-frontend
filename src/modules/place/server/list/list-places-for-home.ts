import 'server-only';

import type { ListPlacesParams, PlaceList } from '@/modules/place/model';
import { createServerPlaceApi } from '../factory';

/**
 * Загружает список мест для server-first home-сценариев.
 *
 * @param params - Backend-ready параметры списка мест.
 * @returns Доменную модель списка мест.
 *
 * @remarks
 * Метод использует throw-based API-контур и предназначен для RSC/route loaders.
 */
export async function listPlacesForHome(params: ListPlacesParams): Promise<PlaceList> {
  const placeApi = await createServerPlaceApi();

  return placeApi.list(params);
}
