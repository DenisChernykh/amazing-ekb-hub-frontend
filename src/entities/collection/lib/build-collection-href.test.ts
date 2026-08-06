import { describe, expect, it } from 'vitest';
import { buildCollectionHref } from './build-collection-href';

describe('buildCollectionHref', () => {
  it('builds a public collection route', () => {
    expect(buildCollectionHref('weekend-spots')).toBe('/collections/weekend-spots');
  });

  it('encodes unsafe characters as one route segment', () => {
    expect(buildCollectionHref('../admin collection')).toBe('/collections/..%2Fadmin%20collection');
  });
});
