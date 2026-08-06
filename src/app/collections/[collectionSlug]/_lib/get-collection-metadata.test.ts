import { fetchPublicCollectionPage } from '@/entities/collection';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCollectionMetadata } from './get-collection-metadata';

vi.mock('@/entities/collection', () => ({
  buildCollectionHref: (slug: string) => `/collections/${encodeURIComponent(slug)}`,
  fetchPublicCollectionPage: vi.fn(),
  normalizeCollectionSlug: (slug: string) =>
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ? slug : null,
}));

const fetchPublicCollectionPageMock = vi.mocked(fetchPublicCollectionPage);

const BASE_PAGE = {
  id: 'collection-1',
  slug: 'weekend-spots',
  title: 'Места для выходных',
  description: 'Описание выходных мест.',
  coverImageUrl: 'http://127.0.0.1:3000/v1/collections/weekend-spots/photo',
  items: [],
  total: 21,
  page: 1,
  pageSize: 20,
};

describe('getCollectionMetadata', () => {
  beforeEach(() => fetchPublicCollectionPageMock.mockReset());

  it('uses public collection copy, cover and a canonical page-one URL', async () => {
    fetchPublicCollectionPageMock.mockResolvedValueOnce({ kind: 'success', data: BASE_PAGE });

    await expect(getCollectionMetadata('weekend-spots', 1)).resolves.toMatchObject({
      title: 'Места для выходных — Стрельчук в Екатеринбурге',
      description: 'Описание выходных мест.',
      alternates: { canonical: '/collections/weekend-spots' },
      openGraph: {
        title: 'Места для выходных — Стрельчук в Екатеринбурге',
        description: 'Описание выходных мест.',
        url: '/collections/weekend-spots',
        images: [
          {
            url: 'http://127.0.0.1:3000/v1/collections/weekend-spots/photo',
          },
        ],
      },
    });
    expect(fetchPublicCollectionPageMock).toHaveBeenCalledWith('weekend-spots', 1);
  });

  it('uses fallback copy, omits a null-cover image and canonicalizes later pages', async () => {
    fetchPublicCollectionPageMock.mockResolvedValueOnce({
      kind: 'success',
      data: { ...BASE_PAGE, description: null, coverImageUrl: null, total: 40, page: 2 },
    });

    const metadata = await getCollectionMetadata('weekend-spots', 2);

    expect(metadata).toMatchObject({
      title: 'Места для выходных — Стрельчук в Екатеринбурге — Страница 2',
      description: 'Подборка мест «Места для выходных» в Екатеринбурге.',
      alternates: { canonical: '/collections/weekend-spots?page=2' },
    });
    expect(metadata.openGraph).not.toHaveProperty('images');
  });

  it.each([
    ['unsafe slug', '../draft-collection', 1],
    ['not found', 'missing', 1],
    ['unexpected error', 'weekend-spots', 1],
    ['out of range', 'weekend-spots', 3],
  ])('does not leak data for %s', async (_name, slug, page) => {
    if (slug === '../draft-collection') {
      fetchPublicCollectionPageMock.mockClear();
    } else if (_name === 'not found') {
      fetchPublicCollectionPageMock.mockResolvedValueOnce({
        kind: 'not_found',
        data: {
          code: 'COLLECTION_NOT_FOUND',
          detail: 'Collection was not found',
          instance: '/v1/collections/missing',
          requestId: 'request-1',
          status: 404,
          title: 'Not Found',
          type: 'about:blank',
        },
      });
    } else if (_name === 'unexpected error') {
      fetchPublicCollectionPageMock.mockResolvedValueOnce({
        kind: 'unexpected_error',
        message: 'Не удалось загрузить подборку.',
      });
    } else {
      fetchPublicCollectionPageMock.mockResolvedValueOnce({
        kind: 'success',
        data: { ...BASE_PAGE, total: 21, page: 3 },
      });
    }

    await expect(getCollectionMetadata(slug, page)).resolves.toEqual({
      title: 'Стрельчук в Екатеринбурге',
      description: 'Удобный навигатор по моим обзорам',
    });
    if (slug === '../draft-collection')
      expect(fetchPublicCollectionPageMock).not.toHaveBeenCalled();
  });

  it('shares the exact fetcher arguments used by the page data loader', async () => {
    fetchPublicCollectionPageMock.mockResolvedValue({ kind: 'success', data: BASE_PAGE });

    await getCollectionMetadata('weekend-spots', 2);
    await getCollectionMetadata('weekend-spots', 2);

    expect(fetchPublicCollectionPageMock).toHaveBeenNthCalledWith(1, 'weekend-spots', 2);
    expect(fetchPublicCollectionPageMock).toHaveBeenNthCalledWith(2, 'weekend-spots', 2);
  });
});
