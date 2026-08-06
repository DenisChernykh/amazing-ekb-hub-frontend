import { fetchPublicCollections } from '@/entities/collection';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCollectionsPageData } from './get-collections-page-data';

vi.mock('@/entities/collection', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/collection')>();

  return {
    ...actual,
    fetchPublicCollections: vi.fn(),
  };
});

const fetchPublicCollectionsMock = vi.mocked(fetchPublicCollections);

const COLLECTIONS = [
  {
    id: 'collection-2',
    slug: 'second',
    title: 'Вторая',
    description: null,
    coverImageUrl: null,
    placeCount: 2,
  },
  {
    id: 'collection-1',
    slug: 'first',
    title: 'Первая',
    description: 'Описание',
    coverImageUrl: '/v1/collections/first/photo',
    placeCount: 1,
  },
];

describe('getCollectionsPageData', () => {
  beforeEach(() => fetchPublicCollectionsMock.mockReset());

  it('keeps backend order and maps at the entity boundary', async () => {
    fetchPublicCollectionsMock.mockResolvedValueOnce({ kind: 'success', data: COLLECTIONS });

    await expect(getCollectionsPageData()).resolves.toMatchObject({
      kind: 'ready',
      collections: [{ slug: 'second' }, { slug: 'first' }],
    });
  });

  it('propagates a technical failure to the route error boundary', async () => {
    const failure = new Error('backend offline');
    fetchPublicCollectionsMock.mockRejectedValueOnce(failure);

    await expect(getCollectionsPageData()).rejects.toBe(failure);
  });
});
