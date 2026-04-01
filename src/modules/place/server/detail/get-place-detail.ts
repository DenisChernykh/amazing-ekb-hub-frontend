import 'server-only';

import type { PlaceDetail } from '@/modules/place/model';
import { createServerPlaceApi } from '../factory';

/**
 * Загружает детальную карточку места для server-first detail-сценариев.
 *
 * @param placeId - Идентификатор места.
 * @returns Доменную detail-модель места.
 *
 * @remarks
 * Метод использует throw-based API-контур и предназначен для RSC/route loaders.
 */
export async function getPlaceDetail(placeId: string): Promise<PlaceDetail> {
  const placeApi = await createServerPlaceApi();

  return placeApi.getDetail(placeId);
}
