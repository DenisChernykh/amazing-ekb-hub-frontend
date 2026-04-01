import type { RscInlineFailureModel } from '@/server/std-errors';
import { StdInlineFailureState } from '@/shared/errors';

interface DraftPlaceDetailContentFailureStateProps {
  failure: RscInlineFailureModel;
}

/**
 * Рендерит failure-state контентной части draft detail-экрана.
 *
 * @param failure - Serializable expected failure model.
 * @returns Inline failure state для route-level content.
 */
export function DraftPlaceDetailContentFailureState({
  failure,
}: Readonly<DraftPlaceDetailContentFailureStateProps>) {
  return <StdInlineFailureState failure={failure} />;
}
