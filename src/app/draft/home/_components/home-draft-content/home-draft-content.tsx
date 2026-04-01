import {
  buildHomeDraftScreenViewModel,
  type HomeDraftPageData,
  type HomeDraftScreenSuccessViewModel,
} from '@/app/draft/home/_lib';
import type { RscInlineFailureModel } from '@/server/std-errors';
import { HomeDraftContentFailureState } from './home-draft-content-failure-state';
import { HomeDraftContentSuccessState } from './home-draft-content-success-state';

/**
 * Пропсы контентной части draft home-экрана.
 */
export type HomeDraftContentProps =
  | {
      data: HomeDraftPageData;
      failure?: never;
    }
  | {
      failure: RscInlineFailureModel;
      data?: never;
    };

/**
 * Рендерит основное содержимое draft home: либо inline failure, либо place feed.
 *
 * @param props - Успешные данные страницы или expected failure model.
 * @returns Основной content-блок экрана.
 */
export function HomeDraftContent(props: Readonly<HomeDraftContentProps>) {
  if (props.failure !== undefined) {
    return <HomeDraftContentFailureState failure={props.failure} />;
  }

  const viewModel: HomeDraftScreenSuccessViewModel = buildHomeDraftScreenViewModel(props.data);

  return <HomeDraftContentSuccessState viewModel={viewModel} />;
}
