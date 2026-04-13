import {
  ListPlaces200Response,
  ListPlaces400Response,
} from '@/shared/api/generated-zod/places/places.zod';
import type { ListPlacesParams } from '@/shared/api/generated/operation/listPlacesParams';
import { listPlaces } from '@/shared/api/generated/places/places';
import { isGeneratedApiError } from '@/shared/lib/api/is-generated-api-error';
/**
 * Нормализованный результат загрузки публичного списка мест.
 *
 * @remarks
 * Тип отделяет штатную прикладную ошибку `bad_request` от контрактной ошибки
 * интеграции и от неожиданной технической ошибки.
 */
export type FetchPublicPlaceListResult =
  | { kind: 'success'; data: ReturnType<typeof ListPlaces200Response.parse> }
  | { kind: 'bad_request'; data: ReturnType<typeof ListPlaces400Response.parse> }
  | { kind: 'contract_error'; message: string }
  | { kind: 'unexpected_error'; message: string };
/**
 * Загружает публичный список мест и приводит ответ API к контролируемому union-результату.
 *
 * @param query - Нормализованные параметры запроса списка мест.
 * @returns Результат загрузки со штатными ветками `success`, `bad_request`,
 * `contract_error` или `unexpected_error`.
 */
export async function fetchPublicPlaceList(
  query: ListPlacesParams,
): Promise<FetchPublicPlaceListResult> {
  try {
    const response = await listPlaces(query, {
      cache: 'no-store',
    });

    const parsed = ListPlaces200Response.safeParse(response.data);

    if (!parsed.success) {
      return {
        kind: 'contract_error',
        message: 'API вернул 200, но тело не совпало с контрактом.',
      };
    }

    return {
      kind: 'success',
      data: parsed.data,
    };
  } catch (error) {
    if (isGeneratedApiError(error) && error.status === 400) {
      const parsed = ListPlaces400Response.safeParse(error.info);

      if (!parsed.success) {
        return {
          kind: 'contract_error',
          message: 'API вернул 400, но тело ошибки не совпало с контрактом.',
        };
      }

      return {
        kind: 'bad_request',
        data: parsed.data,
      };
    }

    return {
      kind: 'unexpected_error',
      message: 'Не удалось загрузить список мест.',
    };
  }
}
