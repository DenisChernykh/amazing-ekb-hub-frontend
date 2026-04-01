import 'server-only';

import { createMaterialApi, type MaterialApi } from '@/modules/material/api';
import { createApiClient } from '@/shared/api';
import { getServerApiBaseUrl } from '@/shared/api/server';

/**
 * Создает server-side API модуля `material`.
 *
 * @returns Инициализированный `MaterialApi` для server-only сценариев.
 */
export async function createServerMaterialApi(): Promise<MaterialApi> {
  const baseUrl = await getServerApiBaseUrl();
  const client = createApiClient(baseUrl);

  return createMaterialApi(client);
}
