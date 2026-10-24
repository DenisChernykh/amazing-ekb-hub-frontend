import { CategoriesGet200Response } from '@/shared/api/generated-zod/categories/categories.zod';
import type { PlaceCategoryPublicResponseDto } from '@/shared/api/generated/model/placeCategoryPublicResponseDto';
import { describe, expect, expectTypeOf, it } from 'vitest';

describe('generated category photo contract', () => {
  it.each([null, '/v1/categories/spa/photo?v=123456789abc'])(
    'accepts the required nullable coverImageUrl value %#',
    (coverImageUrl) => {
      const category: PlaceCategoryPublicResponseDto = {
        id: 'category-spa',
        slug: 'spa',
        title: 'SPA',
        coverImageUrl,
      };

      expect(CategoriesGet200Response.parse(category)).toEqual(category);
      expectTypeOf(category.coverImageUrl).toEqualTypeOf<string | null>();
    },
  );

  it('rejects a response that omits coverImageUrl', () => {
    expect(() =>
      CategoriesGet200Response.parse({
        id: 'category-spa',
        slug: 'spa',
        title: 'SPA',
      }),
    ).toThrow();
  });
});
