import type { PlaceCategory, PlaceSummary } from '@/entities/place';
import type { PlaceCardViewModel } from '@/features/place-feed/model/place-feed.view-model.types';

const PLACE_CATEGORY_LABELS: Record<PlaceCategory, string> = {
  pools: 'Бассейны',
  spa: 'Спа',
  cafe: 'Кафе',
  hotels: 'Отели',
  workshops: 'Мастер-классы',
};

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
    categoryLabel: PLACE_CATEGORY_LABELS[place.category],
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
