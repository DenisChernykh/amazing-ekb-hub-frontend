import type { ListPlaceMaterialsParams, MaterialList } from '@/modules/material/model';
import type { ApiClient } from '@/shared/api';
import { unwrapHttpResultAndMapOrThrow } from '@/shared/api';
import { createMaterialHttp } from './http/material.http';
import { MaterialListResponseSchema } from './http/material.http.schema';
import { mapListPlaceMaterialsParamsToRequestDto } from './mappers/list-place-materials-params-to-request-dto.mapper';
import { mapMaterialListDtoToModel } from './mappers/material.dto-to-model.mapper';

/**
 * Throw-based контракт data-access слоя модуля `material`.
 */
export interface MaterialApi {
  /**
   * Загружает материалы места внутри одной платформы.
   *
   * @param params - Параметры списка материалов места.
   * @returns Доменную модель списка материалов.
   *
   * @remarks
   * В случае HTTP/contract/runtime сбоя метод не возвращает `Result`,
   * а бросает типизированную ошибку для `std-errors` RSC-потока.
   */
  listByPlace(params: ListPlaceMaterialsParams): Promise<MaterialList>;
}

/**
 * Создает throw-based API модуля `material`.
 *
 * @param client - Typed API client.
 * @returns API со стабильным доменным контрактом для server/ui слоев.
 */
export function createMaterialApi(client: ApiClient): MaterialApi {
  const http = createMaterialHttp(client);

  return {
    async listByPlace(params) {
      return unwrapHttpResultAndMapOrThrow(
        http.listByPlace(mapListPlaceMaterialsParamsToRequestDto(params)),
        MaterialListResponseSchema,
        mapMaterialListDtoToModel,
      );
    },
  };
}
