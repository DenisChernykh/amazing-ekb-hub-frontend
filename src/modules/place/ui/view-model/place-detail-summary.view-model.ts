import { getPlaceCategoryLabel, type PlaceDetail } from '@/modules/place/model';
import type { PlaceDetailSummaryViewModel } from './place-detail.view-model.types';

/**
 * Строит summary view model detail-экрана места.
 *
 * @param place - Доменная detail-модель места.
 * @returns Presentation-ready summary-блок.
 */
export function buildPlaceDetailSummaryViewModel(place: PlaceDetail): PlaceDetailSummaryViewModel {
  return {
    title: place.title,
    summary: place.summary,
    tags: [...place.tags],
    categoryLabel: getPlaceCategoryLabel(place.category),
  };
}
