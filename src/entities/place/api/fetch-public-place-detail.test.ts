import { getPlaceDetail } from '@/shared/api/generated/places/places';
import { cacheLife, cacheTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPublicPlaceDetail } from './fetch-public-place-detail';

vi.mock('@/shared/api/generated/places/places', () => ({
  getPlaceDetail: vi.fn(),
}));

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

const getPlaceDetailMock = vi.mocked(getPlaceDetail);
const cacheLifeMock = vi.mocked(cacheLife);
const cacheTagMock = vi.mocked(cacheTag);

const PLACE_DETAIL = {
  id: 'place-1',
  slug: 'baden-baden-uktus',
  title: 'Баден-Баден Уктус',
  summary: 'Термальный комплекс',
  tags: ['spa'],
  category: { id: 'category-spa', slug: 'spa', title: 'SPA', coverImageUrl: null },
  status: 'active' as const,
  coverImageUrl: null,
  mapsUrl: null,
  counters: { dzen: 0, telegram: 0, instagram: 0 },
  pinnedMaterial: null,
};

describe('fetchPublicPlaceDetail', () => {
  beforeEach(() => {
    getPlaceDetailMock.mockReset();
    cacheLifeMock.mockReset();
    cacheTagMock.mockReset();
  });

  it('caches only the successful inner read under the place tag', async () => {
    getPlaceDetailMock.mockResolvedValueOnce({
      data: PLACE_DETAIL,
      status: 200,
      headers: new Headers(),
    });

    await expect(fetchPublicPlaceDetail('baden-baden-uktus')).resolves.toEqual({
      kind: 'success',
      data: PLACE_DETAIL,
    });

    expect(cacheLifeMock).toHaveBeenCalledWith({
      stale: 60,
      revalidate: 300,
      expire: 3600,
    });
    expect(cacheTagMock).toHaveBeenCalledWith('place:baden-baden-uktus');
    expect(getPlaceDetailMock).toHaveBeenCalledWith({ placeSlug: 'baden-baden-uktus' });
  });

  it('keeps a technical failure in the uncached outer error union', async () => {
    getPlaceDetailMock.mockRejectedValueOnce(new Error('backend offline'));

    await expect(fetchPublicPlaceDetail('baden-baden-uktus')).resolves.toEqual({
      kind: 'unexpected_error',
      message: 'Не удалось загрузить место.',
    });
  });
});
