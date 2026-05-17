import { mapPlaceSummaryToCardModel } from '@/entities/place';
import { fetchPublicPlaceList } from '@/entities/place/api/fetch-public-place-list';
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
  const result = await fetchPublicPlaceList(query);

  switch (result.kind) {
    case 'success': {
      const pageCount = Math.max(1, Math.ceil(result.data.total / result.data.pageSize));

      return {
        kind: 'ready',
        catalog: {
          items: result.data.items.map(mapPlaceSummaryToCardModel),
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
