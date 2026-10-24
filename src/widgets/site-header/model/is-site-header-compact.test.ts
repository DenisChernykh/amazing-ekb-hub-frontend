import { describe, expect, it } from 'vitest';
import { isSiteHeaderCompact } from './is-site-header-compact';

describe('isSiteHeaderCompact', () => {
  it.each([
    [0, false],
    [16, false],
    [17, true],
    [400, true],
  ])('maps scrollY %s to %s', (scrollY, expected) => {
    expect(isSiteHeaderCompact(scrollY)).toBe(expected);
  });
});
