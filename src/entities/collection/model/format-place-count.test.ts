import { describe, expect, it } from 'vitest';
import { formatPlaceCount } from './format-place-count';

describe('formatPlaceCount', () => {
  it.each([
    [0, '0 мест'],
    [1, '1 место'],
    [2, '2 места'],
    [4, '4 места'],
    [5, '5 мест'],
    [11, '11 мест'],
    [14, '14 мест'],
    [21, '21 место'],
  ])('formats %s as %s', (count, expected) => {
    expect(formatPlaceCount(count)).toBe(expected);
  });
});
