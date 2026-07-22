import type { PlaceDetailModel, PlaceMaterialModel } from '@/entities/place';
import { describe, expect, it } from 'vitest';
import { buildPlaceDetailViewModel } from './build-place-detail-view-model';

/** Создаёт материал для изолированных view-model сценариев. */
function createMaterial(overrides: Partial<PlaceMaterialModel> = {}): PlaceMaterialModel {
  return {
    durationSec: null,
    id: 'material_default',
    platform: 'dzen',
    publishedAt: '2026-03-20T10:30:00.000Z',
    redirectUrl: '/v1/materials/material_default/go',
    title: 'Материал об Уктусе',
    type: 'post',
    ...overrides,
  };
}

/** Создаёт минимальную detail-модель места для теста. */
function createPlace(overrides: Partial<PlaceDetailModel> = {}): PlaceDetailModel {
  return {
    category: {
      id: 'category_spa',
      slug: 'spa',
      title: 'SPA',
      coverImageUrl: null,
    },
    coverImageUrl: null,
    id: 'place_ekb_001',
    slug: 'baden-baden-uktus',
    materialsByPlatform: {
      dzen: [],
      instagram: [],
      telegram: [],
    },
    pinnedMaterial: null,
    platformCounters: {
      dzen: 0,
      instagram: 0,
      telegram: 0,
    },
    summary: 'Не должно попадать в архивный UI.',
    tags: ['spa'],
    title: 'Baden-Baden Uktus',
    ...overrides,
  };
}

describe('buildPlaceDetailViewModel', () => {
  it('omits empty platforms and renders the pinned material once', () => {
    const pinned = createMaterial({
      id: 'material_pinned',
      title: 'Закреплённый гид',
      type: 'video',
    });
    const dzenMaterial = createMaterial({ id: 'material_dzen' });
    const telegramMaterial = createMaterial({
      id: 'material_telegram',
      platform: 'telegram',
      redirectUrl: null,
    });
    const model = buildPlaceDetailViewModel(
      createPlace({
        materialsByPlatform: {
          dzen: [pinned, dzenMaterial],
          instagram: [],
          telegram: [telegramMaterial],
        },
        pinnedMaterial: pinned,
      }),
    );

    expect(model.coverImageUrl).toBe('/images/places/place-placeholder.webp');
    expect(model.totalCount).toBe(3);
    expect(model.platforms.map(({ platform }) => platform)).toEqual(['dzen', 'telegram']);
    expect(model.platforms[0]).toMatchObject({
      anchor: 'materials-dzen',
      count: 2,
      platform: 'dzen',
    });
    expect(model.platforms[0]?.materials.map(({ id }) => id)).toEqual(['material_dzen']);
    expect(model.pinned?.id).toBe('material_pinned');
    expect(model.initialPreview?.id).toBe('material_pinned');
    expect(model.previewsById.material_telegram?.redirectUrl).toBeNull();
  });

  it('uses the first material in platform order when there is no pinned material', () => {
    const firstDzenMaterial = createMaterial({ id: 'material_dzen_first' });
    const model = buildPlaceDetailViewModel(
      createPlace({
        coverImageUrl: '/images/places/baden.webp',
        materialsByPlatform: {
          dzen: [firstDzenMaterial],
          instagram: [],
          telegram: [createMaterial({ id: 'material_telegram', platform: 'telegram' })],
        },
      }),
    );

    expect(model.coverImageUrl).toBe('/images/places/baden.webp');
    expect(model.pinned).toBeNull();
    expect(model.initialPreview?.id).toBe('material_dzen_first');
  });
});
