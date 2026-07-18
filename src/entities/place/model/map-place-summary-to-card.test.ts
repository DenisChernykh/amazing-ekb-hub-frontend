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
};

describe('mapPlaceSummaryToCardModel', () => {
  it('uses real platform counters from public place summary', () => {
    expect(
      mapPlaceSummaryToCardModel({
        ...BASE_PLACE_SUMMARY,
        counters: {
          dzen: 12,
          telegram: 7,
          instagram: 3,
        },
      }).platformCounters,
    ).toEqual({
      dzen: 12,
      telegram: 7,
      instagram: 3,
    });
  });

  it('does not substitute mock platform counters when counters are missing', () => {
    expect(mapPlaceSummaryToCardModel(BASE_PLACE_SUMMARY).platformCounters).toEqual({
      dzen: 0,
      telegram: 0,
      instagram: 0,
    });
  });

  it('fills missing counter fields with zeroes', () => {
    expect(
      mapPlaceSummaryToCardModel({
        ...BASE_PLACE_SUMMARY,
        counters: {
          telegram: 2,
        },
      }).platformCounters,
    ).toEqual({
      dzen: 0,
      telegram: 2,
      instagram: 0,
    });
  });

  it('keeps the public slug and backend category for navigation and filters', () => {
    expect(mapPlaceSummaryToCardModel(BASE_PLACE_SUMMARY).slug).toBe('baden-baden-uktus');
    expect(mapPlaceSummaryToCardModel(BASE_PLACE_SUMMARY).category).toEqual({
      id: 'category_spa',
      slug: 'spa',
      title: 'SPA',
    });
  });
});
