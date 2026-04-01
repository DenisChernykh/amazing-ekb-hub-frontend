import type { ListPlacesParams, PlaceDetail, PlaceList } from '@/modules/place/model';
import type { ApiClient } from '@/shared/api';
import { unwrapHttpResultAndMapOrThrow } from '@/shared/api';
import { createPlaceHttp } from './http/place.http';
import { PlaceDetailResponseSchema, PlaceListResponseSchema } from './http/place.http.schema';
import { mapListPlacesParamsToRequestDto } from './mappers/list-places-params-to-request-dto.mapper';
import { mapPlaceIdToDetailPathParams } from './mappers/place-id-to-detail-path-params.mapper';
import {
  mapPlaceDetailDtoToModel,
  mapPlaceListDtoToModel,
} from './mappers/place.dto-to-model.mapper';

/**
 * Throw-based контракт data-access слоя модуля `place`.
 */
export interface PlaceApi {
  /**
   * Загружает список мест по query-параметрам.
   *
   * @param params - Backend-ready параметры запроса.
   * @returns Доменную модель списка мест.
   *
   * @remarks
   * В случае HTTP/contract/runtime сбоя метод не возвращает `Result`,
   * а бросает типизированную ошибку для `std-errors` RSC-потока.
   */
  list(params: ListPlacesParams): Promise<PlaceList>;

  /**
   * Загружает детальную карточку места по идентификатору.
   *
   * @param placeId - Идентификатор места.
   * @returns Доменную detail-модель места.
   *
   * @remarks
   * В случае HTTP/contract/runtime сбоя метод не возвращает `Result`,
   * а бросает типизированную ошибку для `std-errors` RSC-потока.
   */
  getDetail(placeId: string): Promise<PlaceDetail>;
}

/**
 * Создает throw-based API модуля `place`.
 *
 * @param client - Typed API client.
 * @returns API со стабильным доменным контрактом для server/ui слоев.
 */
export function createPlaceApi(client: ApiClient): PlaceApi {
  const http = createPlaceHttp(client);

  return {
    async list(params) {
      return unwrapHttpResultAndMapOrThrow(
        http.list(mapListPlacesParamsToRequestDto(params)),
        PlaceListResponseSchema,
        mapPlaceListDtoToModel,
      );
    },

    async getDetail(placeId) {
      return unwrapHttpResultAndMapOrThrow(
        http.getDetail(mapPlaceIdToDetailPathParams(placeId)),
        PlaceDetailResponseSchema,
        mapPlaceDetailDtoToModel,
      );
    },
  };
}
