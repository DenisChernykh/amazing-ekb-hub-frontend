import type { ApiClient, HttpResult, paths } from '@/shared/api';

/**
 * Низкоуровневый HTTP client place-сущности.
 */
export type PlaceHttpClient = Pick<ApiClient, 'GET'>;

/**
 * DTO query-параметров загрузки списка мест.
 */
export type GetPlaceListQueryDto = NonNullable<paths['/places']['get']['parameters']['query']>;

/**
 * DTO path-параметров загрузки detail-страницы места.
 */
export type GetPlaceDetailPathParams = NonNullable<
  paths['/places/{placeId}']['get']['parameters']['path']
>;

/**
 * Сырой HTTP-результат загрузки списка мест.
 *
 * @remarks
 * Payload на transport-границе считается недоверенным и валидируется выше.
 */
export type GetPlaceListHttpResult = HttpResult<unknown, unknown>;

/**
 * Сырой HTTP-результат загрузки detail-страницы места.
 *
 * @remarks
 * Payload на transport-границе считается недоверенным и валидируется выше.
 */
export type GetPlaceDetailHttpResult = HttpResult<unknown, unknown>;
