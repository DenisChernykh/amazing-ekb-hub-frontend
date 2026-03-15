import { PlaceCategory, PlaceListResult, PlaceSummary } from '@/entities/place';
import { getRemoteFailureMessage } from '@/shared/failures';

const PLACE_CATEGORY_LABELS: Record<PlaceCategory, string> = {
  pools: 'Бассейны',
  spa: 'Спа',
  cafe: 'Кафе',
  hotels: 'Отели',
  workshops: 'Мастер-классы',
};
/**
 * View model одной карточки места.
 */
export type PlaceCardViewModel = {
  id: string;
  title: string;
  summary: string;
  tags: readonly string[];
  category: PlaceCategory;
  categoryLabel: string;
  href: string;
};

/**
 * View model списка мест для главной страницы.
 */
export type PlaceFeedViewModel =
  | {
      kind: 'error';
      title: string;
      description: string;
    }
  | {
      kind: 'empty';
      title: string;
      description: string;
    }
  | {
      kind: 'success';
      title: string;
      meta: string;
      items: readonly PlaceCardViewModel[];
    };

/**
 * Преобразует result-first ответ списка мест в presentation-friendly view model.
 *
 * @param result - Result-first ответ загрузки мест.
 * @returns UI-ready модель success / empty / error состояния.
 */
export function buildPlaceFeedViewModel(result: PlaceListResult): PlaceFeedViewModel {
  if (!result.ok) {
    return {
      kind: 'error',
      title: 'Не удалось загрузить места',
      description: getRemoteFailureMessage(result.error),
    };
  }

  if (result.data.items.length === 0) {
    return {
      kind: 'empty',
      title: 'Места не найдены',
      description: 'Попробуй изменить query-параметры или вернуться к полной ленте.',
    };
  }

  return {
    kind: 'success',
    title: `Места (${result.data.total})`,
    meta: `Страница ${result.data.page}`,
    items: result.data.items.map(mapPlaceSummaryToViewModel),
  };
}
/**
 * Строит временный маршрут карточки места.
 *
 * @param placeId - Идентификатор места.
 * @returns URL временной страницы места.
 */
function buildPlaceHref(placeId: string): string {
  return `/places/${placeId}`;
}

/**
 * Преобразует доменную модель места в presentation-ready карточку.
 *
 * @param place - Доменная модель места.
 * @returns View model одной карточки для home-ленты.
 */
function mapPlaceSummaryToViewModel(place: PlaceSummary): PlaceCardViewModel {
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
