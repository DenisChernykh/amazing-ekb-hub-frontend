import { describe, expect, it } from 'vitest';
import { mapCollectionToCardModel } from './map-collection-to-card-model';

describe('mapCollectionToCardModel', () => {
  it('keeps collection order and normalizes nullable copy and cover fields', () => {
    expect(
      mapCollectionToCardModel({
        id: 'collection-1',
        slug: 'weekend-spots',
        title: 'Места для выходных',
        description: '  Для короткой поездки  ',
        coverImageUrl: ' /v1/collections/weekend-spots/photo ',
        placeCount: 3,
      }),
    ).toEqual({
      id: 'collection-1',
      slug: 'weekend-spots',
      title: 'Места для выходных',
      description: 'Для короткой поездки',
      coverImageUrl: '/v1/collections/weekend-spots/photo',
      placeCount: 3,
    });
  });

  it.each([
    { description: null, coverImageUrl: null },
    { description: '   ', coverImageUrl: '   ' },
  ])('keeps null for absent optional fields: %#', ({ description, coverImageUrl }) => {
    expect(
      mapCollectionToCardModel({
        id: 'collection-1',
        slug: 'weekend-spots',
        title: 'Места для выходных',
        description,
        coverImageUrl,
        placeCount: 1,
      }),
    ).toMatchObject({ description: null, coverImageUrl: null });
  });
});
