import type { DraftPlaceDetailScreenSuccessViewModel } from '@/app/draft/places/[placeId]/_lib';
import {
  buildDraftPlaceDetailScreenViewModel,
  type DraftPlaceDetailPageData,
} from '@/app/draft/places/[placeId]/_lib';
import type { RscInlineFailureModel } from '@/server/std-errors';
import { DraftPlaceDetailContentFailureState } from './draft-place-detail-content-failure-state';
import { DraftPlaceDetailContentSuccessState } from './draft-place-detail-content-success-state';

/**
 * Пропсы контентной части draft detail-экрана.
 */
export type DraftPlaceDetailContentProps =
  | {
      data: DraftPlaceDetailPageData;
      failure?: never;
    }
  | {
      failure: RscInlineFailureModel;
      data?: never;
    };

/**
 * Рендерит основное содержимое draft detail: либо inline failure, либо success screen.
 *
 * @param props - Успешные данные страницы или expected failure model.
 * @returns Основной content-блок draft detail-экрана.
 */
export function DraftPlaceDetailContent(props: Readonly<DraftPlaceDetailContentProps>) {
  if (props.failure !== undefined) {
    return <DraftPlaceDetailContentFailureState failure={props.failure} />;
  }

  const viewModel: DraftPlaceDetailScreenSuccessViewModel = buildDraftPlaceDetailScreenViewModel(
    props.data,
  );

  return <DraftPlaceDetailContentSuccessState viewModel={viewModel} />;
}
