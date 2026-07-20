import type { PlaceCardModel } from '@/entities/place';
import { describe, expect, it } from 'vitest';
import { chunkPlaceCards } from './chunk-place-cards';

const ITEMS: PlaceCardModel[] = Array.from({ length: 12 }, (_, index) => ({
  id: String(index + 1),
  slug: `place-${index + 1}`,
  title: `Place ${index + 1}`,
  coverImageUrl: null,
}));

describe('chunkPlaceCards', () => {
  it('splits cards into stable five-card modules without mutating the input', () => {
    const originalItems = [...ITEMS];

    expect(chunkPlaceCards(ITEMS).map((module) => module.map(({ id }) => id))).toEqual([
      ['1', '2', '3', '4', '5'],
      ['6', '7', '8', '9', '10'],
      ['11', '12'],
    ]);
    expect(ITEMS).toEqual(originalItems);
  });
});
