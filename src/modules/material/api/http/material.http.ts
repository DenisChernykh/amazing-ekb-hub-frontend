import type {
  GetPlaceMaterialsHttpResult,
  GetPlaceMaterialsRequestParams,
  MaterialHttpClient,
} from '@/modules/material/api/http/material.http.types';
import { apiClient, toHttpResult } from '@/shared/api';

/**
 * Низкоуровневый HTTP transport для модуля `material`.
 */
export interface MaterialHttp {
  /**
   * Выполняет `GET /places/{placeId}/materials`.
   *
   * @param params - Transport DTO path/query материалов места.
   * @returns Сырой HTTP-результат без классификации success/error flow.
   */
  listByPlace(params: GetPlaceMaterialsRequestParams): Promise<GetPlaceMaterialsHttpResult>;
}

/**
 * Создает HTTP transport для модуля `material`.
 *
 * @param client - Typed API client.
 * @returns Набор raw HTTP-операций `material`.
 */
export function createMaterialHttp(client: MaterialHttpClient = apiClient): MaterialHttp {
  return {
    async listByPlace(params) {
      const response = await client.GET('/places/{placeId}/materials', {
        params: {
          path: params.path,
          query: params.query,
        },
      });

      return toHttpResult(response);
    },
  };
}
