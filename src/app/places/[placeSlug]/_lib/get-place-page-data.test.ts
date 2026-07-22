import { fetchPublicPlaceDetail } from '@/entities/place/api/fetch-public-place-detail';
import { fetchPublicPlaceMaterials } from '@/entities/place/api/fetch-public-place-materials';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPlacePageData } from './get-place-page-data';

vi.mock('@/entities/place/api/fetch-public-place-detail', () => ({
  fetchPublicPlaceDetail: vi.fn(),
}));

vi.mock('@/entities/place/api/fetch-public-place-materials', () => ({
  fetchPublicPlaceMaterials: vi.fn(),
}));

const fetchPublicPlaceDetailMock = vi.mocked(fetchPublicPlaceDetail);
const fetchPublicPlaceMaterialsMock = vi.mocked(fetchPublicPlaceMaterials);

describe('getPlacePageData', () => {
  beforeEach(() => {
    fetchPublicPlaceDetailMock.mockReset();
    fetchPublicPlaceMaterialsMock.mockReset();
  });

  it('rejects malformed route placeSlug before backend calls', async () => {
    await expect(getPlacePageData('../admin?x=1')).resolves.toEqual({ kind: 'not_found' });

    expect(fetchPublicPlaceDetailMock).not.toHaveBeenCalled();
    expect(fetchPublicPlaceMaterialsMock).not.toHaveBeenCalled();
  });

  it('rejects route placeSlug with decoded surrounding whitespace before backend calls', async () => {
    await expect(getPlacePageData(' baden-baden-uktus ')).resolves.toEqual({ kind: 'not_found' });

    expect(fetchPublicPlaceDetailMock).not.toHaveBeenCalled();
    expect(fetchPublicPlaceMaterialsMock).not.toHaveBeenCalled();
  });

  it('uses valid route placeSlug for detail and materials requests', async () => {
    fetchPublicPlaceDetailMock.mockResolvedValueOnce({
      kind: 'success',
      data: {
        id: 'place_ekb_001',
        slug: 'baden-baden-uktus',
        title: 'Aqua City',
        summary: 'Pool',
        tags: ['pool'],
        category: {
          id: 'category_pools',
          slug: 'pools',
          title: 'Бассейны',
          coverImageUrl: null,
        },
        status: 'active',
        coverImageUrl: null,
        counters: {
          dzen: 0,
          telegram: 0,
          instagram: 0,
        },
        pinnedMaterial: null,
      },
    });
    fetchPublicPlaceMaterialsMock.mockResolvedValue({
      kind: 'success',
      data: {
        items: [],
      },
    });

    await expect(getPlacePageData('baden-baden-uktus')).resolves.toMatchObject({ kind: 'ready' });

    expect(fetchPublicPlaceDetailMock).toHaveBeenCalledWith('baden-baden-uktus');
    expect(fetchPublicPlaceMaterialsMock).toHaveBeenCalledWith('baden-baden-uktus', 'dzen');
    expect(fetchPublicPlaceMaterialsMock).toHaveBeenCalledWith('baden-baden-uktus', 'telegram');
    expect(fetchPublicPlaceMaterialsMock).toHaveBeenCalledWith('baden-baden-uktus', 'instagram');
  });
});
