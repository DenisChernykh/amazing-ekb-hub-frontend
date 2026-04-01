import { buildPlaceFeedViewModel } from '@/modules/place';
import type { HomeDraftPageData } from '../page-data';
import type { HomeDraftScreenSuccessViewModel } from './home-draft-screen.view-model.types';

/**
 * Строит screen-level view model успешного draft home-экрана.
 *
 * @param data - Полный page payload draft home-страницы.
 * @returns Готовую success view model для route-level экрана.
 */
export function buildHomeDraftScreenViewModel(
  data: HomeDraftPageData,
): HomeDraftScreenSuccessViewModel {
  return {
    feed: buildPlaceFeedViewModel({
      placeList: data.placeList,
      buildDetailHref: (placeId) => `/draft/places/${placeId}`,
    }),
  };
}
