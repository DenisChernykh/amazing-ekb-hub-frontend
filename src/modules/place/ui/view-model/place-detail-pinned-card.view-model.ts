import { buildMaterialMetaChips, getPlatformLabel } from '@/modules/material';
import type { PlaceMaterialPreview } from '@/modules/place/model';
import type { PlaceDetailPinnedCardViewModel } from './place-detail.view-model.types';

/**
 * Строит view model закрепленного материала detail-экрана.
 *
 * @param pinnedMaterial - Закрепленный материал места или `null`.
 * @returns View model pinned-блока.
 */
export function buildPlaceDetailPinnedCardViewModel(
  pinnedMaterial: PlaceMaterialPreview | null,
): PlaceDetailPinnedCardViewModel {
  if (!pinnedMaterial) {
    return {
      kind: 'empty',
      title: 'Закрепленного материала нет',
      description: 'Когда у места появится стартовый материал, он отобразится в этом блоке.',
    };
  }

  return {
    kind: 'success',
    eyebrow: 'Начни отсюда',
    title: pinnedMaterial.title,
    href: pinnedMaterial.url,
    actionLabel: 'Открыть материал',
    metaChips: [
      getPlatformLabel(pinnedMaterial.platform),
      ...buildMaterialMetaChips(pinnedMaterial),
    ],
  };
}
