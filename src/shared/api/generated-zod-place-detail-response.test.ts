import {
  ClearPinnedMaterial200Response,
  GetAdminPlaceDetail200Response,
  SetPinnedMaterial200Response,
} from '@/shared/api/generated-zod/admin/admin.zod';
import { GetPlaceDetail200Response } from '@/shared/api/generated-zod/places/places.zod';
import { describe, expect, it } from 'vitest';

const PLACE_DETAIL_RESPONSE = {
  id: 'place_ekb_001',
  title: 'Baden-Baden Uktus',
  summary: 'Thermal complex with spa zone.',
  tags: ['spa'],
  category: 'spa',
  status: 'active',
  popularityWeight: 95,
  coverImageUrl: '/v1/places/place_ekb_001/photo',
  counters: {
    dzen: 12,
    telegram: 7,
    instagram: 3,
  },
  pinnedMaterial: null,
} as const;

const PINNED_MATERIAL_RESPONSE = {
  id: 'material_telegram_001',
  placeId: 'place_ekb_001',
  platform: 'telegram',
  type: 'post',
  title: 'Visiting tips',
  publishedAt: '2026-03-20T10:30:00.000Z',
  durationSec: null,
  url: 'https://t.me/amazing_ekb/321',
} as const;

describe('generated Zod place detail response schemas', () => {
  it('accepts public place detail payload with summary fields and pinned material', () => {
    expect(
      GetPlaceDetail200Response.safeParse({
        ...PLACE_DETAIL_RESPONSE,
        pinnedMaterial: PINNED_MATERIAL_RESPONSE,
      }).success,
    ).toBe(true);
  });

  it('accepts admin place detail payload with nullable pinned material', () => {
    expect(GetAdminPlaceDetail200Response.safeParse(PLACE_DETAIL_RESPONSE).success).toBe(true);
    expect(ClearPinnedMaterial200Response.safeParse(PLACE_DETAIL_RESPONSE).success).toBe(true);
  });

  it('accepts admin pinned-material mutation response with assigned pinned material', () => {
    expect(
      SetPinnedMaterial200Response.safeParse({
        ...PLACE_DETAIL_RESPONSE,
        pinnedMaterial: PINNED_MATERIAL_RESPONSE,
      }).success,
    ).toBe(true);
  });

  it('keeps detail response validation strict for unexpected fields', () => {
    expect(
      GetPlaceDetail200Response.safeParse({
        ...PLACE_DETAIL_RESPONSE,
        unexpected: 'field',
      }).success,
    ).toBe(false);
  });
});
