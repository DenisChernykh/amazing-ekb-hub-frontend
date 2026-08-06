import { collectionsList } from '@/shared/api/generated/collections/collections';
import { cacheLife, cacheTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPublicCollections } from './fetch-public-collections';

vi.mock('@/shared/api/generated/collections/collections', () => ({
  collectionsList: vi.fn(),
}));

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

const collectionsListMock = vi.mocked(collectionsList);
const cacheLifeMock = vi.mocked(cacheLife);
const cacheTagMock = vi.mocked(cacheTag);

describe('fetchPublicCollections', () => {
  beforeEach(() => {
    collectionsListMock.mockReset();
    cacheLifeMock.mockReset();
    cacheTagMock.mockReset();
  });

  it('keeps backend order and applies the collection list cache tag', async () => {
    const items = [
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
        description: 'Описание',
        coverImageUrl: '/v1/collections/second/photo',
        placeCount: 4,
      },
    ];
    collectionsListMock.mockResolvedValueOnce({
      data: { items },
      status: 200,
      headers: new Headers(),
    });

    await expect(fetchPublicCollections()).resolves.toEqual({ kind: 'success', data: items });
    expect(cacheLifeMock).toHaveBeenCalledWith({ stale: 60, revalidate: 300, expire: 3600 });
    expect(cacheTagMock).toHaveBeenCalledWith('collections');
    expect(collectionsListMock).toHaveBeenCalledOnce();
  });

  it('returns a controlled unexpected error for technical failures', async () => {
    collectionsListMock.mockRejectedValueOnce(new Error('backend offline'));

    await expect(fetchPublicCollections()).resolves.toEqual({
      kind: 'unexpected_error',
      message: 'Не удалось загрузить подборки.',
    });
  });
});
