import { describe, expect, it } from 'vitest';
import { buildPlaceMaterialsAnchor } from './build-place-materials-anchor';

describe('buildPlaceMaterialsAnchor', () => {
  it.each([
    ['dzen', 'materials-dzen'],
    ['telegram', 'materials-telegram'],
    ['instagram', 'materials-instagram'],
  ] as const)('builds the stable %s material section id', (platform, anchor) => {
    expect(buildPlaceMaterialsAnchor(platform)).toBe(anchor);
  });
});
