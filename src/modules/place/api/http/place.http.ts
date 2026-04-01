import type {
  GetPlaceDetailHttpResult,
  GetPlaceDetailPathParams,
  GetPlaceListHttpResult,
  GetPlaceListQueryDto,
  PlaceHttpClient,
} from '@/modules/place/api/http/place.http.types';
import { apiClient, toHttpResult } from '@/shared/api';

/**
 * Низкоуровневый HTTP transport для списка и detail мест.
 */
export interface PlaceHttp {
  /**
   * Выполняет `GET /places`.
   *
   * @param query - Query DTO списка мест.
   * @returns Сырой HTTP-результат без классификации success/error flow.
   */
  list(query: GetPlaceListQueryDto): Promise<GetPlaceListHttpResult>;

  /**
   * Выполняет `GET /places/{placeId}`.
   *
   * @param path - Path DTO detail-страницы места.
   * @returns Сырой HTTP-результат detail-страницы места.
   */
  getDetail(path: GetPlaceDetailPathParams): Promise<GetPlaceDetailHttpResult>;
}

/**
 * Создает HTTP transport для модуля `place`.
 *
 * @param client - Typed API client.
 * @returns Набор raw HTTP-операций списка и detail мест.
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
