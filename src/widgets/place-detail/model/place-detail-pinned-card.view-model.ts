import { buildMaterialMetaChips, getPlatformLabel, MaterialPreview } from '@/entities/material';
import { PlaceDetailPinnedCardViewModel } from '@/widgets/place-detail/model/place-detail-screen.view-model.types';

/**
 * Строит view model закрепленного материала detail-экрана.
 */
export function buildPlaceDetailPinnedCardViewModel(
  pinnedMaterial: MaterialPreview | null,
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
