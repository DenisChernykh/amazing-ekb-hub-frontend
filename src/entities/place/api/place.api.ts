import type { PlaceApi } from '@/entities/place/api/contract/place.contract';
import { createPlaceHttp } from '@/entities/place/api/http/place.http';
import {
  PlaceDetailResponseSchema,
  PlaceListResponseSchema,
} from '@/entities/place/api/http/place.http.schema';
import type {
  GetPlaceDetailPathParams,
  GetPlaceListQueryDto,
} from '@/entities/place/api/http/place.http.types';
import {
  mapPlaceDetailDtoToModel,
  mapPlaceListDtoToModel,
} from '@/entities/place/api/mappers/place.dto-to-model.mapper';
import type { ApiClient } from '@/shared/api';
import { FailureMeta, toRemoteResult } from '@/shared/failures';
import { resultOk } from '@/shared/lib/result';

const PLACES_LIST_META: Omit<FailureMeta, 'status'> = {
  endpoint: '/places',
  method: 'GET',
};

const PLACE_DETAIL_META: Omit<FailureMeta, 'status'> = {
  endpoint: '/places/{placeId}',
  method: 'GET',
};

/**
 * Создает result-first API сущности `place`.
 *
 * @param client - Typed API client для backend-вызовов сущности.
 * @returns Entity API со стабильным контрактом для app/features слоев.
 */
export function createPlaceApi(client: ApiClient): PlaceApi {
  const http = createPlaceHttp(client);

  return {
    async list(params) {
      const query: GetPlaceListQueryDto = {
        page: params.page,
        pageSize: params.pageSize,
        sort: params.sort,
        ...(params.search ? { search: params.search } : {}),
        ...(params.category ? { category: params.category } : {}),
      };

      const result = await toRemoteResult(
        http.list(query),
        PLACES_LIST_META,
        PlaceListResponseSchema,
      );

      if (!result.ok) {
        return result;
      }

      return resultOk(mapPlaceListDtoToModel(result.data), result.meta);
    },

    async getDetail(placeId) {
      const path: GetPlaceDetailPathParams = {
        placeId,
      };

      const result = await toRemoteResult(
        http.getDetail(path),
        PLACE_DETAIL_META,
        PlaceDetailResponseSchema,
      );

      if (!result.ok) {
        return result;
      }

      return resultOk(mapPlaceDetailDtoToModel(result.data), result.meta);
    },
  };
}
