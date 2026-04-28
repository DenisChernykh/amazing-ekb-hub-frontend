import type { AuthMeResponse } from '@/shared/api/generated/model';
import { getPermissionsForRole } from './permissions';
import type { SessionUser } from './types';

/**
 * Преобразует backend `AuthMeResponse` в безопасную frontend session model.
 *
 * @param response - Профиль текущего пользователя из `/auth/me`.
 * @returns Session-модель без токенов и transport-деталей.
 */
export function mapAuthMeResponseToSessionUser(response: AuthMeResponse): SessionUser {
  return {
    id: response.id,
    email: response.email,
    role: response.role,
    permissions: getPermissionsForRole(response.role),
  };
}
