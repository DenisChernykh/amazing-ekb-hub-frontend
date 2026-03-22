export { createMaterialApi } from './api';
export type { MaterialApi, MaterialListResult } from './api';
export {
  buildMaterialMetaChips,
  formatMaterialDuration,
  formatMaterialPublishedAt,
  getMaterialCountLabel,
  getMaterialTypeLabel,
  getPlatformLabel,
} from './lib';
export {
  MATERIAL_PLATFORMS,
  type ListPlaceMaterialsParams,
  type Material,
  type MaterialList,
  type MaterialPreview,
  type MaterialType,
  type Platform,
} from './model/material';
