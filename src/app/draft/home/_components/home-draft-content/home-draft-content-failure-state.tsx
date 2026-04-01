import type { RscInlineFailureModel } from '@/server/std-errors';
import { StdInlineFailureState } from '@/shared/errors';

interface HomeDraftContentFailureStateProps {
  failure: RscInlineFailureModel;
}

/**
 * Рендерит failure-state контентной части draft home-экрана.
 *
 * @param failure - Serializable expected failure model.
 * @returns Inline failure state для route-level content.
 */
export function HomeDraftContentFailureState({
  failure,
}: Readonly<HomeDraftContentFailureStateProps>) {
  return <StdInlineFailureState failure={failure} />;
}
