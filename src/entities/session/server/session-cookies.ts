import 'server-only';

import { cookies } from 'next/headers';

type SetCookieHeaders = Headers & {
  getSetCookie?: () => string[];
};

const SESSION_COOKIE_NAME_VALUES = ['aeh_access_token', 'aeh_refresh_token'] as const;
const SESSION_COOKIE_NAME_SET = new Set<string>(SESSION_COOKIE_NAME_VALUES);

type BackendCookieOptions = {
  httpOnly?: boolean;
  secure?: boolean;
  path?: string;
  sameSite?: 'lax' | 'strict' | 'none';
  maxAge?: number;
  expires?: Date;
};

type ParsedBackendSetCookie = {
  name: string;
  value: string;
  options: BackendCookieOptions;
};

/**
 * Имена HttpOnly cookies, в которых хранится backend token pair.
 */
export const SESSION_COOKIE_NAMES = {
  accessToken: 'aeh_access_token',
  refreshToken: 'aeh_refresh_token',
} as const;

/**
 * Это хелпер для сборки Cookie header, который backend auth guard читает
 * на server-side запросах.
 *
 * @returns Cookie header или `undefined`, если локальной сессии нет.
 */
export async function buildBackendCookieHeader(): Promise<string | undefined> {
  const cookieStore = await cookies();
  const cookiePairs = SESSION_COOKIE_NAME_VALUES.flatMap((name) => {
    const value = cookieStore.get(name)?.value;

    return value ? [`${name}=${value}`] : [];
  });

  return cookiePairs.length > 0 ? cookiePairs.join('; ') : undefined;
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
 * Применяет backend-owned `Set-Cookie` headers к Next.js response cookies.
 *
 * @remarks
 * Функция должна вызываться только из Server Action или Route Handler, где Next.js
 * разрешает менять cookies.
 *
 * @param headers - Response headers от backend auth endpoint.
 */
export async function applyBackendSessionCookies(headers: Headers): Promise<void> {
  const cookieStore = await cookies();

  for (const setCookieHeader of getSetCookieHeaders(headers)) {
    const parsedCookie = parseBackendSetCookie(setCookieHeader);

    if (!parsedCookie || !SESSION_COOKIE_NAME_SET.has(parsedCookie.name)) {
      continue;
    }

    if (shouldDeleteCookie(parsedCookie)) {
      cookieStore.delete(parsedCookie.name);
      continue;
    }

    cookieStore.set(parsedCookie.name, parsedCookie.value, parsedCookie.options);
  }
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

/**
 * Это хелпер для чтения всех `Set-Cookie` headers из Fetch response.
 *
 * @param headers - Fetch response headers.
 * @returns Отдельные `Set-Cookie` строки.
 */
function getSetCookieHeaders(headers: Headers): string[] {
  const getSetCookie = (headers as SetCookieHeaders).getSetCookie;

  if (typeof getSetCookie === 'function') {
    return getSetCookie.call(headers);
  }

  const setCookieHeader = headers.get('set-cookie');

  return setCookieHeader ? splitCombinedSetCookieHeader(setCookieHeader) : [];
}

/**
 * Это хелпер для разделения combined `Set-Cookie` header.
 *
 * @param header - Combined header, если runtime склеил несколько cookies.
 * @returns Отдельные cookie headers.
 */
function splitCombinedSetCookieHeader(header: string): string[] {
  return header.split(/,(?=\s*[^;,\s]+=)/).map((cookie) => cookie.trim());
}

/**
 * Это хелпер для разбора одной backend auth cookie.
 *
 * @param setCookieHeader - Сырая строка `Set-Cookie`.
 * @returns Имя, значение и поддержанные cookie options.
 */
function parseBackendSetCookie(setCookieHeader: string): ParsedBackendSetCookie | undefined {
  const [nameValuePair, ...attributes] = setCookieHeader.split(';').map((part) => part.trim());
  const separatorIndex = nameValuePair.indexOf('=');

  if (separatorIndex <= 0) {
    return undefined;
  }

  const parsedCookie: ParsedBackendSetCookie = {
    name: nameValuePair.slice(0, separatorIndex),
    value: nameValuePair.slice(separatorIndex + 1),
    options: {},
  };

  for (const attribute of attributes) {
    applyCookieAttribute(parsedCookie.options, attribute);
  }

  return parsedCookie;
}

/**
 * Это хелпер для переноса поддержанных атрибутов cookie.
 *
 * @param options - Накопленные Next.js cookie options.
 * @param attribute - Один атрибут из `Set-Cookie`.
 */
function applyCookieAttribute(options: BackendCookieOptions, attribute: string): void {
  const [rawName, ...rawValueParts] = attribute.split('=');
  const name = rawName.toLowerCase();
  const value = rawValueParts.join('=');

  if (name === 'httponly') {
    options.httpOnly = true;
    return;
  }

  if (name === 'secure') {
    options.secure = true;
    return;
  }

  if (name === 'path' && value) {
    options.path = value;
    return;
  }

  if (name === 'samesite') {
    options.sameSite = parseSameSite(value);
    return;
  }

  if (name === 'max-age') {
    const maxAge = Number(value);

    if (Number.isFinite(maxAge)) {
      options.maxAge = maxAge;
    }

    return;
  }

  if (name === 'expires') {
    const expires = new Date(value);

    if (!Number.isNaN(expires.getTime())) {
      options.expires = expires;
    }
  }
}

/**
 * Это хелпер для нормализации SameSite attribute.
 *
 * @param value - Raw SameSite value.
 * @returns Next.js-compatible SameSite value.
 */
function parseSameSite(value: string): BackendCookieOptions['sameSite'] {
  const normalizedValue = value.toLowerCase();

  if (normalizedValue === 'lax' || normalizedValue === 'strict' || normalizedValue === 'none') {
    return normalizedValue;
  }

  return undefined;
}

/**
 * Это хелпер для определения clearing cookie из backend response.
 *
 * @param parsedCookie - Разобранная backend cookie.
 * @returns `true`, если cookie нужно удалить локально.
 */
function shouldDeleteCookie(parsedCookie: ParsedBackendSetCookie): boolean {
  const expiresAt = parsedCookie.options.expires?.getTime();

  return (
    parsedCookie.value.length === 0 ||
    parsedCookie.options.maxAge === 0 ||
    (typeof expiresAt === 'number' && expiresAt <= Date.now())
  );
}
