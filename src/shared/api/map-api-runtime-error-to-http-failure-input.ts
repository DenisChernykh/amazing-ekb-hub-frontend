import type { ContractDiagnosticIssue, HttpFailureInput, StdHeaders } from '@/lib/std-errors';
import { ApiContractError, ApiHttpError } from './api-runtime-error';

/**
 * Преобразует runtime-ошибку API-слоя в transport-agnostic `HttpFailureInput`.
 *
 * @param error - Пойманная ошибка data-access/runtime слоя.
 * @returns Нормализованный input для `std-errors` core.
 */
export function mapApiRuntimeErrorToHttpFailureInput(error: unknown): HttpFailureInput {
  if (error instanceof ApiHttpError) {
    return {
      status: error.status,
      headers: toStdHeaders(error.headers),
      body: error.body,
      source: 'http',
      cause: error.cause ?? error,
    };
  }

  if (error instanceof ApiContractError) {
    return {
      status: error.status,
      headers: toStdHeaders(error.headers),
      body: error.body,
      source: 'http',
      cause: error.cause ?? error,
      contractIssues: toContractDiagnosticIssues(error.issues),
    };
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return {
      source: 'abort',
      cause: error,
    };
  }

  if (error instanceof TypeError && isLikelyFetchNetworkError(error)) {
    return {
      source: 'network',
      cause: error,
    };
  }

  return {
    source: 'unknown',
    cause: error,
  };
}

/**
 * Преобразует `Headers` в plain-object формат `std-errors`.
 *
 * @param headers - Исходный объект `Headers`.
 * @returns Нормализованный словарь headers или `undefined`.
 */
function toStdHeaders(headers?: Headers): StdHeaders | undefined {
  if (!headers) {
    return undefined;
  }

  const normalizedHeaders: StdHeaders = {};

  headers.forEach((value, key) => {
    normalizedHeaders[key] = value;
  });

  return normalizedHeaders;
}

/**
 * Нормализует contract diagnostics API-слоя в `std-errors` compatible shape.
 *
 * @param issues - Список contract diagnostics из API-слоя.
 * @returns Копию списка diagnostics или `undefined`.
 */
function toContractDiagnosticIssues(
  issues?: readonly ContractDiagnosticIssue[],
): ContractDiagnosticIssue[] | undefined {
  if (issues == null || issues.length === 0) {
    return undefined;
  }

  return issues.map((issue) => ({
    code: issue.code,
    message: issue.message,
    path: issue.path,
  }));
}

/**
 * Определяет, похожа ли `TypeError` на fetch/network failure.
 *
 * @param error - Проверяемая runtime-ошибка.
 * @returns `true`, если ошибка похожа на реальный transport/network сбой.
 */
function isLikelyFetchNetworkError(error: TypeError): boolean {
  const normalizedMessage = error.message.trim().toLowerCase();

  if (
    normalizedMessage === 'failed to fetch' ||
    normalizedMessage === 'fetch failed' ||
    normalizedMessage === 'load failed' ||
    normalizedMessage.includes('networkerror')
  ) {
    return true;
  }

  return hasKnownNetworkCause((error as TypeError & { cause?: unknown }).cause);
}

/**
 * Проверяет, содержит ли `cause` известный network-level код платформы.
 *
 * @param cause - Вложенная причина ошибки.
 * @returns `true`, если причина похожа на сетевой сбой.
 */
function hasKnownNetworkCause(cause: unknown): boolean {
  if (!isRecordLike(cause)) {
    return false;
  }

  const code = cause.code;

  return (
    code === 'ECONNREFUSED' ||
    code === 'ECONNRESET' ||
    code === 'ENOTFOUND' ||
    code === 'EAI_AGAIN' ||
    code === 'ETIMEDOUT'
  );
}

/**
 * Проверяет, что значение похоже на plain object.
 *
 * @param value - Проверяемое значение.
 * @returns `true`, если значение является объектом и не является массивом.
 */
function isRecordLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
