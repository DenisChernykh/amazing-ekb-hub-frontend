import type { Platform } from '@/entities/material';

/**
 * View model action-кнопок detail-экрана.
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
 * View model закрепленного материала detail-экрана.
 */
export type PlaceDetailPinnedCardViewModel =
  | {
      kind: 'empty';
      title: string;
      description: string;
    }
  | {
      kind: 'success';
      eyebrow: string;
      title: string;
      href: string;
      actionLabel: string;
      metaChips: readonly string[];
    };

/**
 * View model одного материала внутри платформенной секции.
 */
export type PlaceDetailMaterialViewModel = {
  id: string;
  title: string;
  href: string;
  metaChips: readonly string[];
};

/**
 * View model пагинации платформенной секции.
 */
export type PlaceDetailSectionPaginationViewModel = {
  page: number;
  totalPages: number;
  hrefByPage: Record<number, string>;
};

type PlaceDetailSectionBaseViewModel = {
  platform: Platform;
  title: string;
  countLabel: string;
};

/**
 * View model пустой платформенной секции.
 */
export type PlaceDetailSectionEmptyViewModel = PlaceDetailSectionBaseViewModel & {
  kind: 'empty';
  description: string;
};

/**
 * View model платформенной секции с ошибкой загрузки.
 */
export type PlaceDetailSectionErrorViewModel = PlaceDetailSectionBaseViewModel & {
  kind: 'error';
  message: string;
};

/**
 * View model успешной платформенной секции.
 */
export type PlaceDetailSectionSuccessViewModel = PlaceDetailSectionBaseViewModel & {
  kind: 'success';
  items: readonly PlaceDetailMaterialViewModel[];
  emptyPageDescription: string;
  pagination?: PlaceDetailSectionPaginationViewModel;
};

/**
 * Полный view model платформенной секции detail-экрана.
 */
export type PlaceDetailSectionViewModel =
  | PlaceDetailSectionEmptyViewModel
  | PlaceDetailSectionErrorViewModel
  | PlaceDetailSectionSuccessViewModel;

/**
 * View model page-level ошибки detail-экрана.
 */
export type PlaceDetailScreenErrorViewModel = {
  kind: 'error';
  title: string;
  description: string;
};

/**
 * View model успешного detail-экрана.
 */
export type PlaceDetailScreenSuccessViewModel = {
  kind: 'success';
  actions: PlaceDetailActionsViewModel;
  summary: PlaceDetailSummaryViewModel;
  counters: Record<Platform, number>;
  pinned: PlaceDetailPinnedCardViewModel;
  sections: readonly PlaceDetailSectionViewModel[];
};

/**
 * Полный view model detail-экрана места.
 */
export type PlaceDetailScreenViewModel =
  | PlaceDetailScreenErrorViewModel
  | PlaceDetailScreenSuccessViewModel;
