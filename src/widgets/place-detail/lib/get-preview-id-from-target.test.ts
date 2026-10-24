import { describe, expect, it } from 'vitest';
import { getPreviewIdFromTarget } from './get-preview-id-from-target';

describe('getPreviewIdFromTarget', () => {
  it('returns null for targets without closest()', () => {
    expect(getPreviewIdFromTarget(null)).toBeNull();
    expect(getPreviewIdFromTarget({} as EventTarget)).toBeNull();
  });

  it('returns null when the closest row has no material id', () => {
    const target = {
      closest: () => ({ getAttribute: () => null }),
    } as unknown as EventTarget;

    expect(getPreviewIdFromTarget(target)).toBeNull();
  });

  it('reads the material id from the closest row of a nested target', () => {
    const target = {
      closest: (selector: string) => ({
        getAttribute: (attribute: string) =>
          selector === '[data-material-id]' && attribute === 'data-material-id'
            ? 'material_nested'
            : null,
      }),
    } as unknown as EventTarget;

    expect(getPreviewIdFromTarget(target)).toBe('material_nested');
  });
});
