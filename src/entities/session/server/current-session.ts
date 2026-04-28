import 'server-only';

import {
  createAnonymousSession,
  createAuthenticatedSession,
  mapAuthMeResponseToSessionUser,
  type SessionState,
} from '@/entities/session/model';
import { getCurrentUser } from '@/shared/api/generated/auth/auth';
import { isGeneratedApiError } from '@/shared/lib/api/is-generated-api-error';
import { buildAuthorizationHeader } from './authorization-header';
import { getAccessTokenCookie } from './session-cookies';

/**
 * Возвращает текущую безопасную session model для server-side рендера.
 *
 * @remarks
 * При отсутствующем или невалидном access token возвращается anonymous session.
 * Cookies здесь не очищаются, потому что Server Components не должны менять
 * response cookies.
 *
 * @returns Нормализованное состояние текущей сессии.
 */
export async function getCurrentSession(): Promise<SessionState> {
  const accessToken = await getAccessTokenCookie();

  if (!accessToken) {
    return createAnonymousSession();
  }

  try {
    const response = await getCurrentUser({
      cache: 'no-store',
      headers: {
        Authorization: buildAuthorizationHeader(accessToken),
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
