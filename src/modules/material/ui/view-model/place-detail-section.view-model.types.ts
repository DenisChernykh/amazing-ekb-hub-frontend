import type { MaterialList, Platform } from '@/modules/material';

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
  requestId?: string;
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
 * Канонический shape страниц по платформам для detail-экрана.
 */
export type PlaceDetailPlatformPages = Record<Platform, number>;

/**
 * Route-level builder href для detail-пагинации.
 */
export interface BuildPlaceDetailSectionHrefArgs {
  placeId: string;
  platform: Platform;
  platformPages: PlaceDetailPlatformPages;
  targetPage: number;
}

/**
 * Функция построения href detail-экрана.
 */
export type BuildPlaceDetailSectionHref = (args: BuildPlaceDetailSectionHrefArgs) => string;

/**
 * UI-safe результат загрузки одной платформенной секции.
 */
export type PlaceDetailSectionLoadResult =
  | {
      kind: 'success';
      data: MaterialList;
    }
  | {
      kind: 'error';
      message: string;
      requestId?: string;
    };
