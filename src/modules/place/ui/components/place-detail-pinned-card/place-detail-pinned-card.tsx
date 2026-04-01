import type { PlaceDetailPinnedCardViewModel } from '../../view-model';
import { PlaceDetailPinnedCardEmptyState } from './place-detail-pinned-card-empty-state';
import { PlaceDetailPinnedCardSuccessState } from './place-detail-pinned-card-success-state';

/**
 * Параметры pinned-карточки detail-экрана.
 */
export interface PlaceDetailPinnedCardProps {
  pinned: PlaceDetailPinnedCardViewModel;
}

/**
 * Рендерит блок закрепленного материала detail-экрана.
 *
 * @param pinned - View model pinned-блока.
 * @returns MUI-карточку закрепленного материала.
 */
export function PlaceDetailPinnedCard({ pinned }: Readonly<PlaceDetailPinnedCardProps>) {
  switch (pinned.kind) {
    case 'empty':
      return <PlaceDetailPinnedCardEmptyState pinned={pinned} />;

    case 'success':
      return <PlaceDetailPinnedCardSuccessState pinned={pinned} />;
  }
}
