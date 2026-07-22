import { GetPlaceCategory200Response } from '@/shared/api/generated-zod/places/places.zod';
import type { PlaceCategory } from '@/shared/api/generated/model/placeCategory';
import { describe, expect, expectTypeOf, it } from 'vitest';

describe('generated category photo contract', () => {
  it.each([null, '/v1/categories/spa/photo?v=123456789abc'])(
    'accepts the required nullable coverImageUrl value %#',
    (coverImageUrl) => {
      const category: PlaceCategory = {
        id: 'category-spa',
        slug: 'spa',
        title: 'SPA',
        coverImageUrl,
      };

      expect(GetPlaceCategory200Response.parse(category)).toEqual(category);
      expectTypeOf(category.coverImageUrl).toEqualTypeOf<string | null>();
    },
  );

  it('rejects a response that omits coverImageUrl', () => {
    expect(() =>
      GetPlaceCategory200Response.parse({
        id: 'category-spa',
        slug: 'spa',
        title: 'SPA',
      }),
    ).toThrow();
  });
});
