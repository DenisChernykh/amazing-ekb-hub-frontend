import type { ApiClient, HttpResult, paths } from '@/shared/api';

/**
 * Низкоуровневый HTTP client material-модуля.
 */
export type MaterialHttpClient = Pick<ApiClient, 'GET'>;

/**
 * DTO path-параметров загрузки материалов места.
 */
export type GetPlaceMaterialsPathParams = NonNullable<
  paths['/places/{placeId}/materials']['get']['parameters']['path']
>;

/**
 * DTO query-параметров загрузки материалов места.
 */
export type GetPlaceMaterialsQueryDto = NonNullable<
  paths['/places/{placeId}/materials']['get']['parameters']['query']
>;

/**
 * DTO transport-параметров загрузки материалов места.
 */
export type GetPlaceMaterialsRequestParams = {
  path: GetPlaceMaterialsPathParams;
  query: GetPlaceMaterialsQueryDto;
};

/**
 * Сырой HTTP-результат загрузки материалов места.
 *
 * @remarks
 * Payload на transport-границе считается недоверенным и валидируется выше.
 */
export type GetPlaceMaterialsHttpResult = HttpResult<unknown, unknown>;
