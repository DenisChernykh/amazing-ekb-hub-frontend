import 'server-only';

import { createPlaceApi, type PlaceApi } from '@/modules/place/api';
import { createApiClient } from '@/shared/api';
import { getServerApiBaseUrl } from '@/shared/api/server';

/**
 * Создает server-side API модуля `place`.
 *
 * @returns Инициализированный `PlaceApi` для server-only сценариев.
 */
export async function createServerPlaceApi(): Promise<PlaceApi> {
  const baseUrl = await getServerApiBaseUrl();
  const client = createApiClient(baseUrl);

  return createPlaceApi(client);
}
