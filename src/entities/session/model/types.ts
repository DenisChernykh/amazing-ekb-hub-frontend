import type { Role } from '@/shared/api/generated/model';

/**
 * Роль пользователя в frontend session model.
 *
 * @remarks
 * Тип связан с generated API contract, поэтому добавление backend-роли заставит
 * расширить role/permission map на этапе typecheck.
 */
export type SessionRole = Role;

/**
 * Клиентское permission-значение для UI-gating.
 *
 * @remarks
 * Permission не является security boundary. Настоящая авторизация остаётся
 * на backend, а frontend использует эти значения только для отображения UI.
 */
export type AuthPermission =
  | 'admin:access'
  | 'places:manage'
  | 'materials:manage'
  | 'favorites:read'
  | 'favorites:write';

/**
 * Безопасная модель текущего пользователя для React-клиента.
 *
 * @remarks
 * Токены и другие чувствительные transport-данные в эту модель не попадают.
 */
export interface SessionUser {
  id: string;
  email: string;
  role: SessionRole;
  permissions: AuthPermission[];
}

/**
 * Нормализованное состояние пользовательской сессии.
 */
export type SessionState =
  | {
      status: 'anonymous';
      user: null;
    }
  | {
      status: 'authenticated';
      user: SessionUser;
    };
