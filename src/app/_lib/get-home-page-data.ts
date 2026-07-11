import { mapPlaceSummaryToCardModel } from '@/entities/place';
import { fetchPublicPlaceCategories } from '@/entities/place/api/fetch-public-place-categories';
import { fetchPublicPlaceList } from '@/entities/place/api/fetch-public-place-list';
import { buildCatalogControlsHref } from '@/features/catalog-controls';
import type { ListPlacesParams } from '@/shared/api/generated/operation/listPlacesParams';
import type { PlacesCatalogModel } from '@/widgets/places-catalog';
import { normalizeHomeSearchParams, type HomeQuery } from './normalize-home-search-params';

type RawSearchParams = Record<string, string | string[] | undefined>;
type HomePageIssue = { path?: string; message: string };

export type HomePageModel =
  | {
      kind: 'ready';
      catalog: PlacesCatalogModel;
    }
  | {
      kind: 'bad_request';
      query: HomeQuery;
      title: string;
      issues: HomePageIssue[];
      requestId?: string;
    }
  | {
      kind: 'unexpected_error';
      query: HomeQuery;
      message: string;
    };

/**
 * Собирает server-side данные главной страницы каталога.
 *
 * @param rawSearchParams - Сырые query-параметры route entrypoint.
 * @returns Модель success- или error-состояния страницы.
 */
export async function getHomePageData(rawSearchParams: RawSearchParams): Promise<HomePageModel> {
  const query = normalizeHomeSearchParams(rawSearchParams);
  const categoriesPromise = fetchPublicPlaceCategories();
  const unfilteredListPromise = query.category
    ? undefined
    : fetchPublicPlaceList(toListPlacesParams(query, undefined));
  const categoriesResult = await categoriesPromise;

  if (categoriesResult.kind === 'unexpected_error') {
    return {
      kind: 'unexpected_error',
      query,
      message: categoriesResult.message,
    };
  }

  const categories = categoriesResult.data.items;
  const activeCategory = query.category
    ? categories.find((category) => category.slug === query.category)
    : undefined;
  const result = await (unfilteredListPromise ??
    fetchPublicPlaceList(toListPlacesParams(query, activeCategory?.id)));

  switch (result.kind) {
    case 'success': {
      const pageCount = Math.max(1, Math.ceil(result.data.total / result.data.pageSize));

      return {
        kind: 'ready',
        catalog: {
          items: result.data.items.map(mapPlaceSummaryToCardModel),
          categories,
          filters: {
            search: query.search,
            activeCategorySlug: activeCategory?.slug,
            resetHref: buildCatalogControlsHref({
              currentSearchParams: buildRawSearchParamsString(rawSearchParams),
              next: { reset: true },
            }),
            firstPageHref: buildCatalogControlsHref({
              currentSearchParams: buildRawSearchParamsString(rawSearchParams),
              next: { page: 'first' },
            }),
          },
          pagination: {
            page: result.data.page,
            pageCount,
            total: result.data.total,
          },
        },
      };
    }

    case 'bad_request':
      return {
        kind: 'bad_request',
        query,
        title: getValidationErrorTitle(result.data.message),
        issues: mapValidationMessagesToIssues(result.data.message),
      };

    case 'unexpected_error':
      return {
        kind: 'unexpected_error',
        query,
        message: result.message,
      };
  }
}

/**
 * Это хелпер для заголовка bad request state из NestJS error response.
 *
 * @param message - Backend error message.
 * @returns Текст заголовка.
 */
function getValidationErrorTitle(message: string | string[]): string {
  return Array.isArray(message) ? 'Некорректные параметры запроса.' : message;
}

/**
 * Это хелпер для адаптации NestJS validation messages в UI issues.
 *
 * @param message - Backend error message.
 * @returns Список сообщений для error state.
 */
function mapValidationMessagesToIssues(message: string | string[]): HomePageIssue[] {
  return (Array.isArray(message) ? message : [message]).map((issueMessage) => ({
    message: issueMessage,
  }));
}

/**
 * Это хелпер. Преобразует сырые route searchParams обратно в URLSearchParams string.
 *
 * @param rawSearchParams - Сырые query-параметры route entrypoint.
 * @returns Строка query-параметров для URL helper.
 */
function buildRawSearchParamsString(rawSearchParams: RawSearchParams): string {
  const params = new URLSearchParams();

  Object.entries(rawSearchParams).forEach(([key, value]) => {
    if (value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }

    params.set(key, value);
  });

  return params.toString();
}

/**
 * Это хелпер. Преобразует публичный query главной страницы в API query списка мест.
 *
 * @param query - Нормализованный route query с category slug.
 * @param categoryId - Backend-идентификатор найденной категории.
 * @returns Query для generated `/places` client.
 */
function toListPlacesParams(query: HomeQuery, categoryId: string | undefined): ListPlacesParams {
  return {
    page: query.page,
    pageSize: query.pageSize,
    sort: query.sort,
    ...(query.search ? { search: query.search } : {}),
    ...(categoryId ? { categoryId } : {}),
  };
}
