import { GetPlaceDetail200Response } from '@/shared/api/generated-zod/places/places.zod';
import type { PlaceDetail } from '@/shared/api/generated/model/placeDetail';
import { describe, expect, expectTypeOf, it } from 'vitest';

const BASE_PLACE_DETAIL: Omit<PlaceDetail, 'mapsUrl'> = {
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
  counters: {
    dzen: 0,
    telegram: 0,
    instagram: 0,
  },
  pinnedMaterial: null,
};

describe('generated place maps URL contract', () => {
  it.each([null, 'https://yandex.ru/maps/org/baden_baden/123456789'])(
    'accepts the required nullable mapsUrl value %#',
    (mapsUrl) => {
      const place: PlaceDetail = { ...BASE_PLACE_DETAIL, mapsUrl };

      expect(GetPlaceDetail200Response.parse(place)).toEqual(place);
      expectTypeOf(place.mapsUrl).toEqualTypeOf<string | null>();
    },
  );

  it('rejects a response that omits mapsUrl', () => {
    expect(() => GetPlaceDetail200Response.parse(BASE_PLACE_DETAIL)).toThrow();
  });
});
