import type { PlaceList } from '@/modules/place/model';
import {
  mapPlaceSummaryToCardViewModel,
  type BuildPlaceDetailHref,
} from './map-place-summary-to-card-view-model';
import type { PlaceFeedViewModel } from './place-feed.view-model.types';

/**
 * Параметры построения home feed view model.
 */
export interface BuildPlaceFeedViewModelArgs {
  /**
   * Доменная модель списка мест.
   */
  placeList: PlaceList;

  /**
   * Route-level builder detail-ссылки.
   */
  buildDetailHref: BuildPlaceDetailHref;
}

/**
 * Преобразует доменную модель списка мест в presentation-friendly view model.
 *
 * @param args - Список мест и route-level builder detail href.
 * @returns UI-ready модель `success` или `empty`.
 */
export function buildPlaceFeedViewModel({
  placeList,
  buildDetailHref,
}: Readonly<BuildPlaceFeedViewModelArgs>): PlaceFeedViewModel {
  if (placeList.items.length === 0) {
    return {
      kind: 'empty',
      title: 'Места не найдены',
      description: 'Попробуйте изменить параметры поиска или вернуться к полной ленте.',
    };
  }

  return {
    kind: 'success',
    title: `Места (${placeList.total})`,
    meta: `Страница ${placeList.page}`,
    items: placeList.items.map((place) =>
      mapPlaceSummaryToCardViewModel({
        place,
        buildDetailHref,
      }),
    ),
  };
}
