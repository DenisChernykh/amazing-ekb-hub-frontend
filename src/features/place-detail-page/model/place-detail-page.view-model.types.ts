import type { MaterialListResult } from '@/entities/material';
import type { MaterialPreview, Platform } from '@/entities/place';

/**
 * View model action-кнопок detail-страницы.
 */
export type PlaceDetailActionsViewModel = {
  backHref: string;
  favoriteDisabled: boolean;
};

/**
 * View model основного блока информации о месте.
 */
export type PlaceDetailSummaryViewModel = {
  title: string;
  summary: string;
  tags: readonly string[];
  categoryLabel: string;
};

/**
 * Данные одной платформенной секции detail-страницы.
 *
 * Здесь намеренно храним не полностью "разжеванный" UI-state, а минимальный
 * page-level payload для самостоятельного рендера секции.
 */
export type PlaceDetailSectionData = {
  placeId: string;
  platform: Platform;
  counter: number;
  currentPage: number;
  platformPages: Record<Platform, number>;
  materialResult: MaterialListResult | undefined;
};

/**
 * View model page-level ошибки detail-страницы.
 */
export type PlaceDetailPageErrorViewModel = {
  kind: 'error';
  title: string;
  description: string;
};

/**
 * View model успешной detail-страницы.
 */
export type PlaceDetailPageSuccessViewModel = {
  kind: 'success';
  actions: PlaceDetailActionsViewModel;
  summary: PlaceDetailSummaryViewModel;
  counters: Record<Platform, number>;
  pinnedMaterial: MaterialPreview | null;
  sections: readonly PlaceDetailSectionData[];
};

/**
 * Полный view model detail-страницы места.
 */
export type PlaceDetailPageViewModel =
  | PlaceDetailPageErrorViewModel
  | PlaceDetailPageSuccessViewModel;
