import { ListPlacesParams, PlaceList } from '@/entities/place/model/place';
import { HttpSuccessMeta, RemoteFailure } from '@/shared/failures';
import { Result } from '@/shared/lib/result';

/**
 * Result-first ответ списка мест.
 */
export type PlaceListResult = Result<PlaceList, RemoteFailure, HttpSuccessMeta>;

/**
 * Контракт data-access слоя сущности `place`.
 */
export interface PlaceApi {
  /**
   * Загружает список мест по query-параметрам.
   *
   * @param params - Параметры backend-запроса.
   * @returns Result-first ответ списка мест.
   */
  list(params: ListPlacesParams): Promise<PlaceListResult>;
}
