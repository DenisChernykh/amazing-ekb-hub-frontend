import { formatMaterialDuration } from '@/entities/material/lib/format-material-duration';
import { formatMaterialPublishedAt } from '@/entities/material/lib/format-material-published-at';
import { getMaterialTypeLabel } from '@/entities/material/lib/get-material-type-label';
import type { MaterialPreview } from '@/entities/material/model/material';

type MaterialMetaSource = Pick<MaterialPreview, 'type' | 'publishedAt' | 'durationSec'>;

/**
 * Собирает стандартный набор meta-чипов материала.
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
