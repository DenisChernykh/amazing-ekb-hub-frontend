import { describe, expect, it } from 'vitest';
import { normalizeMaterialRedirectUrl } from './normalize-material-redirect-url';

describe('normalizeMaterialRedirectUrl', () => {
  it('keeps backend material redirect URL for the same material id', () => {
    expect(
      normalizeMaterialRedirectUrl('/v1/materials/material_dzen_001/go', 'material_dzen_001'),
    ).toBe('/v1/materials/material_dzen_001/go');
  });

  it('keeps encoded backend material redirect URL for the same decoded material id', () => {
    expect(
      normalizeMaterialRedirectUrl('/v1/materials/material%20dzen%2F001/go', 'material dzen/001'),
    ).toBe('/v1/materials/material%20dzen%2F001/go');
  });

  it.each([
    ['direct external URL', 'https://video.example.test/video/aquacity-start', 'material_dzen_001'],
    [
      'same-origin absolute redirect',
      'https://amazing-ekb.example/v1/materials/material_dzen_001/go',
      'material_dzen_001',
    ],
    [
      'frontend redirect URL',
      '/out?url=https%3A%2F%2Fvideo.example.test%2Fvideo%2Faquacity-start',
      'material_dzen_001',
    ],
    ['different v1 path', '/v1/places/place_ekb_001', 'material_dzen_001'],
    ['wrong endpoint suffix', '/v1/materials/material_dzen_001/edit', 'material_dzen_001'],
    ['query string', '/v1/materials/material_dzen_001/go?utm=card', 'material_dzen_001'],
    ['hash', '/v1/materials/material_dzen_001/go#open', 'material_dzen_001'],
    ['mismatched material id', '/v1/materials/material_dzen_002/go', 'material_dzen_001'],
    ['empty material id', '/v1/materials//go', 'material_dzen_001'],
    ['malformed encoding', '/v1/materials/%E0%A4%A/go', 'material_dzen_001'],
  ])('rejects %s', (_caseName, redirectUrl, materialId) => {
    expect(normalizeMaterialRedirectUrl(redirectUrl, materialId)).toBeNull();
  });
});
