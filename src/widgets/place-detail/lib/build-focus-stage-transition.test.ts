import { describe, expect, it } from 'vitest';
import { buildFocusStageTransition } from './build-focus-stage-transition';

describe('buildFocusStageTransition', () => {
  it('keeps the approved transition when reduced motion is disabled', () => {
    expect(buildFocusStageTransition(false)).toEqual({
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1],
    });
  });

  it('switches preview content immediately when reduced motion is enabled', () => {
    expect(buildFocusStageTransition(true)).toEqual({ duration: 0 });
  });
});
