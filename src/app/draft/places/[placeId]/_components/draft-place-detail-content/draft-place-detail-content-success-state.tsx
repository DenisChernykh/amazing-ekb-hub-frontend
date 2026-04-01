import type { DraftPlaceDetailScreenSuccessViewModel } from '@/app/draft/places/[placeId]/_lib';
import { PlaceDetailPlatformSection } from '@/modules/material';
import {
  PlaceDetailCounters,
  PlaceDetailPinnedCard,
  PlaceDetailSummaryCard,
} from '@/modules/place';
import { Stack } from '@mui/material';
import { DraftPlaceDetailActions } from '../draft-place-detail-actions';

interface DraftPlaceDetailContentSuccessStateProps {
  viewModel: DraftPlaceDetailScreenSuccessViewModel;
}

/**
 * Рендерит success-state контентной части draft detail-экрана.
 *
 * @param viewModel - Screen-level view model успешного detail-экрана.
 * @returns Успешное состояние route-level content.
 */
export function DraftPlaceDetailContentSuccessState({
  viewModel,
}: Readonly<DraftPlaceDetailContentSuccessStateProps>) {
  return (
    <Stack spacing={3}>
      <DraftPlaceDetailActions
        backHref={viewModel.actions.backHref}
        favoriteDisabled={viewModel.actions.favoriteDisabled}
      />

      <PlaceDetailSummaryCard summary={viewModel.summary} />

      <PlaceDetailCounters counters={viewModel.counters} />

      <PlaceDetailPinnedCard pinned={viewModel.pinned} />

      <Stack spacing={2}>
        {viewModel.sections.map((section) => (
          <PlaceDetailPlatformSection key={section.platform} section={section} />
        ))}
      </Stack>
    </Stack>
  );
}
