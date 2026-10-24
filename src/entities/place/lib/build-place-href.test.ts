import { describe, expect, it } from 'vitest';
import { buildPlaceHref } from './build-place-href';

describe('buildPlaceHref', () => {
  it('builds the public place route from its slug', () => {
    expect(buildPlaceHref('baden-baden-uktus')).toBe('/places/baden-baden-uktus');
  });
});
