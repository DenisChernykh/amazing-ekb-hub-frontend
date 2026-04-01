import type {
  GetPlaceDetailHttpResult,
  GetPlaceDetailPathParams,
  GetPlaceListHttpResult,
  GetPlaceListQueryDto,
  PlaceHttpClient,
} from '@/entities/place/api/http/place.http.types';
import { apiClient, toHttpResult } from '@/shared/api';

/**
 * Низкоуровневый HTTP transport для сущности `place`.
 */
export interface PlaceHttp {
  /**
   * Выполняет `GET /places`.
   *
   * @param query - Query DTO списка мест.
   * @returns Сырой HTTP-результат без нормализации в `RemoteFailure`.
   */
  list(query: GetPlaceListQueryDto): Promise<GetPlaceListHttpResult>;

  /**
   * Выполняет `GET /places/{placeId}`.
   *
   * @param path - Path DTO detail-страницы места.
   * @returns Сырой HTTP-результат без нормализации в `RemoteFailure`.
   */
  getDetail(path: GetPlaceDetailPathParams): Promise<GetPlaceDetailHttpResult>;
}

/**
 * Создает HTTP transport для сущности `place`.
 *
 * @param client - Typed API client.
 * @returns Набор raw HTTP-операций `place`.
 */
export function createPlaceHttp(client: PlaceHttpClient = apiClient): PlaceHttp {
  return {
    async list(query) {
      const response = await client.GET('/places', {
        params: {
          query,
        },
      });

      return toHttpResult(response);
    },

    async getDetail(path) {
      const response = await client.GET('/places/{placeId}', {
        params: {
          path,
        },
      });

      return toHttpResult(response);
    },
  };
}
