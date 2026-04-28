import type { AuthPermission, SessionRole } from './types';

/**
 * Словарь permission-значений, доступных клиентскому UI.
 */
export const AUTH_PERMISSIONS = {
  ADMIN_ACCESS: 'admin:access',
  PLACES_MANAGE: 'places:manage',
  MATERIALS_MANAGE: 'materials:manage',
  FAVORITES_READ: 'favorites:read',
  FAVORITES_WRITE: 'favorites:write',
} as const satisfies Record<string, AuthPermission>;

/**
 * Карта роли к клиентским permissions.
 *
 * @remarks
 * Это единая точка расширения для будущих ролей. Если backend contract добавит
 * новую роль, `Record<SessionRole, ...>` потребует явно описать её права.
 */
export const ROLE_PERMISSIONS = {
  admin: [
    AUTH_PERMISSIONS.ADMIN_ACCESS,
    AUTH_PERMISSIONS.PLACES_MANAGE,
    AUTH_PERMISSIONS.MATERIALS_MANAGE,
    AUTH_PERMISSIONS.FAVORITES_READ,
    AUTH_PERMISSIONS.FAVORITES_WRITE,
  ],
  user: [AUTH_PERMISSIONS.FAVORITES_READ, AUTH_PERMISSIONS.FAVORITES_WRITE],
} as const satisfies Record<SessionRole, readonly AuthPermission[]>;

/**
 * Это хелпер для получения permissions по роли без мутации исходной карты.
 *
 * @param role - Роль текущего пользователя.
 * @returns Новый массив permissions для безопасной передачи в session model.
 */
export function getPermissionsForRole(role: SessionRole): AuthPermission[] {
  return [...ROLE_PERMISSIONS[role]];
}
