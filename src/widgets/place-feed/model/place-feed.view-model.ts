import type { PlaceListResult } from '@/entities/place';
import { getRemoteFailureMessage } from '@/shared/failures';
import { mapPlaceSummaryToCardViewModel } from './map-place-summary-to-card-view-model';
import type { PlaceFeedViewModel } from './place-feed.view-model.types';

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
    items: result.data.items.map(mapPlaceSummaryToCardViewModel),
  };
}
