import { placeMaterialsList } from '@/shared/api/generated/places/places';
import { cacheLife, cacheTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPublicPlaceMaterials } from './fetch-public-place-materials';

vi.mock('@/shared/api/generated/places/places', () => ({
  placeMaterialsList: vi.fn(),
}));

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

const placeMaterialsListMock = vi.mocked(placeMaterialsList);
const cacheLifeMock = vi.mocked(cacheLife);
const cacheTagMock = vi.mocked(cacheTag);

describe('fetchPublicPlaceMaterials', () => {
  beforeEach(() => {
    placeMaterialsListMock.mockReset();
    cacheLifeMock.mockReset();
    cacheTagMock.mockReset();
  });

  it('shares the place tag with detail while keeping platform in the cache key', async () => {
    placeMaterialsListMock.mockResolvedValueOnce({
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
    expect(placeMaterialsListMock).toHaveBeenCalledWith(
      { placeSlug: 'baden-baden-uktus' },
      { platform: 'telegram' },
    );
  });

  it('keeps a technical failure in the uncached outer error union', async () => {
    placeMaterialsListMock.mockRejectedValueOnce(new Error('backend offline'));

    await expect(fetchPublicPlaceMaterials('baden-baden-uktus', 'telegram')).resolves.toEqual({
      kind: 'unexpected_error',
      message: 'Не удалось загрузить материалы места.',
    });
  });

  it('returns the declared validation error for a 422 API response', async () => {
    const error = Object.assign(new Error('Validation failed'), {
      status: 422,
      info: { code: 'VALIDATION_FAILED', message: 'Validation failed' },
    });
    placeMaterialsListMock.mockRejectedValueOnce(error);

    await expect(fetchPublicPlaceMaterials('baden-baden-uktus', 'telegram')).resolves.toEqual({
      kind: 'validation_error',
      data: { code: 'VALIDATION_FAILED', message: 'Validation failed' },
    });
  });
});
