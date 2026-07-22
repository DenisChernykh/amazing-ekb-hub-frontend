import type { PlaceDetail } from '@/shared/api/generated/model/placeDetail';
import type { PublicMaterial } from '@/shared/api/generated/model/publicMaterial';
import { describe, expect, it } from 'vitest';
import { mapPlaceDetailToModel } from './map-place-detail-to-model';

const DIRECT_DZEN_URL = 'https://video.example.test/video/aquacity-start';
const DZEN_REDIRECT_URL = '/v1/materials/material_dzen_001/go';

const BASE_PLACE_DETAIL: PlaceDetail = {
  id: 'place_ekb_001',
  slug: 'baden-baden-uktus',
  title: 'Baden-Baden Uktus',
  summary: 'Thermal complex with spa zone.',
  tags: ['spa'],
  category: {
    id: 'category_spa',
    slug: 'spa',
    title: 'SPA',
    coverImageUrl: null,
  },
  status: 'active',
  coverImageUrl: null,
  mapsUrl: null,
  counters: {
    dzen: 1,
    telegram: 0,
    instagram: 0,
  },
  pinnedMaterial: null,
};

const BASE_DZEN_MATERIAL: PublicMaterial = {
  id: 'material_dzen_001',
  placeId: 'place_ekb_001',
  platform: 'dzen',
  type: 'video',
  title: 'Dzen shorts walkthrough',
  publishedAt: '2026-03-20',
  durationSec: 45,
  redirectUrl: DZEN_REDIRECT_URL,
};

/** Создаёт Telegram-материал для сценариев нормализации mapper-а. */
function createTelegramMaterial(
  overrides: Partial<PublicMaterial> & Pick<PublicMaterial, 'id' | 'publishedAt'>,
): PublicMaterial {
  return {
    ...BASE_DZEN_MATERIAL,
    platform: 'telegram',
    type: 'post',
    durationSec: null,
    redirectUrl: `/v1/materials/${overrides.id}/go`,
    ...overrides,
  };
}

describe('mapPlaceDetailToModel', () => {
  it.each([
    [
      'https://yandex.ru/maps/org/baden_baden/123456789',
      'https://yandex.ru/maps/org/baden_baden/123456789',
    ],
    [
      '  https://yandex.ru/maps/org/baden_baden/123456789  ',
      'https://yandex.ru/maps/org/baden_baden/123456789',
    ],
    [null, null],
    ['', null],
    ['   ', null],
  ] as const)('normalizes backend mapsUrl value %#', (mapsUrl, expected) => {
    expect(mapPlaceDetailToModel({ ...BASE_PLACE_DETAIL, mapsUrl }, {}).mapsUrl).toBe(expected);
  });

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
          redirectUrl: '/out?url=https%3A%2F%2Fvideo.example.test%2Fvideo%2Faquacity-start',
        },
      ],
    });

    expect(place.materialsByPlatform.dzen[0]?.title).toBe('Dzen shorts walkthrough');
    expect(place.materialsByPlatform.dzen[0]?.redirectUrl).toBeNull();
  });

  it('keeps the public slug and backend category for the detail model', () => {
    expect(mapPlaceDetailToModel(BASE_PLACE_DETAIL, {}).slug).toBe('baden-baden-uktus');
    expect(mapPlaceDetailToModel(BASE_PLACE_DETAIL, {}).category).toEqual({
      id: 'category_spa',
      slug: 'spa',
      title: 'SPA',
      coverImageUrl: null,
    });
  });

  it('uses a stable fallback title when public material title is missing', () => {
    const place = mapPlaceDetailToModel(BASE_PLACE_DETAIL, {
      dzen: [
        {
          ...BASE_DZEN_MATERIAL,
          title: null,
        },
      ],
    });

    expect(place.materialsByPlatform.dzen[0]?.title).toBe('Без названия');
  });

  it('deduplicates, injects pinned material, and sorts each platform deterministically', () => {
    const pinnedMaterial = createTelegramMaterial({
      id: 'material_pinned',
      publishedAt: '2026-03-22',
      title: 'Pinned material',
    });
    const materialA = createTelegramMaterial({
      id: 'material_a',
      publishedAt: '2026-03-20',
      title: 'Material A',
    });
    const materialB = createTelegramMaterial({
      id: 'material_b',
      publishedAt: '2026-03-20',
      title: 'Material B',
    });

    const place = mapPlaceDetailToModel(
      {
        ...BASE_PLACE_DETAIL,
        pinnedMaterial,
      },
      {
        telegram: [materialB, materialA, materialA],
      },
    );

    expect(place.materialsByPlatform.telegram.map(({ id }) => id)).toEqual([
      'material_pinned',
      'material_a',
      'material_b',
    ]);
  });
});
