import type { HomeDraftScreenSuccessViewModel } from '@/app/draft/home/_lib';
import { PlaceFeed } from '@/modules/place';

interface HomeDraftContentSuccessStateProps {
  viewModel: HomeDraftScreenSuccessViewModel;
}

/**
 * Рендерит success-state контентной части draft home-экрана.
 *
 * @param viewModel - Screen-level view model успешного home-экрана.
 * @returns Успешное состояние route-level content.
 */
export function HomeDraftContentSuccessState({
  viewModel,
}: Readonly<HomeDraftContentSuccessStateProps>) {
  return <PlaceFeed viewModel={viewModel.feed} />;
}
