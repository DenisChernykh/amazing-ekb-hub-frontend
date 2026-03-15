import 'server-only';

import { API_BASE_PATH } from '@/shared/config/api';
import { headers } from 'next/headers';

/**
 * Возвращает request origin для server-side кода Next.
 *
 * @remarks
 * В production при работе за proxy/CDN приоритет отдается forwarded headers.
 * В локальной разработке используется обычный `host`.
 *
 * @returns Origin вида `http://localhost:3001`.
 */
export async function getServerRequestOrigin(): Promise<string> {
  const requestHeaders = await headers();

  const forwardedProto = requestHeaders.get('x-forwarded-proto');
  const forwardedHost = requestHeaders.get('x-forwarded-host');
  const host = requestHeaders.get('host');

  const protocol = forwardedProto ?? 'http';
  const hostname = forwardedHost ?? host;

  if (!hostname) {
    throw new Error('Cannot resolve request host for server-side API calls');
  }

  return `${protocol}://${hostname}`;
}

/**
 * Возвращает абсолютный base URL backend API для server-side вызовов.
 *
 * @returns Абсолютный URL вида `http://localhost:3001/v1`.
 */
export async function getServerApiBaseUrl(): Promise<string> {
  const origin = await getServerRequestOrigin();

  return `${origin}${API_BASE_PATH}`;
}
