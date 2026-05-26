import type { Material } from '@/shared/api/generated/model/material';
import type { PlaceDetail } from '@/shared/api/generated/model/placeDetail';
import { describe, expect, it } from 'vitest';
import { mapPlaceDetailToModel } from './map-place-detail-to-model';

const DIRECT_DZEN_URL = 'https://dzen.ru/video/aquacity-start';
const DZEN_REDIRECT_URL = '/v1/materials/material_dzen_001/go';

const BASE_PLACE_DETAIL: PlaceDetail = {
  id: 'place_ekb_001',
  title: 'Baden-Baden Uktus',
  summary: 'Thermal complex with spa zone.',
  tags: ['spa'],
  category: 'spa',
  status: 'active',
  popularityWeight: 10,
  coverImageUrl: null,
  counters: {
    dzen: 1,
    telegram: 0,
    instagram: 0,
  },
  pinnedMaterial: null,
};

const BASE_DZEN_MATERIAL: Material = {
  id: 'material_dzen_001',
  placeId: 'place_ekb_001',
  platform: 'dzen',
  type: 'video',
  title: 'Dzen shorts walkthrough',
  publishedAt: '2026-03-20T10:30:00.000Z',
  durationSec: 45,
  url: DIRECT_DZEN_URL,
  redirectUrl: DZEN_REDIRECT_URL,
};

describe('mapPlaceDetailToModel', () => {
  it('maps backend redirectUrl and does not expose the direct external material URL', () => {
    const place = mapPlaceDetailToModel(BASE_PLACE_DETAIL, {
      dzen: [BASE_DZEN_MATERIAL],
    });

    expect(place.materialsByPlatform.dzen[0]?.redirectUrl).toBe(DZEN_REDIRECT_URL);
    expect(JSON.stringify(place)).not.toContain(DIRECT_DZEN_URL);
  });

  it('keeps material visible but unavailable when redirectUrl is missing or invalid', () => {
    const place = mapPlaceDetailToModel(BASE_PLACE_DETAIL, {
      dzen: [
        {
          ...BASE_DZEN_MATERIAL,
          redirectUrl: '/out?url=https%3A%2F%2Fdzen.ru%2Fvideo%2Faquacity-start',
        },
      ],
    });

    expect(place.materialsByPlatform.dzen[0]?.title).toBe('Dzen shorts walkthrough');
    expect(place.materialsByPlatform.dzen[0]?.redirectUrl).toBeNull();
  });
});
