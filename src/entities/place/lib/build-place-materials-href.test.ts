import { describe, expect, it } from 'vitest';
import { buildPlaceMaterialsAnchor, buildPlaceMaterialsHref } from './build-place-materials-href';

describe('buildPlaceMaterialsHref', () => {
  it.each([
    ['dzen', 'materials-dzen'],
    ['telegram', 'materials-telegram'],
    ['instagram', 'materials-instagram'],
  ] as const)('builds stable %s material section anchor', (platform, anchor) => {
    expect(buildPlaceMaterialsAnchor(platform)).toBe(anchor);
  });

  it('builds place detail href with material section hash', () => {
    expect(buildPlaceMaterialsHref('place ekb/001', 'telegram')).toBe(
      '/places/place%20ekb%2F001#materials-telegram',
    );
  });
});
