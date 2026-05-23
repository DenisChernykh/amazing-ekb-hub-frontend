import { describe, expect, it } from 'vitest';
import { normalizeCoverImageUrl } from './normalize-cover-image-url';

describe('normalizeCoverImageUrl', () => {
  it.each([null, undefined, '', '   '])('returns null for empty value %#', (coverImageUrl) => {
    expect(normalizeCoverImageUrl(coverImageUrl)).toBeNull();
  });

  it('keeps absolute image URL unchanged', () => {
    expect(normalizeCoverImageUrl('https://api.example.com/v1/places/place_ekb_001/photo')).toBe(
      'https://api.example.com/v1/places/place_ekb_001/photo',
    );
  });

  it('keeps same-origin API image path for frontend rewrites', () => {
    expect(normalizeCoverImageUrl('/v1/places/place_ekb_001/photo')).toBe(
      '/v1/places/place_ekb_001/photo',
    );
  });
});
