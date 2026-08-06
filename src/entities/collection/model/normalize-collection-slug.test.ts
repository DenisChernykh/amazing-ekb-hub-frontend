import { describe, expect, it } from 'vitest';
import { normalizeCollectionSlug } from './normalize-collection-slug';

describe('normalizeCollectionSlug', () => {
  it('keeps a safe lowercase collection slug', () => {
    expect(normalizeCollectionSlug('weekend-spots')).toBe('weekend-spots');
  });

  it.each(['', 'Weekend-Spots', 'weekend_spots', '../admin', 'weekend%2Fspots', ' weekend-spots '])(
    'rejects unsafe or encoded slug: %s',
    (slug) => {
      expect(normalizeCollectionSlug(slug)).toBeNull();
    },
  );
});
