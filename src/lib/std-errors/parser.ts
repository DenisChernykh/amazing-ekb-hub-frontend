import { createFatalFailure } from './helpers';
import type {
  FatalFailure,
  HttpFailureInput,
  StdErrorBody,
  StdErrorDetails,
  StdErrorEnvelope,
  StdErrorIssue,
  StdErrorMeta,
  StdErrorType,
} from './types';

/**
 * Описывает успешный результат runtime-парсинга `STD-001` envelope.
 */
export interface ParseStdErrorSuccess {
  /**
   * Признак успешного парсинга.
   */
  ok: true;

  /**
   * Валидный `STD-001` envelope.
   */
  envelope: StdErrorEnvelope;
}

/**
 * Описывает неуспешный результат runtime-парсинга `STD-001` envelope.
 */
export interface ParseStdErrorFailure {
  /**
   * Признак неуспешного парсинга.
   */
  ok: false;

  /**
   * Fatal failure, указывающий, почему payload нельзя считать валидным `STD-001`.
   */
  failure: FatalFailure;
}

/**
 * Описывает результат попытки распарсить `STD-001` envelope.
 */
export type ParseStdErrorResult = ParseStdErrorSuccess | ParseStdErrorFailure;

type ParseValueResult<TValue> =
  | {
      ok: true;
      value: TValue;
    }
  | {
      ok: false;
      failure: FatalFailure;
    };

const STD_ERROR_TYPES: ReadonlySet<StdErrorType> = new Set([
  'validation',
  'domain',
  'auth',
  'permission',
  'not_found',
  'server',
]);

/**
 * Пытается распарсить raw error payload как валидный `STD-001` envelope.
 *
 * @param input - Transport-agnostic входные данные remote failure.
 * @returns Валидный `STD-001` envelope либо fatal failure уровня transport/contract.
 *
 * @remarks
 * Функция сознательно не принимает platform-решений и не нормализует policy outcome.
 * Её задача ограничена runtime-валидацией формы payload и отделением transport/contract проблем.
 */
export function tryParseStdErrorEnvelope(input: HttpFailureInput): ParseStdErrorResult {
  if (input.source !== 'http') {
    return {
      ok: false,
      failure: createFatalFailure(
        input,
        'transport',
        'Cannot parse STD-001 envelope from non-HTTP failure source.',
      ),
    };
  }

  if (!isRecord(input.body)) {
    return {
      ok: false,
      failure: createFatalFailure(
        input,
        'contract',
        'HTTP error payload is not an object and cannot match STD-001.',
      ),
    };
  }

  if (!hasOwn(input.body, 'error')) {
    return {
      ok: false,
      failure: createFatalFailure(
        input,
        'contract',
        'HTTP error payload does not contain required `error` field.',
      ),
    };
  }

  const metaResult = parseMeta(input.body.meta, input);

  if (!metaResult.ok) {
    return {
      ok: false,
      failure: metaResult.failure,
    };
  }

  const errorResult = parseErrorBody(input.body.error, input);

  if (!errorResult.ok) {
    return {
      ok: false,
      failure: errorResult.failure,
    };
  }

  return {
    ok: true,
    envelope: {
      meta: metaResult.value,
      error: errorResult.value,
    },
  };
}

/**
 * Возвращает `true`, если объект выглядит как record с произвольными ключами.
 *
 * @param value - Проверяемое значение.
 * @returns `true`, если значение является plain object-подобным record.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Возвращает `true`, если значение является `FatalFailure`.
 *
 * @param value - Проверяемое значение.
 * @returns `true`, если значение соответствует форме `FatalFailure`.
 */
export function isFatalFailure(value: unknown): value is FatalFailure {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isNonEmptyString(value.kind) &&
    isRecord(value.diagnostics) &&
    isNonEmptyString(value.diagnostics.source)
  );
}

function parseMeta(
  rawMeta: unknown,
  input: HttpFailureInput,
): ParseValueResult<StdErrorMeta | undefined> {
  if (rawMeta == null) {
    return {
      ok: true,
      value: undefined,
    };
  }

  if (!isRecord(rawMeta)) {
    return failContract(input, '`meta` must be an object when present.');
  }

  const requestId = rawMeta.requestId;

  if (requestId == null) {
    return {
      ok: true,
      value: {},
    };
  }

  if (!isNonEmptyString(requestId)) {
    return failContract(input, '`meta.requestId` must be a non-empty string when present.');
  }

  return {
    ok: true,
    value: {
      requestId: requestId.trim(),
    },
  };
}

function parseErrorBody(
  rawError: unknown,
  input: HttpFailureInput,
): ParseValueResult<StdErrorBody> {
  if (!isRecord(rawError)) {
    return failContract(input, '`error` must be an object.');
  }

  if (!isStdErrorType(rawError.type)) {
    return failContract(input, '`error.type` must be one of the registered STD-001 types.');
  }

  if (!isNonEmptyString(rawError.code)) {
    return failContract(input, '`error.code` must be a non-empty string.');
  }

  if (!isNonEmptyString(rawError.message)) {
    return failContract(input, '`error.message` must be a non-empty string.');
  }

  const detailsResult = parseDetails(rawError.details, rawError.type, input);

  if (!detailsResult.ok) {
    return {
      ok: false,
      failure: detailsResult.failure,
    };
  }

  return {
    ok: true,
    value: {
      type: rawError.type,
      code: rawError.code.trim(),
      message: rawError.message.trim(),
      details: detailsResult.value,
    },
  };
}

function parseDetails(
  rawDetails: unknown,
  errorType: StdErrorType,
  input: HttpFailureInput,
): ParseValueResult<StdErrorDetails | undefined> {
  if (rawDetails == null) {
    return {
      ok: true,
      value: undefined,
    };
  }

  if (!isRecord(rawDetails)) {
    return failContract(input, '`error.details` must be an object when present.');
  }

  const rawIssues = rawDetails.issues;

  if (rawIssues == null) {
    return {
      ok: true,
      value: {},
    };
  }

  if (errorType !== 'validation' && errorType !== 'domain') {
    return failContract(
      input,
      '`error.details.issues` is allowed only for `validation` and `domain` errors.',
    );
  }

  if (!Array.isArray(rawIssues) || rawIssues.length === 0) {
    return failContract(input, '`error.details.issues` must be a non-empty array when present.');
  }

  const issues: StdErrorIssue[] = [];

  for (const rawIssue of rawIssues) {
    const issueResult = parseIssue(rawIssue, input);

    if (!issueResult.ok) {
      return {
        ok: false,
        failure: issueResult.failure,
      };
    }

    issues.push(issueResult.value);
  }

  return {
    ok: true,
    value: {
      issues,
    },
  };
}

function parseIssue(rawIssue: unknown, input: HttpFailureInput): ParseValueResult<StdErrorIssue> {
  if (!isRecord(rawIssue)) {
    return failContract(input, 'Each `error.details.issues[]` item must be an object.');
  }

  if (!isNonEmptyString(rawIssue.code)) {
    return failContract(
      input,
      'Each `error.details.issues[]` item must have a non-empty string `code`.',
    );
  }

  if (!isNonEmptyString(rawIssue.message)) {
    return failContract(
      input,
      'Each `error.details.issues[]` item must have a non-empty string `message`.',
    );
  }

  if (rawIssue.path != null && !isNonEmptyString(rawIssue.path)) {
    return failContract(
      input,
      'Each `error.details.issues[]` item must have a non-empty string `path` when present.',
    );
  }

  if (isNonEmptyString(rawIssue.path) && !isValidIssuePath(rawIssue.path)) {
    return failContract(
      input,
      'Each `error.details.issues[]` `path` must use dot notation and must not use bracket notation.',
    );
  }

  return {
    ok: true,
    value: {
      code: rawIssue.code.trim(),
      message: rawIssue.message.trim(),
      path: isNonEmptyString(rawIssue.path) ? rawIssue.path.trim() : undefined,
    },
  };
}

function failContract(input: HttpFailureInput, message: string): ParseValueResult<never> {
  return {
    ok: false,
    failure: createFatalFailure(input, 'contract', message),
  };
}

function hasOwn<TKey extends string>(
  value: Record<string, unknown>,
  key: TKey,
): value is Record<TKey, unknown> & Record<string, unknown> {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStdErrorType(value: unknown): value is StdErrorType {
  return typeof value === 'string' && STD_ERROR_TYPES.has(value as StdErrorType);
}

function isValidIssuePath(path: string): boolean {
  const normalizedPath = path.trim();

  if (normalizedPath.length === 0) {
    return false;
  }

  if (
    normalizedPath.startsWith('.') ||
    normalizedPath.endsWith('.') ||
    normalizedPath.includes('..')
  ) {
    return false;
  }

  if (normalizedPath.includes('[') || normalizedPath.includes(']')) {
    return false;
  }

  const segments = normalizedPath.split('.');

  return segments.every((segment) => segment.trim().length > 0);
}
