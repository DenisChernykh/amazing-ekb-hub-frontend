import { getPlaceCategoryLabel, type PlaceSummary } from '@/modules/place/model';
import type { PlaceCardViewModel } from './place-feed.view-model.types';

/**
 * Функция построения href detail-экрана места.
 */
export type BuildPlaceDetailHref = (placeId: string) => string;

/**
 * Параметры построения карточки места.
 */
export interface MapPlaceSummaryToCardViewModelArgs {
  /**
   * Доменная модель места.
   */
  place: PlaceSummary;

  /**
   * Route-level builder detail-ссылки.
   */
  buildDetailHref: BuildPlaceDetailHref;
}

/**
 * Преобразует доменную модель места в presentation-ready карточку.
 *
 * @param args - Place model и route-level builder detail href.
 * @returns View model одной карточки для home-ленты.
 */
export function mapPlaceSummaryToCardViewModel({
  place,
  buildDetailHref,
}: Readonly<MapPlaceSummaryToCardViewModelArgs>): PlaceCardViewModel {
  return {
    id: place.id,
    title: place.title,
    summary: place.summary,
    tags: [...place.tags],
    category: place.category,
    categoryLabel: getPlaceCategoryLabel(place.category),
    href: buildDetailHref(place.id),
  };
}
