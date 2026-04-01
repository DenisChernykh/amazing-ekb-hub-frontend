import type { PlaceDetailSectionViewModel } from '../../view-model';
import { PlaceDetailPlatformSectionEmptyState } from './place-detail-platform-section-empty-state';
import { PlaceDetailPlatformSectionErrorState } from './place-detail-platform-section-error-state';
import { PlaceDetailPlatformSectionSuccessState } from './place-detail-platform-section-success-state';

/**
 * Параметры платформенной секции detail-экрана.
 */
export interface PlaceDetailPlatformSectionProps {
  section: PlaceDetailSectionViewModel;
}

/**
 * Рендерит одну платформенную секцию detail-экрана.
 *
 * @param section - Готовая view model платформенной секции.
 * @returns MUI-карточку платформенной секции.
 */
export function PlaceDetailPlatformSection({ section }: Readonly<PlaceDetailPlatformSectionProps>) {
  switch (section.kind) {
    case 'empty':
      return <PlaceDetailPlatformSectionEmptyState section={section} />;

    case 'error':
      return <PlaceDetailPlatformSectionErrorState section={section} />;

    case 'success':
      return <PlaceDetailPlatformSectionSuccessState section={section} />;
  }
}
