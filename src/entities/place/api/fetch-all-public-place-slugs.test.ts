import { listPlaces } from '@/shared/api/generated/places/places';
import { cacheLife } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAllPublicPlaceSlugs } from './fetch-all-public-place-slugs';

vi.mock('@/shared/api/generated/places/places', () => ({
  listPlaces: vi.fn(),
}));

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
}));

const listPlacesMock = vi.mocked(listPlaces);
const cacheLifeMock = vi.mocked(cacheLife);

function makePlace(index: number, status: 'active' | 'hidden' = 'active') {
  return {
    id: `place-${index}`,
    slug: `place-${index}`,
    title: `Место ${index}`,
    summary: '',
    tags: [],
    category: { id: 'category-spa', slug: 'spa', title: 'SPA' },
    status,
    coverImageUrl: null,
    counters: { dzen: 0, telegram: 0, instagram: 0 },
  };
}

describe('fetchAllPublicPlaceSlugs', () => {
  beforeEach(() => {
    listPlacesMock.mockReset();
    cacheLifeMock.mockReset();
  });

  it('enumerates 102 active public slugs over page-size-100 API calls', async () => {
    listPlacesMock
      .mockResolvedValueOnce({
        data: {
          items: Array.from({ length: 100 }, (_, index) => makePlace(index + 1)),
          page: 1,
          pageSize: 100,
          total: 102,
        },
        status: 200,
        headers: new Headers(),
      })
      .mockResolvedValueOnce({
        data: {
          items: [makePlace(101), makePlace(102)],
          page: 2,
          pageSize: 100,
          total: 102,
        },
        status: 200,
        headers: new Headers(),
      });

    const slugs = await fetchAllPublicPlaceSlugs();

    expect(slugs).toHaveLength(102);
    expect(slugs.at(0)).toBe('place-1');
    expect(slugs.at(-1)).toBe('place-102');
    expect(listPlacesMock).toHaveBeenCalledTimes(2);
    expect(listPlacesMock).toHaveBeenNthCalledWith(1, { page: 1, pageSize: 100 });
    expect(listPlacesMock).toHaveBeenNthCalledWith(2, { page: 2, pageSize: 100 });
    expect(cacheLifeMock).toHaveBeenCalledWith({
      stale: 60,
      revalidate: 300,
      expire: 3600,
    });
  });

  it('filters hidden places without using the filtered count to stop pagination', async () => {
    listPlacesMock
      .mockResolvedValueOnce({
        data: {
          items: [
            ...Array.from({ length: 99 }, (_, index) => makePlace(index + 1)),
            makePlace(100, 'hidden'),
          ],
          page: 1,
          pageSize: 100,
          total: 102,
        },
        status: 200,
        headers: new Headers(),
      })
      .mockResolvedValueOnce({
        data: {
          items: [makePlace(101), makePlace(102, 'hidden')],
          page: 2,
          pageSize: 100,
          total: 102,
        },
        status: 200,
        headers: new Headers(),
      });

    const slugs = await fetchAllPublicPlaceSlugs();

    expect(slugs).toHaveLength(100);
    expect(slugs).not.toContain('place-100');
    expect(slugs).toContain('place-101');
    expect(slugs).not.toContain('place-102');
    expect(listPlacesMock).toHaveBeenCalledTimes(2);
  });

  it('fails fast when an empty page arrives before the reported total', async () => {
    listPlacesMock
      .mockResolvedValueOnce({
        data: {
          items: [],
          page: 1,
          pageSize: 100,
          total: 2,
        },
        status: 200,
        headers: new Headers(),
      })
      .mockRejectedValueOnce(new Error('unexpected second request'));

    await expect(fetchAllPublicPlaceSlugs()).rejects.toThrow(
      'Public place slug enumeration stopped: page 1 returned no items before total 2 was reached',
    );
    expect(listPlacesMock).toHaveBeenCalledOnce();
  });

  it('propagates a build-time API failure', async () => {
    const error = new Error('backend offline');
    listPlacesMock.mockRejectedValueOnce(error);

    await expect(fetchAllPublicPlaceSlugs()).rejects.toBe(error);
  });
});
