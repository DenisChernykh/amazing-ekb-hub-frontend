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

  it('rejects malformed route placeId before backend calls', async () => {
    await expect(getPlacePageData('../admin?x=1')).resolves.toEqual({ kind: 'not_found' });

    expect(fetchPublicPlaceDetailMock).not.toHaveBeenCalled();
    expect(fetchPublicPlaceMaterialsMock).not.toHaveBeenCalled();
  });

  it('rejects route placeId with decoded surrounding whitespace before backend calls', async () => {
    await expect(getPlacePageData(' place_ekb_001 ')).resolves.toEqual({ kind: 'not_found' });

    expect(fetchPublicPlaceDetailMock).not.toHaveBeenCalled();
    expect(fetchPublicPlaceMaterialsMock).not.toHaveBeenCalled();
  });

  it('uses valid route placeId for detail and materials requests', async () => {
    fetchPublicPlaceDetailMock.mockResolvedValueOnce({
      kind: 'success',
      data: {
        id: 'place_ekb_001',
        title: 'Aqua City',
        summary: 'Pool',
        tags: ['pool'],
        category: 'pools',
        status: 'active',
        popularityWeight: 100,
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

    await expect(getPlacePageData('place_ekb_001')).resolves.toMatchObject({ kind: 'ready' });

    expect(fetchPublicPlaceDetailMock).toHaveBeenCalledWith('place_ekb_001');
    expect(fetchPublicPlaceMaterialsMock).toHaveBeenCalledWith('place_ekb_001', 'dzen');
    expect(fetchPublicPlaceMaterialsMock).toHaveBeenCalledWith('place_ekb_001', 'telegram');
    expect(fetchPublicPlaceMaterialsMock).toHaveBeenCalledWith('place_ekb_001', 'instagram');
  });
});
