import type { GetPlaceListQueryDto } from '@/modules/place/api/http/place.http.types';
import type { ListPlacesParams } from '@/modules/place/model';

/**
 * Преобразует module-level параметры списка мест в transport query DTO.
 *
 * @param params - Канонические параметры списка мест.
 * @returns Query DTO для `GET /places`.
 */
export function mapListPlacesParamsToRequestDto(params: ListPlacesParams): GetPlaceListQueryDto {
  return {
    page: params.page,
    pageSize: params.pageSize,
    sort: params.sort,
    ...(params.search ? { search: params.search } : {}),
    ...(params.category ? { category: params.category } : {}),
  };
}
