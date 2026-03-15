import 'server-only';

import { createPlaceApi, type ListPlacesParams, type PlaceApi } from '@/entities/place';
import { createApiClient } from '@/shared/api';
import { getServerApiBaseUrl } from '@/shared/api/server';

/**
 * Возвращает дефолтные query-параметры home-ленты мест.
 *
 * @returns Параметры первой страницы с сортировкой по популярности.
 */
export function getDefaultHomePlacesParams(): ListPlacesParams {
  return {
    page: 1,
    pageSize: 20,
    sort: 'popular',
  };
}

/**
 * Создает bound server-side API сущности `place` для текущего request origin.
 *
 * @returns Инициализированный entity API списка мест.
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
export async function listHomePlaces(params: ListPlacesParams = getDefaultHomePlacesParams()) {
  const api = await createServerPlaceApi();

  return api.list(params);
}
