import { MaterialPreview } from '@/modules/material/model/entity';
import { formatMaterialDuration } from './format-material-duration';
import { formatMaterialPublishedAt } from './format-material-published-at';
import { getMaterialTypeLabel } from './get-material-type-label';

type MaterialMetaSource = Pick<MaterialPreview, 'type' | 'publishedAt' | 'durationSec'>;

/**
 * Собирает стандартный набор meta-чипов материала.
 *
 * @param material - Источник метаданных материала.
 * @returns Набор meta labels для UI.
 */
export function buildMaterialMetaChips(material: MaterialMetaSource): string[] {
  const meta = [
    getMaterialTypeLabel(material.type),
    formatMaterialPublishedAt(material.publishedAt),
  ];

  const durationLabel = formatMaterialDuration(material.durationSec);

  if (durationLabel) {
    meta.push(durationLabel);
  }

  return meta;
}
