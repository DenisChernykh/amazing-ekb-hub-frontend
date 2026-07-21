import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchNextCategoryPlacesPage } from './fetch-next-category-places-page';

const PAGE = {
  items: [
    {
      id: 'place-21',
      slug: 'place-21',
      title: 'Место 21',
      coverImageUrl: null,
    },
  ],
  page: 2,
  pageSize: 20,
  total: 21,
};

describe('fetchNextCategoryPlacesPage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('requests an encoded same-origin page with the provided abort signal', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify(PAGE), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();

    await expect(
      fetchNextCategoryPlacesPage({
        categorySlug: 'spa/сауна',
        page: 2,
        signal: controller.signal,
      }),
    ).resolves.toEqual(PAGE);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/categories/spa%2F%D1%81%D0%B0%D1%83%D0%BD%D0%B0/places?page=2',
      { signal: controller.signal },
    );
  });

  it('rejects a non-success response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(null, { status: 503 })));

    await expect(
      fetchNextCategoryPlacesPage({
        categorySlug: 'spa',
        page: 2,
        signal: new AbortController().signal,
      }),
    ).rejects.toThrow('Category places request failed with 503');
  });

  it('rejects JSON that contains backend-only fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            ...PAGE,
            items: [{ ...PAGE.items[0], summary: 'Не должно попасть в клиентский контракт' }],
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      ),
    );

    await expect(
      fetchNextCategoryPlacesPage({
        categorySlug: 'spa',
        page: 2,
        signal: new AbortController().signal,
      }),
    ).rejects.toThrow();
  });
});
