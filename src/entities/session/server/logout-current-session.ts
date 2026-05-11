import 'server-only';

import { logout } from '@/shared/api/generated/auth/auth';
import { isGeneratedApiError } from '@/shared/lib/api/is-generated-api-error';
import { buildBackendCookieHeader, clearSessionCookies } from './session-cookies';

/**
 * Просит backend отозвать refresh cookie и очищает локальные auth cookies.
 *
 * @remarks
 * Функция рассчитана на будущие Server Actions / Route Handlers. Ошибка `401`
 * при logout не блокирует локальную очистку cookies.
 */
export async function logoutCurrentSession(): Promise<void> {
  const cookieHeader = await buildBackendCookieHeader();

  if (cookieHeader) {
    try {
      await logout({
        cache: 'no-store',
        headers: {
          Cookie: cookieHeader,
        },
      });
    } catch (error) {
      const isExpectedLogoutFailure = isGeneratedApiError(error) && error.status === 401;

      if (!isExpectedLogoutFailure) {
        await clearSessionCookies();
        throw error;
      }
    }
  }

  await clearSessionCookies();
}
