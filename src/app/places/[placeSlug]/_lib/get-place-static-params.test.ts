import { fetchAllPublicPlaceSlugs } from '@/entities/place';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getPlaceStaticParams } from './get-place-static-params';

vi.mock('@/entities/place', () => ({
  fetchAllPublicPlaceSlugs: vi.fn(),
}));

const fetchAllPublicPlaceSlugsMock = vi.mocked(fetchAllPublicPlaceSlugs);

describe('getPlaceStaticParams', () => {
  beforeEach(() => {
    fetchAllPublicPlaceSlugsMock.mockReset();
  });

  it('maps every active public place slug to a route parameter', async () => {
    fetchAllPublicPlaceSlugsMock.mockResolvedValueOnce(['baden-baden-uktus', 'ocean']);

    await expect(getPlaceStaticParams()).resolves.toEqual([
      { placeSlug: 'baden-baden-uktus' },
      { placeSlug: 'ocean' },
    ]);
  });

  it('propagates enumeration failures so build cannot hide an unreachable API', async () => {
    const error = new Error('backend offline');
    fetchAllPublicPlaceSlugsMock.mockRejectedValueOnce(error);

    await expect(getPlaceStaticParams()).rejects.toBe(error);
  });
});
