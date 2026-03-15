import { ListPlacesParams } from '@/entities/place/model/place';
import { ApiClient, components, HttpResult, toHttpResult } from '@/shared/api';

type PlaceListResponse = components['schemas']['PlaceListResponse'];
type ErrorResponse = components['schemas']['ErrorResponse'];
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
  };
}
