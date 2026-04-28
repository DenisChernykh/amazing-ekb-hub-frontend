import 'server-only';

import type { AuthTokensResponse } from '@/shared/api/generated/operation/authTokensResponse';

/**
 * Это хелпер для сборки Bearer-заголовка авторизации.
 *
 * @param accessToken - Access token из HttpOnly cookie или login response.
 * @param tokenType - Тип токена из backend contract.
 * @returns Значение HTTP-заголовка `Authorization`.
 */
export function buildAuthorizationHeader(accessToken: string, tokenType = 'Bearer'): string {
  return `${tokenType} ${accessToken}`;
}

/**
 * Это хелпер для сборки `Authorization` из ответа `/auth/login`.
 *
 * @param tokens - Пара токенов backend auth contract.
 * @returns Значение HTTP-заголовка `Authorization`.
 */
export function buildAuthorizationHeaderFromTokens(tokens: AuthTokensResponse): string {
  return buildAuthorizationHeader(tokens.accessToken, tokens.tokenType || 'Bearer');
}
