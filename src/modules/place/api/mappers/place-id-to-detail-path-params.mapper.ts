import type { GetPlaceDetailPathParams } from '@/modules/place/api/http/place.http.types';

/**
 * Преобразует идентификатор места в transport path DTO detail-запроса.
 *
 * @param placeId - Идентификатор места.
 * @returns Path DTO для `GET /places/{placeId}`.
 */
export function mapPlaceIdToDetailPathParams(placeId: string): GetPlaceDetailPathParams {
  return {
    placeId,
  };
}
