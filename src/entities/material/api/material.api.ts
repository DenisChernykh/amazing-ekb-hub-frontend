import type { MaterialApi } from '@/entities/material/api/contract/material.contract';
import { createMaterialHttp } from '@/entities/material/api/http/material.http';
import { MaterialListResponseSchema } from '@/entities/material/api/http/material.http.schema';
import type {
  GetPlaceMaterialsPathParams,
  GetPlaceMaterialsQueryDto,
  GetPlaceMaterialsRequestParams,
} from '@/entities/material/api/http/material.http.types';
import { mapMaterialListDtoToModel } from '@/entities/material/api/mappers/material.dto-to-model.mapper';
import type { ApiClient } from '@/shared/api';
import { FailureMeta, toRemoteResult } from '@/shared/failures';
import { resultOk } from '@/shared/lib/result';

const MATERIALS_BY_PLACE_META: Omit<FailureMeta, 'status'> = {
  endpoint: '/places/{placeId}/materials',
  method: 'GET',
};

/**
 * Создает result-first API сущности `material`.
 *
 * @param client - Typed API client для backend-вызовов сущности.
 * @returns Entity API со стабильным контрактом для app/features слоев.
 */
export function createMaterialApi(client: ApiClient): MaterialApi {
  const http = createMaterialHttp(client);

  return {
    async listByPlace(params) {
      const path: GetPlaceMaterialsPathParams = {
        placeId: params.placeId,
      };

      const query: GetPlaceMaterialsQueryDto = {
        page: params.page,
        platform: params.platform,
      };

      const requestParams: GetPlaceMaterialsRequestParams = {
        path,
        query,
      };

      const result = await toRemoteResult(
        http.listByPlace(requestParams),
        MATERIALS_BY_PLACE_META,
        MaterialListResponseSchema,
      );

      if (!result.ok) {
        return result;
      }

      return resultOk(mapMaterialListDtoToModel(result.data), result.meta);
    },
  };
}
