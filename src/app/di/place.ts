import 'server-only';

import { createPlaceApi, type ListPlacesParams, type PlaceApi } from '@/entities/place';
import { createApiClient } from '@/shared/api';
import { getServerApiBaseUrl } from '@/shared/api/server';

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
export async function listHomePlaces(params: ListPlacesParams) {
  const api = await createServerPlaceApi();

  return api.list(params);
}
