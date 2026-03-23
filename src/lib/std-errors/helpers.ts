import type {
  FatalFailure,
  HttpFailureInput,
  NormalizedIssue,
  StdErrorEnvelope,
  StdErrorIssue,
  StdHeaders,
} from './types';

/**
 * Возвращает `true`, если issue считается global/root issue.
 *
 * @param issue - Issue из `STD-001` payload.
 * @returns `true`, если `path` отсутствует или пуст после `trim`.
 */
export function isGlobalIssue(issue: StdErrorIssue): boolean {
  return issue.path == null || issue.path.trim().length === 0;
}

/**
 * Преобразует raw `STD-001` issues в нормализованный вид для policy/UI слоя.
 *
 * @param issues - Список issues из backend payload.
 * @returns Нормализованный список issues. Если `issues` отсутствует, возвращает пустой массив.
 */
export function normalizeIssues(issues?: StdErrorIssue[]): NormalizedIssue[] {
  if (issues == null) {
    return [];
  }

  return issues.map((issue) => ({
    code: issue.code,
    message: issue.message,
    path: normalizeIssuePath(issue.path),
    isGlobal: isGlobalIssue(issue),
  }));
}

/**
 * Возвращает список global/root issues без привязки к конкретному пути.
 *
 * @param issues - Нормализованные issues.
 * @returns Только global issues.
 */
export function getGlobalIssues(issues: NormalizedIssue[]): NormalizedIssue[] {
  return issues.filter((issue) => issue.isGlobal);
}

/**
 * Возвращает список field issues, привязанных к конкретным путям payload.
 *
 * @param issues - Нормализованные issues.
 * @returns Только issues с `path`.
 */
export function getFieldIssues(issues: NormalizedIssue[]): NormalizedIssue[] {
  return issues.filter((issue) => !issue.isGlobal && issue.path != null);
}

/**
 * Группирует issues по `dot notation` пути.
 *
 * @param issues - Нормализованные issues.
 * @returns Map, где ключом выступает `path`, а значением — список issues для этого пути.
 */
export function groupIssuesByPath(issues: NormalizedIssue[]): Map<string, NormalizedIssue[]> {
  const grouped = new Map<string, NormalizedIssue[]>();

  for (const issue of issues) {
    if (issue.path == null) {
      continue;
    }

    const bucket = grouped.get(issue.path) ?? [];
    bucket.push(issue);
    grouped.set(issue.path, bucket);
  }

  return grouped;
}

/**
 * Извлекает `requestId` из `STD-001` envelope.
 *
 * @param envelope - Нормализованный `STD-001` payload.
 * @returns `requestId`, если он присутствует и не пуст.
 */
export function getRequestIdFromEnvelope(envelope: StdErrorEnvelope): string | undefined {
  const requestId = envelope.meta?.requestId;

  if (requestId == null) {
    return undefined;
  }

  const normalizedRequestId = requestId.trim();

  return normalizedRequestId.length > 0 ? normalizedRequestId : undefined;
}

/**
 * Извлекает `requestId` из HTTP headers.
 *
 * @param headers - Нормализованные response headers.
 * @returns Значение `x-request-id`, если оно присутствует и не пусто.
 */
export function getRequestIdFromHeaders(headers?: StdHeaders): string | undefined {
  if (headers == null) {
    return undefined;
  }

  const requestId = headers['x-request-id'] ?? headers['X-Request-Id'] ?? headers['X-REQUEST-ID'];

  if (requestId == null) {
    return undefined;
  }

  const normalizedRequestId = requestId.trim();

  return normalizedRequestId.length > 0 ? normalizedRequestId : undefined;
}

/**
 * Пытается best-effort извлечь `requestId` из raw response body.
 *
 * @param body - Raw body ответа до полной runtime-валидации.
 * @returns `requestId`, если в `body.meta.requestId` лежит непустая строка.
 *
 * @remarks
 * Helper нужен для contract-failure сценариев, когда payload похож на `STD-001`,
 * но не проходит полную валидацию.
 */
export function getRequestIdFromUnknownBody(body: unknown): string | undefined {
  if (!isRecordLike(body)) {
    return undefined;
  }

  const rawMeta = body.meta;

  if (!isRecordLike(rawMeta)) {
    return undefined;
  }

  const rawRequestId = rawMeta.requestId;

  if (typeof rawRequestId !== 'string') {
    return undefined;
  }

  const requestId = rawRequestId.trim();

  return requestId.length > 0 ? requestId : undefined;
}

/**
 * Возвращает `requestId` из envelope с fallback на HTTP headers.
 *
 * @param envelope - Нормализованный `STD-001` payload.
 * @param headers - Нормализованные response headers.
 * @returns `requestId`, если он найден хотя бы в одном источнике.
 */
export function resolveRequestId(
  envelope: StdErrorEnvelope,
  headers?: StdHeaders,
): string | undefined {
  return getRequestIdFromEnvelope(envelope) ?? getRequestIdFromHeaders(headers);
}

/**
 * Создаёт fatal failure для transport-level и runtime-level сбоев.
 *
 * @param input - Входные данные remote failure.
 * @param kind - Категория fatal failure.
 * @param message - Короткое диагностическое summary.
 * @returns Готовый `FatalFailure` для дальнейшей эскалации.
 */
export function createFatalFailure(
  input: HttpFailureInput,
  kind: FatalFailure['kind'],
  message?: string,
): FatalFailure {
  return {
    kind,
    status: input.status,
    requestId: getRequestIdFromUnknownBody(input.body) ?? getRequestIdFromHeaders(input.headers),
    diagnostics: {
      source: input.source,
      message,
      cause: input.cause,
      rawBody: input.body,
    },
  };
}

/**
 * Нормализует `path` issue к каноническому виду.
 *
 * @param path - Сырой путь из backend payload.
 * @returns Очищенный `dot notation` путь или `undefined`, если путь отсутствует.
 */
export function normalizeIssuePath(path?: string): string | undefined {
  if (path == null) {
    return undefined;
  }

  const normalizedPath = path.trim();

  return normalizedPath.length > 0 ? normalizedPath : undefined;
}

function isRecordLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
