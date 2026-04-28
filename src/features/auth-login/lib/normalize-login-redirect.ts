/**
 * Redirect по умолчанию после успешного входа.
 */
export const LOGIN_DEFAULT_REDIRECT = '/';

/**
 * Это хелпер для нормализации `redirectTo` в login flow.
 *
 * @remarks
 * Разрешены только внутренние пути приложения. Внешние URL, protocol-relative URL
 * и сам `/login` отбрасываются, чтобы не получить open redirect или redirect loop.
 *
 * @param value - Значение query-параметра или поля формы `redirectTo`.
 * @returns Безопасный внутренний путь.
 */
export function normalizeLoginRedirect(value: string | string[] | undefined): string {
  const rawValue = Array.isArray(value) ? value[0] : value;

  if (!rawValue || !rawValue.startsWith('/') || rawValue.startsWith('//')) {
    return LOGIN_DEFAULT_REDIRECT;
  }

  try {
    const parsedUrl = new URL(rawValue, 'http://amazing-ekb.local');
    const normalizedPath = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;

    if (parsedUrl.pathname === '/login' || parsedUrl.pathname.startsWith('/login/')) {
      return LOGIN_DEFAULT_REDIRECT;
    }

    return normalizedPath;
  } catch {
    return LOGIN_DEFAULT_REDIRECT;
  }
}
