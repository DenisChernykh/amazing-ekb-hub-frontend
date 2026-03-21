import { createMaterialApi, ListPlaceMaterialsParams, MaterialApi } from '@/entities/material';
import { createApiClient } from '@/shared/api';
import { getServerApiBaseUrl } from '@/shared/api/server';
import 'server-only';

/**
 * Создает bound server-side API сущности `material` для текущего request origin.
 *
 * @returns Инициализированный entity API материалов места.
 */
async function createServerMaterialApi(): Promise<MaterialApi> {
  const baseUrl = await getServerApiBaseUrl();
  const client = createApiClient(baseUrl);

  return createMaterialApi(client);
}
/**
 * Загружает материалы места для одной платформы и одной страницы.
 *
 * @param params - Идентификатор места, платформа и номер страницы.
 * @returns Result-first ответ со списком материалов или typed remote failure.
 */
export async function listPlaceMaterials(params: ListPlaceMaterialsParams) {
  const api = await createServerMaterialApi();

  return api.listByPlace(params);
}
