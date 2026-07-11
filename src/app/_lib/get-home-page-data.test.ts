import { fetchPublicPlaceCategories } from '@/entities/place/api/fetch-public-place-categories';
import { fetchPublicPlaceList } from '@/entities/place/api/fetch-public-place-list';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getHomePageData } from './get-home-page-data';

vi.mock('@/entities/place/api/fetch-public-place-categories', () => ({
  fetchPublicPlaceCategories: vi.fn(),
}));

vi.mock('@/entities/place/api/fetch-public-place-list', () => ({
  fetchPublicPlaceList: vi.fn(),
}));

const fetchPublicPlaceCategoriesMock = vi.mocked(fetchPublicPlaceCategories);
const fetchPublicPlaceListMock = vi.mocked(fetchPublicPlaceList);

const FAMILY_SPA_CATEGORY = {
  id: 'category_family_spa',
  slug: 'family-spa',
  title: 'Family SPA',
  badgeBackgroundColor: '#faf0ed',
};

const EMPTY_PLACE_LIST = {
  kind: 'success' as const,
  data: {
    items: [],
    page: 1,
    pageSize: 20,
    total: 0,
  },
};

function createDeferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}

describe('getHomePageData', () => {
  beforeEach(() => {
    fetchPublicPlaceCategoriesMock.mockReset();
    fetchPublicPlaceListMock.mockReset();
  });

  it('starts categories and places before either request resolves without category filter', async () => {
    const categoriesDeferred =
      createDeferred<Awaited<ReturnType<typeof fetchPublicPlaceCategories>>>();
    const listDeferred = createDeferred<Awaited<ReturnType<typeof fetchPublicPlaceList>>>();
    fetchPublicPlaceCategoriesMock.mockReturnValueOnce(categoriesDeferred.promise);
    fetchPublicPlaceListMock.mockReturnValueOnce(listDeferred.promise);

    const homePageDataPromise = getHomePageData({});

    expect(fetchPublicPlaceCategoriesMock).toHaveBeenCalledOnce();
    expect(fetchPublicPlaceListMock).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      sort: 'popular',
    });

    categoriesDeferred.resolve({
      kind: 'success',
      data: { items: [FAMILY_SPA_CATEGORY] },
    });
    listDeferred.resolve(EMPTY_PLACE_LIST);

    await expect(homePageDataPromise).resolves.toMatchObject({ kind: 'ready' });
  });

  it('maps public category slug to backend categoryId before loading places', async () => {
    const categoriesDeferred =
      createDeferred<Awaited<ReturnType<typeof fetchPublicPlaceCategories>>>();
    fetchPublicPlaceCategoriesMock.mockReturnValueOnce(categoriesDeferred.promise);
    fetchPublicPlaceListMock.mockResolvedValueOnce(EMPTY_PLACE_LIST);

    const homePageDataPromise = getHomePageData({ category: 'family-spa' });

    expect(fetchPublicPlaceCategoriesMock).toHaveBeenCalledOnce();
    expect(fetchPublicPlaceListMock).not.toHaveBeenCalled();

    categoriesDeferred.resolve({
      kind: 'success',
      data: { items: [FAMILY_SPA_CATEGORY] },
    });

    await expect(homePageDataPromise).resolves.toMatchObject({
      kind: 'ready',
      catalog: {
        categories: [FAMILY_SPA_CATEGORY],
        filters: {
          activeCategorySlug: 'family-spa',
        },
      },
    });

    expect(fetchPublicPlaceListMock).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      sort: 'popular',
      categoryId: 'category_family_spa',
    });
  });

  it('ignores well-formed category slug when it is absent from category dictionary', async () => {
    fetchPublicPlaceCategoriesMock.mockResolvedValueOnce({
      kind: 'success',
      data: { items: [FAMILY_SPA_CATEGORY] },
    });
    fetchPublicPlaceListMock.mockResolvedValueOnce(EMPTY_PLACE_LIST);

    await expect(getHomePageData({ category: 'unknown-spa' })).resolves.toMatchObject({
      kind: 'ready',
      catalog: {
        filters: {
          activeCategorySlug: undefined,
        },
      },
    });

    expect(fetchPublicPlaceListMock).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      sort: 'popular',
    });
  });

  it('returns category error without waiting for the parallel places request', async () => {
    const listDeferred = createDeferred<Awaited<ReturnType<typeof fetchPublicPlaceList>>>();
    fetchPublicPlaceCategoriesMock.mockResolvedValueOnce({
      kind: 'unexpected_error',
      message: 'Не удалось загрузить категории мест.',
    });
    fetchPublicPlaceListMock.mockReturnValueOnce(listDeferred.promise);

    await expect(getHomePageData({})).resolves.toEqual({
      kind: 'unexpected_error',
      query: {
        page: 1,
        pageSize: 20,
        sort: 'popular',
      },
      message: 'Не удалось загрузить категории мест.',
    });

    expect(fetchPublicPlaceListMock).toHaveBeenCalledOnce();
  });

  it('preserves bad request state from the places request', async () => {
    fetchPublicPlaceCategoriesMock.mockResolvedValueOnce({
      kind: 'success',
      data: { items: [FAMILY_SPA_CATEGORY] },
    });
    fetchPublicPlaceListMock.mockResolvedValueOnce({
      kind: 'bad_request',
      data: {
        statusCode: 400,
        message: ['page must be a positive number'],
        error: 'Bad Request',
      },
    });

    await expect(getHomePageData({})).resolves.toEqual({
      kind: 'bad_request',
      query: {
        page: 1,
        pageSize: 20,
        sort: 'popular',
      },
      title: 'Некорректные параметры запроса.',
      issues: [{ message: 'page must be a positive number' }],
    });
  });

  it('preserves unexpected error state from the places request', async () => {
    fetchPublicPlaceCategoriesMock.mockResolvedValueOnce({
      kind: 'success',
      data: { items: [FAMILY_SPA_CATEGORY] },
    });
    fetchPublicPlaceListMock.mockResolvedValueOnce({
      kind: 'unexpected_error',
      message: 'Не удалось загрузить список мест.',
    });

    await expect(getHomePageData({})).resolves.toEqual({
      kind: 'unexpected_error',
      query: {
        page: 1,
        pageSize: 20,
        sort: 'popular',
      },
      message: 'Не удалось загрузить список мест.',
    });
  });
});
