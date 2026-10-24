import { describe, expect, it } from 'vitest';
import { buildPathnameHref } from './build-pathname-href';

describe('buildPathnameHref', () => {
  it('joins a pathname and serialized query', () => {
    expect(buildPathnameHref('/', new URLSearchParams('search=spa'))).toBe('/?search=spa');
  });

  it('returns only the pathname when query is empty', () => {
    expect(buildPathnameHref('/', new URLSearchParams())).toBe('/');
  });
});
