import type { CollectionCardModel } from '@/entities/collection';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCollectionsPageData } from './_lib/get-collections-page-data';
import CollectionsPage from './page';

vi.mock('./_lib/get-collections-page-data', () => ({
  getCollectionsPageData: vi.fn(),
}));

const getCollectionsPageDataMock = vi.mocked(getCollectionsPageData);

const COLLECTIONS: CollectionCardModel[] = [
  {
    id: 'collection-photo',
    slug: 'photo',
    title: 'С фото',
    description: 'Описание',
    coverImageUrl: '/v1/collections/photo/photo',
    placeCount: 1,
  },
  {
    id: 'collection-no-photo',
    slug: 'no-photo',
    title: 'Без фото',
    description: null,
    coverImageUrl: null,
    placeCount: 5,
  },
];

describe('CollectionsPage', () => {
  beforeEach(() => getCollectionsPageDataMock.mockReset());

  it('renders photo and no-photo cards in server markup', async () => {
    getCollectionsPageDataMock.mockResolvedValueOnce({ kind: 'ready', collections: COLLECTIONS });

    const html = renderToStaticMarkup(await CollectionsPage());

    expect(html).toContain('>Подборки</h1>');
    expect(html).toContain('/v1/collections/photo/photo');
    expect(html).toContain('>Б</div>');
    expect(html).toContain('1 место');
    expect(html).toContain('5 мест');
  });

  it('propagates a technical failure to the route error boundary', async () => {
    const failure = new Error('backend offline');
    getCollectionsPageDataMock.mockRejectedValueOnce(failure);

    await expect(CollectionsPage()).rejects.toBe(failure);
  });
});
