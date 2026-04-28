/**
 * Тип штатного auth/access отказа от backend.
 */
export type AuthAccessFailureKind = 'unauthenticated' | 'forbidden';

/**
 * Это хелпер для проверки HTTP 401.
 *
 * @param status - HTTP status из generated API error.
 * @returns `true`, если status означает отсутствие валидной аутентификации.
 */
export function isUnauthorizedStatus(status: number | undefined): boolean {
  return status === 401;
}

/**
 * Это хелпер для проверки HTTP 403.
 *
 * @param status - HTTP status из generated API error.
 * @returns `true`, если status означает нехватку роли или permission.
 */
export function isForbiddenStatus(status: number | undefined): boolean {
  return status === 403;
}

/**
 * Это хелпер для нормализации `401/403` в policy-friendly значение.
 *
 * @param status - HTTP status из generated API error.
 * @returns Тип auth/access отказа или `null` для остальных статусов.
 */
export function getAuthAccessFailureKind(status: number | undefined): AuthAccessFailureKind | null {
  if (isUnauthorizedStatus(status)) {
    return 'unauthenticated';
  }

  if (isForbiddenStatus(status)) {
    return 'forbidden';
  }

  return null;
}
