import 'server-only';

import { createPlaceApi, type ListPlacesParams, type PlaceApi } from '@/entities/place';
import { createApiClient } from '@/shared/api';
import { getServerApiBaseUrl } from '@/shared/api/server';

/**
 * Создает bound server-side API сущности `place` для текущего request origin.
 *
 * @returns Инициализированный entity API списка и detail мест.
 */
async function createServerPlaceApi(): Promise<PlaceApi> {
  const baseUrl = await getServerApiBaseUrl();
  const client = createApiClient(baseUrl);

  return createPlaceApi(client);
}

/**
 * Загружает список мест для главной страницы через entity API.
 *
 * @param params - Нормализованные query-параметры home-ленты.
 * @returns Result-first ответ со списком мест или typed remote failure.
 */
export async function listHomePlaces(params: ListPlacesParams) {
  const api = await createServerPlaceApi();

  return api.list(params);
}

/**
 * Загружает детальную карточку места для detail-страницы.
 *
 * @param placeId - Идентификатор места из dynamic route.
 * @returns Result-first ответ с detail-моделью места или typed remote failure.
 */
export async function getPlaceDetail(placeId: string) {
  const api = await createServerPlaceApi();

  return api.getDetail(placeId);
}
