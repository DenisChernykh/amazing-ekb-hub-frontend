import { collectionsGet } from '@/shared/api/generated/collections/collections';
import { cacheLife, cacheTag } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPublicCollectionPage } from './fetch-public-collection-page';

vi.mock('@/shared/api/generated/collections/collections', () => ({
  collectionsGet: vi.fn(),
}));

vi.mock('next/cache', () => ({
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

const collectionsGetMock = vi.mocked(collectionsGet);
const cacheLifeMock = vi.mocked(cacheLife);
const cacheTagMock = vi.mocked(cacheTag);

const PAGE = {
  id: 'collection-1',
  slug: 'weekend-spots',
  title: 'Места для выходных',
  description: null,
  coverImageUrl: null,
  items: [],
  total: 0,
  page: 2,
  pageSize: 20,
};

describe('fetchPublicCollectionPage', () => {
  beforeEach(() => {
    collectionsGetMock.mockReset();
    cacheLifeMock.mockReset();
    cacheTagMock.mockReset();
  });

  it('passes the fixed page size and applies both detail cache tags', async () => {
    collectionsGetMock.mockResolvedValueOnce({
      data: PAGE,
      status: 200,
      headers: new Headers(),
    });

    await expect(fetchPublicCollectionPage('weekend-spots', 2)).resolves.toEqual({
      kind: 'success',
      data: PAGE,
    });
    expect(cacheLifeMock).toHaveBeenCalledWith({ stale: 60, revalidate: 300, expire: 3600 });
    expect(cacheTagMock).toHaveBeenNthCalledWith(1, 'collection:weekend-spots');
    expect(cacheTagMock).toHaveBeenNthCalledWith(2, 'collection-places:weekend-spots');
    expect(collectionsGetMock).toHaveBeenCalledWith(
      { collectionSlug: 'weekend-spots' },
      { page: 2, pageSize: 20 },
    );
  });

  it('maps a public collection 404 to not_found', async () => {
    collectionsGetMock.mockRejectedValueOnce(
      Object.assign(new Error('not found'), {
        status: 404,
        info: { code: 'COLLECTION_NOT_FOUND' },
      }),
    );

    await expect(fetchPublicCollectionPage('missing', 1)).resolves.toEqual({
      kind: 'not_found',
      data: { code: 'COLLECTION_NOT_FOUND' },
    });
  });

  it('maps technical failures to unexpected_error', async () => {
    collectionsGetMock.mockRejectedValueOnce(new Error('backend offline'));

    await expect(fetchPublicCollectionPage('weekend-spots', 1)).resolves.toEqual({
      kind: 'unexpected_error',
      message: 'Не удалось загрузить подборку.',
    });
  });
});
