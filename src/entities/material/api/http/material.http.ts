import { ListPlaceMaterialsParams } from '@/entities/material/model/material';
import { ApiClient, components, HttpResult, toHttpResult } from '@/shared/api';

type MaterialListResponse = components['schemas']['MaterialListResponse'];
type ErrorResponse = components['schemas']['ErrorResponse'];
/**
 * Низкоуровневый HTTP transport для сущности `material`.
 */
export interface MaterialHttp {
  /**
   * Выполняет `GET /places/{placeId}/materials`.
   *
   * @param params - Параметры запроса материалов места.
   * @returns Сырой HTTP-результат без нормализации в `RemoteFailure`.
   */
  listByPlace(
    params: ListPlaceMaterialsParams,
  ): Promise<HttpResult<MaterialListResponse, ErrorResponse>>;
} /**
 * Создает HTTP transport для сущности `material`.
 *
 * @param client - Typed API client.
 * @returns Набор raw HTTP-операций `material`.
 */
export function createMaterialHttp(client: ApiClient): MaterialHttp {
  return {
    async listByPlace(params) {
      const response = await client.GET('/places/{placeId}/materials', {
        params: {
          path: {
            placeId: params.placeId,
          },
          query: {
            page: params.page,
            platform: params.platform,
          },
        },
      });

      return toHttpResult(response);
    },
  };
}
