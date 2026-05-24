import { describe, expect, it } from 'vitest';
import { mapPlaceSummaryToCardModel } from './map-place-summary-to-card';

const BASE_PLACE_SUMMARY = {
  id: 'place_ekb_001',
  title: 'Baden-Baden Uktus',
  summary: 'Thermal complex with spa zone.',
  tags: ['spa'],
  category: 'spa' as const,
  status: 'active' as const,
  popularityWeight: 95,
  coverImageUrl: '/v1/places/place_ekb_001/photo',
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
});
