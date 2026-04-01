import type {
  GetPlaceMaterialsPathParams,
  GetPlaceMaterialsQueryDto,
  GetPlaceMaterialsRequestParams,
} from '@/modules/material/api/http/material.http.types';
import type { ListPlaceMaterialsParams } from '@/modules/material/model';

/**
 * Преобразует module-level параметры списка материалов места в transport DTO.
 *
 * @param params - Канонические параметры списка материалов места.
 * @returns Path/query DTO для `GET /places/{placeId}/materials`.
 */
export function mapListPlaceMaterialsParamsToRequestDto(
  params: ListPlaceMaterialsParams,
): GetPlaceMaterialsRequestParams {
  const path: GetPlaceMaterialsPathParams = {
    placeId: params.placeId,
  };

  const query: GetPlaceMaterialsQueryDto = {
    page: params.page,
    platform: params.platform,
  };

  return {
    path,
    query,
  };
}
