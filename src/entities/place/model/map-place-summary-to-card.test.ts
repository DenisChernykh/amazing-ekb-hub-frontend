import { describe, expect, it } from 'vitest';
import { mapPlaceSummaryToCardModel } from './map-place-summary-to-card';

const BASE_PLACE_SUMMARY = {
  id: 'place_ekb_001',
  slug: 'baden-baden-uktus',
  title: 'Baden-Baden Uktus',
  summary: 'Thermal complex with spa zone.',
  tags: ['spa'],
  category: {
    id: 'category_spa',
    slug: 'spa',
    title: 'SPA',
  },
  status: 'active' as const,
  coverImageUrl: '/v1/places/baden-baden-uktus/photo',
  counters: {
    dzen: 0,
    telegram: 0,
    instagram: 0,
  },
};

describe('mapPlaceSummaryToCardModel', () => {
  it('maps only the fields required by a place card', () => {
    expect(mapPlaceSummaryToCardModel(BASE_PLACE_SUMMARY)).toEqual({
      id: 'place_ekb_001',
      slug: 'baden-baden-uktus',
      title: 'Baden-Baden Uktus',
      coverImageUrl: '/v1/places/baden-baden-uktus/photo',
    });
  });
});
