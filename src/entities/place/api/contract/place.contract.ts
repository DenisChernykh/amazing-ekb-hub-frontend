import { ListPlacesParams, PlaceDetail, PlaceList } from '@/entities/place/model/place';
import { HttpSuccessMeta, RemoteFailure } from '@/shared/failures';
import { Result } from '@/shared/lib/result';

/**
 * Result-first ответ списка мест.
 */
export type PlaceListResult = Result<PlaceList, RemoteFailure, HttpSuccessMeta>;
/**
 * Result-first ответ детальной карточки места.
 */
export type PlaceDetailResult = Result<PlaceDetail, RemoteFailure, HttpSuccessMeta>;

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
  /**
   * Загружает детальную карточку места по идентификатору.
   *
   * @param placeId - Идентификатор места.
   * @returns Result-first ответ детальной карточки места.
   */
  getDetail(placeId: string): Promise<PlaceDetailResult>;
}
