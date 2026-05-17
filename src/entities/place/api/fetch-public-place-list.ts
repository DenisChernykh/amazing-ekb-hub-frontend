import type { ListPlacesParams } from '@/shared/api/generated/operation/listPlacesParams';
import {
  listPlaces,
  type listPlacesResponseError,
  type listPlacesResponseSuccess,
} from '@/shared/api/generated/places/places';
import { isGeneratedApiError } from '@/shared/lib/api/is-generated-api-error';
/**
 * Нормализованный результат загрузки публичного списка мест.
 *
 * @remarks
 * Тип отделяет штатную прикладную ошибку `bad_request` от неожиданной
 * технической ошибки.
 */
export type FetchPublicPlaceListResult =
  | { kind: 'success'; data: listPlacesResponseSuccess['data'] }
  | { kind: 'bad_request'; data: listPlacesResponseError['data'] }
  | { kind: 'unexpected_error'; message: string };
/**
 * Загружает публичный список мест и приводит ответ API к контролируемому union-результату.
 *
 * @param query - Нормализованные параметры запроса списка мест.
 * @returns Результат загрузки со штатными ветками `success`, `bad_request`,
 * или `unexpected_error`.
 */
export async function fetchPublicPlaceList(
  query: ListPlacesParams,
): Promise<FetchPublicPlaceListResult> {
  try {
    const response = await listPlaces(query, {
      cache: 'no-store',
    });

    return {
      kind: 'success',
      data: response.data,
    };
  } catch (error) {
    if (isGeneratedApiError(error) && error.status === 400) {
      return {
        kind: 'bad_request',
        data: error.info as listPlacesResponseError['data'],
      };
    }

    return {
      kind: 'unexpected_error',
      message: 'Не удалось загрузить список мест.',
    };
  }
}
