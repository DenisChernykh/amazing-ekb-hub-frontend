import type { paths } from '@/shared/api/schema.generated';
import { API_BASE_PATH } from '@/shared/config/api';
import createClient from 'openapi-fetch';

/**
 * Создаёт typed-клиент для backend API на основе OpenAPI-схемы.
 *
 * @param baseUrl - Базовый API-путь. По умолчанию используется `API_BASE_PATH`.
 * @returns Клиент `openapi-fetch`, настроенный на same-origin запросы к backend.
 */
export function createApiClient(baseUrl: string = API_BASE_PATH) {
  return createClient<paths>({
    baseUrl,
    credentials: 'same-origin',
  });
}

/**
 * Базовый singleton-клиент frontend-приложения для запросов к backend API.
 */
export const apiClient = createApiClient();

/**
 * Тип singleton-клиента backend API.
 */
export type ApiClient = ReturnType<typeof createApiClient>;
