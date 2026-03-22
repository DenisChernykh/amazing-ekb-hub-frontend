import { getPlaceCategoryLabel, type PlaceSummary } from '@/entities/place';
import type { PlaceCardViewModel } from './place-feed.view-model.types';

/**
 * Преобразует доменную модель места в presentation-ready карточку.
 *
 * @param place - Доменная модель места.
 * @returns View model одной карточки для home-ленты.
 */
export function mapPlaceSummaryToCardViewModel(place: PlaceSummary): PlaceCardViewModel {
  return {
    id: place.id,
    title: place.title,
    summary: place.summary,
    tags: [...place.tags],
    category: place.category,
    categoryLabel: getPlaceCategoryLabel(place.category),
    href: buildPlaceHref(place.id),
  };
}

/**
 * Строит route detail-страницы для карточки места.
 *
 * @param placeId - Идентификатор места.
 * @returns URL detail-страницы места.
 */
function buildPlaceHref(placeId: string): string {
  return `/places/${placeId}`;
}
