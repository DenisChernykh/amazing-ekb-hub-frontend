export { createMaterialApi } from './api';
export type { MaterialApi } from './api';

export {
  buildMaterialMetaChips,
  formatMaterialDuration,
  formatMaterialPublishedAt,
  getMaterialCountLabel,
  getMaterialTypeLabel,
  getPlatformLabel,
} from './model';

export { listPlaceMaterials } from './server';

export {
  PlaceDetailMaterialList,
  PlaceDetailPlatformSection,
  PlaceDetailSectionPagination,
  buildPlaceDetailSectionViewModel,
  mapMaterialToDetailItemViewModel,
} from './ui';
export type {
  BuildPlaceDetailSectionHref,
  BuildPlaceDetailSectionHrefArgs,
  PlaceDetailMaterialListProps,
  PlaceDetailMaterialViewModel,
  PlaceDetailPlatformPages,
  PlaceDetailPlatformSectionProps,
  PlaceDetailSectionLoadResult,
  PlaceDetailSectionPaginationProps,
  PlaceDetailSectionPaginationViewModel,
  PlaceDetailSectionViewModel,
} from './ui';

export {
  MATERIAL_PLATFORMS,
  type ListPlaceMaterialsParams,
  type Material,
  type MaterialList,
  type MaterialPreview,
  type MaterialType,
  type Platform,
} from './model';
