import type { PlaceApi } from '@/entities/place/api/contract/place.contract';
import { createPlaceHttp } from '@/entities/place/api/http/place.http';
import { PlaceListResponseSchema } from '@/entities/place/api/http/place.http.schema';
import { mapPlaceListDtoToModel } from '@/entities/place/api/mappers/place.dto-to-model.mapper';
import type { ApiClient } from '@/shared/api';
import { FailureMeta, toRemoteResult } from '@/shared/failures';
import { resultOk } from '@/shared/lib/result';

const PLACES_LIST_META: Omit<FailureMeta, 'status'> = {
  endpoint: '/places',
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
      const result = await toRemoteResult(
        http.list(params),
        PLACES_LIST_META,
        PlaceListResponseSchema,
      );

      if (!result.ok) {
        return result;
      }

      return resultOk(mapPlaceListDtoToModel(result.data), result.meta);
    },
  };
}
