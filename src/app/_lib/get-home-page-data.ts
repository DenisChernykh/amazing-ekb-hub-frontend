import { mapPlaceSummaryToCardModel } from '@/entities/place';
import { fetchPublicPlaceCategories } from '@/entities/place/api/fetch-public-place-categories';
import { fetchPublicPlaceList } from '@/entities/place/api/fetch-public-place-list';
import { buildCatalogControlsHref } from '@/features/catalog-controls';
import { buildPlacesPaginationHref } from '@/features/places-pagination';
import type { PlacesCatalogModel } from '@/widgets/places-catalog';
import { normalizeHomeSearchParams, type CatalogUrlState } from './normalize-home-search-params';
import { resolveCatalogState } from './resolve-catalog-state';
import { serializeHomeSearchParams } from './serialize-home-search-params';
import { toListPlacesParams } from './to-list-places-params';

type RawSearchParams = Record<string, string | string[] | undefined>;
type HomePageIssue = { path?: string; message: string };

export type HomePageModel =
  | {
      kind: 'ready';
      catalog: PlacesCatalogModel;
    }
  | {
      kind: 'bad_request';
      urlState: CatalogUrlState;
      title: string;
      issues: HomePageIssue[];
      requestId?: string;
    }
  | {
      kind: 'unexpected_error';
      urlState: CatalogUrlState;
      message: string;
    };

/**
 * Собирает server-side данные главной страницы каталога.
 *
 * @param rawSearchParams - Сырые query-параметры route entrypoint.
 * @returns Модель success- или error-состояния страницы.
 */
export async function getHomePageData(rawSearchParams: RawSearchParams): Promise<HomePageModel> {
  const urlState = normalizeHomeSearchParams(rawSearchParams);
  const categoriesPromise = fetchPublicPlaceCategories();
  const unfilteredListPromise = urlState.category
    ? undefined
    : fetchPublicPlaceList(toListPlacesParams({ urlState }));
  const categoriesResult = await categoriesPromise;

  if (categoriesResult.kind === 'unexpected_error') {
    return {
      kind: 'unexpected_error',
      urlState,
      message: categoriesResult.message,
    };
  }

  const categories = categoriesResult.data.items;
  const resolvedState = resolveCatalogState(urlState, categories);
  const result = await (unfilteredListPromise ??
    fetchPublicPlaceList(toListPlacesParams(resolvedState)));

  switch (result.kind) {
    case 'success': {
      const pageCount = Math.max(1, Math.ceil(result.data.total / result.data.pageSize));
      const currentSearchParams = serializeHomeSearchParams(resolvedState);

      return {
        kind: 'ready',
        catalog: {
          results: {
            items: result.data.items.map(mapPlaceSummaryToCardModel),
            total: result.data.total,
          },
          controls: {
            categories,
            search: resolvedState.urlState.search,
            activeCategorySlug: resolvedState.urlState.category,
          },
          pagination: {
            page: resolvedState.urlState.page,
            pageCount,
          },
          links: {
            resetFilters: buildCatalogControlsHref({
              currentSearchParams,
              next: { reset: true },
            }),
            firstPage: buildPlacesPaginationHref({
              currentSearchParams,
              page: 1,
            }),
          },
          navigation: { currentSearchParams },
        },
      };
    }

    case 'bad_request':
      return {
        kind: 'bad_request',
        urlState: resolvedState.urlState,
        title: getValidationErrorTitle(result.data.message),
        issues: mapValidationMessagesToIssues(result.data.message),
      };

    case 'unexpected_error':
      return {
        kind: 'unexpected_error',
        urlState: resolvedState.urlState,
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
