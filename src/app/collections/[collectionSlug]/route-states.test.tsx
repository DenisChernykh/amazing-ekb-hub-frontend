import type { ReactElement } from 'react';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCollectionPageData } from './_lib/get-collection-page-data';
import CollectionError from './error';
import CollectionLoading from './loading';
import CollectionPage from './page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

vi.mock('./_lib/get-collection-page-data', () => ({
  getCollectionPageData: vi.fn(),
}));

const getCollectionPageDataMock = vi.mocked(getCollectionPageData);

const PAGE_PROPS = {
  params: Promise.resolve({ collectionSlug: 'weekend-spots' }),
  searchParams: Promise.resolve({ page: '2' }),
};

const READY_MODEL = {
  kind: 'ready' as const,
  collection: {
    id: 'collection-1',
    slug: 'weekend-spots',
    title: 'Места для выходных',
    description: null,
    coverImageUrl: null,
  },
  places: [{ id: 'place-1', slug: 'place-1', title: 'Первое место', coverImageUrl: null }],
  page: 2,
  pageSize: 20,
  total: 21,
};

describe('collection route states', () => {
  beforeEach(() => getCollectionPageDataMock.mockReset());

  it('renders a stable loading status without a duplicated feed', () => {
    const html = renderToStaticMarkup(createElement(CollectionLoading));

    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).toContain('Открываем подборку…');
    expect(html).not.toContain('place-feed-module');
  });

  it('renders recoverable error copy and wires reset', () => {
    const reset = vi.fn();
    const tree = CollectionError({ error: new Error('offline'), reset }) as ReactElement<{
      retry: () => void;
    }>;
    const html = renderToStaticMarkup(tree);

    expect(html).toContain('Не удалось загрузить подборку');
    expect(html).toContain('Попробуйте запросить данные ещё раз.');
    expect(html).toContain('>Повторить</button>');
    expect(html).toContain('data-slot="button"');
    tree.props.retry();
    expect(reset).toHaveBeenCalledOnce();
  });

  it('loads a valid slug with the normalized query page and renders PlaceFeed', async () => {
    getCollectionPageDataMock.mockResolvedValueOnce(READY_MODEL);

    const html = renderToStaticMarkup(await CollectionPage(PAGE_PROPS));

    expect(getCollectionPageDataMock).toHaveBeenCalledWith('weekend-spots', 2);
    expect(html).toContain('aria-label="Места"');
    expect(html).toContain('href="/places/place-1"');
  });

  it.each(['invalid slug', 'backend 404'])('maps %s to public notFound', async () => {
    getCollectionPageDataMock.mockResolvedValueOnce({ kind: 'not_found' });

    await expect(CollectionPage(PAGE_PROPS)).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('propagates a fatal backend error to the route error boundary', async () => {
    const failure = new Error('backend offline');
    getCollectionPageDataMock.mockRejectedValueOnce(failure);

    await expect(CollectionPage(PAGE_PROPS)).rejects.toBe(failure);
  });

  it('renders the empty collection page without a duplicated feed', async () => {
    getCollectionPageDataMock.mockResolvedValueOnce({
      ...READY_MODEL,
      places: [],
      total: 0,
    });

    const html = renderToStaticMarkup(await CollectionPage(PAGE_PROPS));

    expect(html).toContain('В этой подборке пока нет мест.');
    expect(html).not.toContain('aria-label="Места"');
  });
});
