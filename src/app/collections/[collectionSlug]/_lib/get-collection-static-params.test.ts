import { fetchPublicCollections } from '@/entities/collection';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCollectionStaticParams } from './get-collection-static-params';

vi.mock('@/entities/collection', () => ({
  fetchPublicCollections: vi.fn(),
}));

const fetchPublicCollectionsMock = vi.mocked(fetchPublicCollections);

describe('getCollectionStaticParams', () => {
  beforeEach(() => fetchPublicCollectionsMock.mockReset());

  it('maps all public collection slugs from the list response', async () => {
    fetchPublicCollectionsMock.mockResolvedValueOnce({
      kind: 'success',
      data: [
        {
          id: 'collection-1',
          slug: 'first',
          title: 'Первая',
          description: null,
          coverImageUrl: null,
          placeCount: 1,
        },
        {
          id: 'collection-2',
          slug: 'second',
          title: 'Вторая',
          description: null,
          coverImageUrl: null,
          placeCount: 2,
        },
      ],
    });

    await expect(getCollectionStaticParams()).resolves.toEqual([
      { collectionSlug: 'first' },
      { collectionSlug: 'second' },
    ]);
  });

  it('fails the build when collection enumeration is unexpectedly unavailable', async () => {
    const failure = new Error('backend offline');
    fetchPublicCollectionsMock.mockRejectedValueOnce(failure);

    await expect(getCollectionStaticParams()).rejects.toBe(failure);
  });
});
