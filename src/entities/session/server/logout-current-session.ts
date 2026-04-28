import 'server-only';

import { logout } from '@/shared/api/generated/auth/auth';
import { isGeneratedApiError } from '@/shared/lib/api/is-generated-api-error';
import { clearSessionCookies, getRefreshTokenCookie } from './session-cookies';

/**
 * Отзывает refresh token на backend и очищает локальные auth cookies.
 *
 * @remarks
 * Функция рассчитана на будущие Server Actions / Route Handlers. Ошибки `400`
 * и `401` при logout не блокируют локальную очистку cookies.
 */
export async function logoutCurrentSession(): Promise<void> {
  const refreshToken = await getRefreshTokenCookie();

  if (refreshToken) {
    try {
      await logout(
        { refreshToken },
        {
          cache: 'no-store',
        },
      );
    } catch (error) {
      const isExpectedLogoutFailure =
        isGeneratedApiError(error) && (error.status === 400 || error.status === 401);

      if (!isExpectedLogoutFailure) {
        await clearSessionCookies();
        throw error;
      }
    }
  }

  await clearSessionCookies();
}
