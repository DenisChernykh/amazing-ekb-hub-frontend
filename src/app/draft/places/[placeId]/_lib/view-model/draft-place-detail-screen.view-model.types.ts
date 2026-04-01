import type { PlaceDetailSectionViewModel } from '@/modules/material';
import type {
  PlaceDetailCountersViewModel,
  PlaceDetailPinnedCardViewModel,
  PlaceDetailSummaryViewModel,
} from '@/modules/place';

/**
 * View model action-кнопок draft detail-экрана.
 */
export type DraftPlaceDetailActionsViewModel = {
  backHref: string;
  favoriteDisabled: boolean;
};

/**
 * View model успешного draft detail-экрана.
 */
export type DraftPlaceDetailScreenSuccessViewModel = {
  actions: DraftPlaceDetailActionsViewModel;
  summary: PlaceDetailSummaryViewModel;
  counters: PlaceDetailCountersViewModel;
  pinned: PlaceDetailPinnedCardViewModel;
  sections: readonly PlaceDetailSectionViewModel[];
};
