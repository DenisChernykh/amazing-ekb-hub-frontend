import { describe, expect, it } from 'vitest';
import { normalizePlaceSlugForBackendPath } from './normalize-place-slug';

describe('normalizePlaceSlugForBackendPath', () => {
  it.each(['baden-baden-uktus', 'spa-2', 'a'])('keeps a valid public slug: %s', (slug) => {
    expect(normalizePlaceSlugForBackendPath(slug)).toBe(slug);
  });

  it('does not add a frontend-only max length absent from the backend contract', () => {
    const longSlug = 'a'.repeat(129);

    expect(normalizePlaceSlugForBackendPath(longSlug)).toBe(longSlug);
  });

  it.each(['', 'Baden-Baden', 'place_ekb_001', '../admin', ' spa '])(
    'rejects an invalid public slug: %s',
    (slug) => {
      expect(normalizePlaceSlugForBackendPath(slug)).toBeNull();
    },
  );
});
