import type { PlaceFeedViewModel } from '../../view-model';
import { PlaceFeedEmptyState } from './place-feed-empty-state';
import { PlaceFeedSuccessState } from './place-feed-success-state';

/**
 * Параметры presentation-компонента ленты мест.
 */
export interface PlaceFeedProps {
  viewModel: PlaceFeedViewModel;
}

/**
 * Рендерит состояния home-ленты мест: `success` и `empty`.
 *
 * @param viewModel - Готовая presentation-модель ленты мест.
 * @returns Presentation-компонент ленты мест.
 */
export function PlaceFeed({ viewModel }: Readonly<PlaceFeedProps>) {
  switch (viewModel.kind) {
    case 'empty':
      return <PlaceFeedEmptyState title={viewModel.title} description={viewModel.description} />;

    case 'success':
      return (
        <PlaceFeedSuccessState
          title={viewModel.title}
          meta={viewModel.meta}
          items={viewModel.items}
        />
      );
  }
}
