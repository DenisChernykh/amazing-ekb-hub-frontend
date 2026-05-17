import 'server-only';

import {
  createAnonymousSession,
  createAuthenticatedSession,
  mapAuthMeResponseToSessionUser,
  type SessionState,
} from '@/entities/session/model';
import { getCurrentUser } from '@/shared/api/generated/auth/auth';
import { isGeneratedApiError } from '@/shared/lib/api/is-generated-api-error';
import { buildBackendCookieHeader } from './session-cookies';

/**
 * Возвращает текущую безопасную session model для server-side рендера.
 *
 * @remarks
 * При отсутствующей или невалидной auth cookie возвращается anonymous session.
 * Cookies здесь не очищаются, потому что Server Components не должны менять
 * response cookies.
 *
 * @returns Нормализованное состояние текущей сессии.
 */
export async function getCurrentSession(): Promise<SessionState> {
  const cookieHeader = await buildBackendCookieHeader();

  if (!cookieHeader) {
    return createAnonymousSession();
  }

  try {
    const response = await getCurrentUser({
      cache: 'no-store',
      headers: {
        Cookie: cookieHeader,
      },
    });

    return createAuthenticatedSession(mapAuthMeResponseToSessionUser(response.data));
  } catch (error) {
    if (isGeneratedApiError(error) && error.status === 401) {
      return createAnonymousSession();
    }

    return createAnonymousSession();
  }
}
