import type { paths } from '@/shared/api/schema.generated';
import { API_BASE_PATH } from '@/shared/config/api';
import createClient from 'openapi-fetch';
import type { HttpResult } from './http-result';

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
 * Преобразует ответ `openapi-fetch` в унифицированный `HttpResult`.
 *
 * @typeParam TData - Тип успешного payload.
 * @typeParam TError - Тип ошибочного payload.
 * @param response - Результат вызова `openapi-fetch`.
 * @returns Сырой HTTP-результат без нормализации в domain/contract/transport failure.
 */
export function toHttpResult<TData, TError>(response: {
  data?: TData;
  error?: TError;
  response: Response;
}): HttpResult<TData, TError> {
  return {
    ok: response.response.ok,
    status: response.response.status,
    data: response.data,
    error: response.error,
    headers: response.response.headers,
  };
}

/**
 * Базовый singleton-клиент frontend-приложения для запросов к backend.
 */
export const apiClient = createApiClient();

/**
 * Тип singleton-клиента backend API.
 */
export type ApiClient = ReturnType<typeof createApiClient>;
