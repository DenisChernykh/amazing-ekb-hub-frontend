import { listPlaceMaterials } from '@/shared/api/generated/places/places';
import { cacheLife, cacheTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPublicPlaceMaterials } from './fetch-public-place-materials';

vi.mock('@/shared/api/generated/places/places', () => ({
  listPlaceMaterials: vi.fn(),
}));

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

const listPlaceMaterialsMock = vi.mocked(listPlaceMaterials);
const cacheLifeMock = vi.mocked(cacheLife);
const cacheTagMock = vi.mocked(cacheTag);

describe('fetchPublicPlaceMaterials', () => {
  beforeEach(() => {
    listPlaceMaterialsMock.mockReset();
    cacheLifeMock.mockReset();
    cacheTagMock.mockReset();
  });

  it('shares the place tag with detail while keeping platform in the cache key', async () => {
    listPlaceMaterialsMock.mockResolvedValueOnce({
      data: { items: [] },
      status: 200,
      headers: new Headers(),
    });

    await expect(fetchPublicPlaceMaterials('baden-baden-uktus', 'telegram')).resolves.toEqual({
      kind: 'success',
      data: { items: [] },
    });

    expect(cacheLifeMock).toHaveBeenCalledWith({
      stale: 60,
      revalidate: 300,
      expire: 3600,
    });
    expect(cacheTagMock).toHaveBeenCalledWith('place:baden-baden-uktus');
    expect(listPlaceMaterialsMock).toHaveBeenCalledWith(
      { placeSlug: 'baden-baden-uktus' },
      { platform: 'telegram' },
    );
  });

  it('keeps a technical failure in the uncached outer error union', async () => {
    listPlaceMaterialsMock.mockRejectedValueOnce(new Error('backend offline'));

    await expect(fetchPublicPlaceMaterials('baden-baden-uktus', 'telegram')).resolves.toEqual({
      kind: 'unexpected_error',
      message: 'Не удалось загрузить материалы места.',
    });
  });
});
