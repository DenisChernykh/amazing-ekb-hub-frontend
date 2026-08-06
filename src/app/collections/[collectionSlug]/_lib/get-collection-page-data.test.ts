import { fetchPublicCollectionPage } from '@/entities/collection';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCollectionPageData } from './get-collection-page-data';

vi.mock('@/entities/collection', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/entities/collection')>();

  return {
    ...actual,
    fetchPublicCollectionPage: vi.fn(),
  };
});

const fetchPublicCollectionPageMock = vi.mocked(fetchPublicCollectionPage);

const PLACE = {
  id: 'place-1',
  slug: 'place-1',
  title: 'Первое место',
  summary: 'Описание места',
  tags: [],
  category: { id: 'category-1', slug: 'category-1', title: 'Категория', coverImageUrl: null },
  status: 'active' as const,
  coverImageUrl: null,
  counters: { dzen: 0, telegram: 0, instagram: 0 },
};

const DETAIL = {
  id: 'collection-1',
  slug: 'weekend-spots',
  title: 'Места для выходных',
  description: 'Описание подборки',
  coverImageUrl: null,
  items: [PLACE],
  total: 21,
  page: 1,
  pageSize: 20,
};

describe('getCollectionPageData', () => {
  beforeEach(() => fetchPublicCollectionPageMock.mockReset());

  it('normalizes the entity boundary and preserves backend place order', async () => {
    fetchPublicCollectionPageMock.mockResolvedValueOnce({ kind: 'success', data: DETAIL });

    await expect(getCollectionPageData('weekend-spots', 1)).resolves.toMatchObject({
      kind: 'ready',
      collection: { slug: 'weekend-spots', description: 'Описание подборки' },
      places: [{ slug: 'place-1', title: 'Первое место' }],
      page: 1,
      pageSize: 20,
      total: 21,
    });
  });

  it('returns not_found before transport for an unsafe slug', async () => {
    await expect(getCollectionPageData('../draft', 1)).resolves.toEqual({ kind: 'not_found' });
    expect(fetchPublicCollectionPageMock).not.toHaveBeenCalled();
  });

  it('returns not_found for an API not-found or a non-empty out-of-range page', async () => {
    fetchPublicCollectionPageMock.mockResolvedValueOnce({
      kind: 'not_found',
      data: {
        code: 'COLLECTION_NOT_FOUND',
        detail: 'The requested collection does not exist.',
        instance: 'urn:request:test',
        requestId: 'request-test',
        status: 404,
        title: 'Collection not found',
        type: 'https://errors.example/collection-not-found',
      },
    });
    await expect(getCollectionPageData('missing', 1)).resolves.toEqual({ kind: 'not_found' });

    fetchPublicCollectionPageMock.mockResolvedValueOnce({
      kind: 'success',
      data: { ...DETAIL, page: 3, total: 21 },
    });
    await expect(getCollectionPageData('weekend-spots', 3)).resolves.toEqual({
      kind: 'not_found',
    });
  });

  it('returns not_found after page one for an empty collection', async () => {
    fetchPublicCollectionPageMock.mockResolvedValueOnce({
      kind: 'success',
      data: { ...DETAIL, items: [], page: 2, total: 0 },
    });

    await expect(getCollectionPageData('empty', 2)).resolves.toEqual({ kind: 'not_found' });
  });
});
