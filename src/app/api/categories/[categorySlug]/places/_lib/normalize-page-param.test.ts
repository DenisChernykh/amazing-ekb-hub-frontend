import { describe, expect, it } from 'vitest';
import { normalizePageParam } from './normalize-page-param';

describe('normalizePageParam', () => {
  it.each([
    [null, null],
    ['', null],
    ['0', null],
    ['1001', null],
    ['1.5', null],
    [' 1', null],
    ['+1', null],
    ['1e2', null],
  ])('normalizes %s to %s', (rawPage, expected) => {
    expect(normalizePageParam(rawPage)).toBe(expected);
  });

  it.each([
    ['1', 1],
    ['20', 20],
    ['1000', 1000],
  ])('accepts bounded decimal integer %s', (rawPage, expected) => {
    expect(normalizePageParam(rawPage)).toBe(expected);
  });
});
