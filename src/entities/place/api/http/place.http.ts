import { ListPlacesParams } from '@/entities/place/model/place';
import { ApiClient, components, HttpResult, toHttpResult } from '@/shared/api';

type PlaceListResponse = components['schemas']['PlaceListResponse'];
type ErrorResponse = components['schemas']['ErrorResponse'];
type PlaceDetailResponse = components['schemas']['PlaceDetail'];
/**
 * Низкоуровневый HTTP transport для сущности `place`.
 */
export interface PlaceHttp {
  /**
   * Выполняет `GET /places`.
   *
   * @param params - Query-параметры списка мест.
   * @returns Сырой HTTP-результат без нормализации в `RemoteFailure`.
   */
  list(params: ListPlacesParams): Promise<HttpResult<PlaceListResponse, ErrorResponse>>;
  /**
   * Выполняет `GET /places/{placeId}`.
   *
   * @param placeId - Идентификатор места.
   * @returns Сырой HTTP-результат без нормализации в `RemoteFailure`.
   */
  getDetail(placeId: string): Promise<HttpResult<PlaceDetailResponse, ErrorResponse>>;
}

/**
 * Создает HTTP transport для сущности `place`.
 *
 * @param client - Typed API client.
 * @returns Набор raw HTTP-операций `place`.
 */
export function createPlaceHttp(client: ApiClient): PlaceHttp {
  return {
    async list(params) {
      const response = await client.GET('/places', {
        params: {
          query: params,
        },
      });

      return toHttpResult(response);
    },

    async getDetail(placeId) {
      const response = await client.GET('/places/{placeId}', {
        params: {
          path: {
            placeId,
          },
        },
      });

      return toHttpResult(response);
    },
  };
}
