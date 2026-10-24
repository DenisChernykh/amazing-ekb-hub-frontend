import { describe, expect, it } from 'vitest';
import { categoryPlacesPageSchema } from './category-places-page-schema';

const PAGE = {
  items: [
    {
      id: 'place-1',
      slug: 'baden-baden-uktus',
      title: 'Баден-Баден Уктус',
      coverImageUrl: null,
    },
  ],
  page: 1,
  pageSize: 20,
  total: 1,
};

describe('categoryPlacesPageSchema', () => {
  it('accepts the exact serializable page-one contract', () => {
    expect(categoryPlacesPageSchema.parse(PAGE)).toEqual(PAGE);
  });

  it('rejects unknown page and item fields', () => {
    expect(
      categoryPlacesPageSchema.safeParse({
        ...PAGE,
        unexpected: true,
      }).success,
    ).toBe(false);
    expect(
      categoryPlacesPageSchema.safeParse({
        ...PAGE,
        items: [{ ...PAGE.items[0], summary: 'Лишнее поле backend DTO' }],
      }).success,
    ).toBe(false);
  });

  it('rejects invalid slugs and pagination values', () => {
    expect(
      categoryPlacesPageSchema.safeParse({
        ...PAGE,
        items: [{ ...PAGE.items[0], slug: '../admin' }],
      }).success,
    ).toBe(false);
    expect(categoryPlacesPageSchema.safeParse({ ...PAGE, page: 0 }).success).toBe(false);
    expect(categoryPlacesPageSchema.safeParse({ ...PAGE, pageSize: 50 }).success).toBe(false);
    expect(categoryPlacesPageSchema.safeParse({ ...PAGE, total: -1 }).success).toBe(false);
  });
});
