import 'server-only';

import type { AuthTokensResponse } from '@/shared/api/generated/operation/authTokensResponse';
import { cookies } from 'next/headers';

const DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS = 15 * 60;
const DEFAULT_REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

/**
 * Имена HttpOnly cookies, в которых хранится backend token pair.
 */
export const SESSION_COOKIE_NAMES = {
  accessToken: 'aeh_access_token',
  refreshToken: 'aeh_refresh_token',
} as const;

/**
 * Это хелпер для сборки общих настроек auth cookie.
 *
 * @param maxAge - TTL cookie в секундах.
 * @returns Настройки cookie для хранения backend token.
 */
function buildSessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

/**
 * Это хелпер для перевода компактной TTL-строки backend в секунды.
 *
 * @param duration - Значение вроде `15m`, `1h` или `7d`.
 * @param fallbackSeconds - Значение, которое используется для неизвестного формата.
 * @returns TTL в секундах.
 */
export function parseDurationToSeconds(
  duration: string | undefined,
  fallbackSeconds: number,
): number {
  if (!duration) {
    return fallbackSeconds;
  }

  const match = /^(\d+)([smhd])$/.exec(duration);

  if (!match) {
    return fallbackSeconds;
  }

  const amount = Number(match[1]);
  const unit = match[2];

  if (!Number.isFinite(amount) || amount <= 0) {
    return fallbackSeconds;
  }

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 24 * 60 * 60;
    default:
      return fallbackSeconds;
  }
}

/**
 * Возвращает access token из HttpOnly cookie.
 *
 * @returns Access token или `undefined`, если сессии нет.
 */
export async function getAccessTokenCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();

  return cookieStore.get(SESSION_COOKIE_NAMES.accessToken)?.value;
}

/**
 * Возвращает refresh token из HttpOnly cookie.
 *
 * @returns Refresh token или `undefined`, если сессии нет.
 */
export async function getRefreshTokenCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();

  return cookieStore.get(SESSION_COOKIE_NAMES.refreshToken)?.value;
}

/**
 * Сохраняет backend token pair в HttpOnly cookies.
 *
 * @remarks
 * Функция должна вызываться только из Server Action или Route Handler, где Next.js
 * разрешает менять cookies.
 *
 * @param tokens - Токены, полученные от `/auth/login` или `/auth/refresh`.
 */
export async function setSessionCookies(tokens: AuthTokensResponse): Promise<void> {
  const cookieStore = await cookies();
  const accessMaxAge = parseDurationToSeconds(
    tokens.accessExpiresIn,
    DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS,
  );

  cookieStore.set(
    SESSION_COOKIE_NAMES.accessToken,
    tokens.accessToken,
    buildSessionCookieOptions(accessMaxAge),
  );
  cookieStore.set(
    SESSION_COOKIE_NAMES.refreshToken,
    tokens.refreshToken,
    buildSessionCookieOptions(DEFAULT_REFRESH_TOKEN_MAX_AGE_SECONDS),
  );
}

/**
 * Очищает HttpOnly cookies пользовательской сессии.
 *
 * @remarks
 * Функция должна вызываться только из Server Action или Route Handler, где Next.js
 * разрешает менять cookies.
 */
export async function clearSessionCookies(): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.delete(SESSION_COOKIE_NAMES.accessToken);
  cookieStore.delete(SESSION_COOKIE_NAMES.refreshToken);
}
