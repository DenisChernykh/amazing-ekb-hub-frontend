import type { AuthPermission, SessionRole, SessionState, SessionUser } from './types';

/**
 * Значение, по которому можно проверять роль или permission.
 */
type AuthSubject = SessionState | SessionUser | null | undefined;

/**
 * Это хелпер для извлечения пользователя из разных session subject форм.
 *
 * @param subject - Session state, пользователь или пустое значение.
 * @returns Пользователь или `null`, если subject не авторизован.
 */
function resolveSessionUser(subject: AuthSubject): SessionUser | null {
  if (!subject) {
    return null;
  }

  if ('status' in subject) {
    return subject.user;
  }

  return subject;
}

/**
 * Это хелпер для создания anonymous session state.
 *
 * @returns Нормализованное состояние гостя.
 */
export function createAnonymousSession(): SessionState {
  return {
    status: 'anonymous',
    user: null,
  };
}

/**
 * Это хелпер для создания authenticated session state.
 *
 * @param user - Безопасная модель текущего пользователя.
 * @returns Нормализованное состояние авторизованного пользователя.
 */
export function createAuthenticatedSession(user: SessionUser): SessionState {
  return {
    status: 'authenticated',
    user,
  };
}

/**
 * Это хелпер для проверки конкретной роли у session subject.
 *
 * @param subject - Session state, пользователь или пустое значение.
 * @param role - Роль, которую нужно проверить.
 * @returns `true`, если пользователь авторизован и имеет указанную роль.
 */
export function hasRole(subject: AuthSubject, role: SessionRole): boolean {
  return resolveSessionUser(subject)?.role === role;
}

/**
 * Это хелпер для проверки хотя бы одной роли у session subject.
 *
 * @param subject - Session state, пользователь или пустое значение.
 * @param roles - Список допустимых ролей.
 * @returns `true`, если пользователь имеет одну из ролей.
 */
export function hasAnyRole(subject: AuthSubject, roles: readonly SessionRole[]): boolean {
  const user = resolveSessionUser(subject);

  return Boolean(user && roles.includes(user.role));
}

/**
 * Это хелпер для проверки конкретного permission у session subject.
 *
 * @param subject - Session state, пользователь или пустое значение.
 * @param permission - Permission, который нужно проверить.
 * @returns `true`, если пользователь авторизован и имеет permission.
 */
export function hasPermission(subject: AuthSubject, permission: AuthPermission): boolean {
  return Boolean(resolveSessionUser(subject)?.permissions.includes(permission));
}

/**
 * Это хелпер для проверки хотя бы одного permission у session subject.
 *
 * @param subject - Session state, пользователь или пустое значение.
 * @param permissions - Список permissions, из которых достаточно любого.
 * @returns `true`, если пользователь имеет хотя бы один permission.
 */
export function hasAnyPermission(
  subject: AuthSubject,
  permissions: readonly AuthPermission[],
): boolean {
  const user = resolveSessionUser(subject);

  return Boolean(user && permissions.some((permission) => user.permissions.includes(permission)));
}
