import { fetchPublicPlaceList } from '@/entities/place/api/fetch-public-place-list';
import { normalizeHomeSearchParams, type HomeQuery } from '../lib/normalize-home-search-params';

type RawSearchParams = Record<string, string | string[] | undefined>;

type HomePlaceCard = {
  id: string;
  title: string;
  summary: string;
  tags: string[];
  category: 'pools' | 'spa' | 'cafe' | 'hotels' | 'workshops';
};
/**
 * View model домашней страницы каталога мест.
 *
 * @remarks
 * Модель хранит уже нормализованный `query` и одну из контролируемых веток
 * результата, чтобы UI не зависел от transport-деталей API.
 */
export type HomePageModel =
  | {
      kind: 'ready';
      query: HomeQuery;
      items: HomePlaceCard[];
      pagination: {
        page: number;
        pageSize: number;
        total: number;
        pageCount: number;
      };
    }
  | {
      kind: 'bad_request';
      query: HomeQuery;
      title: string;
      issues: Array<{ path?: string; message: string }>;
      requestId?: string;
    }
  | {
      kind: 'contract_error';
      query: HomeQuery;
      message: string;
    }
  | {
      kind: 'unexpected_error';
      query: HomeQuery;
      message: string;
    };
/**
 * Собирает server-side данные для домашней страницы каталога мест.
 *
 * @param rawSearchParams - Сырые query-параметры из route entrypoint.
 * @returns Готовую модель страницы для рендера success- или error-state.
 */
export async function getHomePageData(rawSearchParams: RawSearchParams): Promise<HomePageModel> {
  const query = normalizeHomeSearchParams(rawSearchParams);
  const result = await fetchPublicPlaceList(query);

  switch (result.kind) {
    case 'success':
      return {
        kind: 'ready',
        query,
        items: result.data.items.map((item) => ({
          id: item.id,
          title: item.title,
          summary: item.summary,
          tags: item.tags,
          category: item.category,
        })),
        pagination: {
          page: result.data.page,
          pageSize: result.data.pageSize,
          total: result.data.total,
          pageCount: Math.ceil(result.data.total / result.data.pageSize),
        },
      };

    case 'bad_request':
      return {
        kind: 'bad_request',
        query,
        title: result.data.error.message,
        issues: result.data.error.details?.issues ?? [],
        requestId: result.data.meta?.requestId,
      };

    case 'contract_error':
      return {
        kind: 'contract_error',
        query,
        message: result.message,
      };

    case 'unexpected_error':
      return {
        kind: 'unexpected_error',
        query,
        message: result.message,
      };
  }
}
