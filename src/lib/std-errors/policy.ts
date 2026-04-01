import { createFatalFailure, normalizeIssues, resolveRequestId } from './helpers';
import { tryParseStdErrorEnvelope } from './parser';
import type {
  ExpectedFailure,
  ExpectedStdErrorType,
  FatalFailure,
  HttpFailureInput,
  NormalizedFailure,
  StdErrorEnvelope,
  StdErrorPolicy,
  StdErrorPolicyRule,
  StdErrorType,
} from './types';

/**
 * Описывает опции для создания базовой `STD-001` policy.
 */
export interface CreateDefaultStdErrorPolicyOptions {
  /**
   * Переопределения rule по envelope-level кодам ошибок.
   */
  byCode?: Partial<Record<string, StdErrorPolicyRule>>;

  /**
   * Частичные переопределения default-правил по expected типам.
   */
  byType?: Partial<Record<ExpectedStdErrorType, StdErrorPolicyRule>>;
}

/**
 * Нормализует remote failure в expected или fatal failure по правилам `STD-001` и project policy.
 *
 * @param input - Transport-agnostic данные error-ответа или transport failure.
 * @param policy - Project-level policy для выбора `action` и `catalogKey`.
 * @returns Нормализованный expected или fatal failure.
 *
 * @remarks
 * Функция не зависит от `Next.js` и не вызывает platform interrupts.
 * Она только классифицирует сбой и применяет policy-решение.
 */
export function normalizeHttpFailure(
  input: HttpFailureInput,
  policy: StdErrorPolicy,
): NormalizedFailure {
  if (input.contractIssues != null && input.contractIssues.length > 0) {
    return createFatalFailure(input, 'contract', 'HTTP success payload does not match schema.');
  }

  const parseResult = tryParseStdErrorEnvelope(input);

  if (!parseResult.ok) {
    return parseResult.failure;
  }

  return normalizeParsedEnvelope(parseResult.envelope, input, policy);
}

/**
 * Возвращает `true`, если failure относится к fatal flow и должен эскалироваться.
 *
 * @param failure - Нормализованный failure.
 * @returns `true`, если failure является `FatalFailure`.
 */
export function isFatalFailure(failure: NormalizedFailure): failure is FatalFailure {
  return 'kind' in failure;
}

/**
 * Возвращает `true`, если failure относится к expected flow и может быть обработан без error boundary.
 *
 * @param failure - Нормализованный failure.
 * @returns `true`, если failure является `ExpectedFailure`.
 */
export function isExpectedFailure(failure: NormalizedFailure): failure is ExpectedFailure {
  return !isFatalFailure(failure);
}

/**
 * Применяет project policy к уже валидному `STD-001` envelope.
 *
 * @param envelope - Валидный `STD-001` payload.
 * @param input - Исходные transport-данные сбоя.
 * @param policy - Project-level policy.
 * @returns Expected failure или fatal failure в зависимости от `error.type`.
 */
export function normalizeParsedEnvelope(
  envelope: StdErrorEnvelope,
  input: HttpFailureInput,
  policy: StdErrorPolicy,
): NormalizedFailure {
  const errorType = envelope.error.type;

  if (errorType === 'server') {
    return toServerFatalFailure(envelope, input);
  }

  const rule = resolvePolicyRule(errorType, envelope.error.code, policy);

  return {
    type: errorType,
    code: envelope.error.code,
    status: input.status,
    requestId: resolveRequestId(envelope, input.headers),
    action: rule.action,
    catalogKey: rule.catalogKey,
    issues: normalizeIssues(envelope.error.details?.issues),
    redirectTo: rule.action === 'redirect' ? rule.redirectTo : undefined,
  };
}

/**
 * Возвращает policy rule для expected ошибки с приоритетом `code -> type`.
 *
 * @param errorType - Expected тип ошибки `STD-001`.
 * @param errorCode - Envelope-level код ошибки.
 * @param policy - Project-level policy.
 * @returns Правило, которое должно быть применено к expected failure.
 */
export function resolvePolicyRule(
  errorType: ExpectedStdErrorType,
  errorCode: string,
  policy: StdErrorPolicy,
): StdErrorPolicyRule {
  return policy.byCode?.[errorCode] ?? policy.byType[errorType];
}

/**
 * Создаёт fatal failure для backend-ошибки типа `server`.
 *
 * @param envelope - Валидный `STD-001` envelope.
 * @param input - Исходные transport-данные.
 * @returns Fatal failure для дальнейшей эскалации.
 */
export function toServerFatalFailure(
  envelope: StdErrorEnvelope,
  input: HttpFailureInput,
): FatalFailure {
  return {
    kind: 'server',
    status: input.status,
    code: envelope.error.code,
    requestId: resolveRequestId(envelope, input.headers),
    diagnostics: {
      source: input.source,
      message: envelope.error.message,
      cause: input.cause,
      rawBody: input.body,
    },
  };
}

/**
 * Создаёт базовую policy для `STD-001` без route-specific знаний о проекте.
 *
 * @param options - Частичные project-level переопределения default policy.
 * @returns Базовая policy-конфигурация с безопасными generic-решениями.
 *
 * @remarks
 * `core` не знает маршруты приложения и не должен хардкодить `redirectTo`.
 * Если проект хочет redirect для `auth` или `permission`, он обязан передать это явно.
 */
export function createDefaultStdErrorPolicy(
  options?: CreateDefaultStdErrorPolicyOptions,
): StdErrorPolicy {
  return {
    byCode: options?.byCode,
    byType: {
      validation: {
        action: 'inline',
        catalogKey: 'std.validation.generic',
      },
      domain: {
        action: 'inline',
        catalogKey: 'std.domain.generic',
      },
      auth: {
        action: 'inline',
        catalogKey: 'std.auth.generic',
      },
      permission: {
        action: 'inline',
        catalogKey: 'std.permission.generic',
      },
      not_found: {
        action: 'interrupt:notFound',
        catalogKey: 'std.notFound.generic',
      },
      ...options?.byType,
    },
  };
}

/**
 * Возвращает `true`, если `error.type` относится к expected flow.
 *
 * @param errorType - Категория ошибки `STD-001`.
 * @returns `true`, если ошибка не является `server`.
 */
export function isExpectedStdErrorType(errorType: StdErrorType): errorType is ExpectedStdErrorType {
  return errorType !== 'server';
}

/**
 * Преобразует неожиданный runtime-throw в fatal failure.
 *
 * @param input - Исходные transport/runtime данные.
 * @param cause - Пойманная ошибка runtime-слоя.
 * @returns Fatal failure категории `unexpected`.
 */
export function toUnexpectedFatalFailure(input: HttpFailureInput, cause: unknown): FatalFailure {
  return createFatalFailure(
    {
      ...input,
      cause,
    },
    'unexpected',
    'Unexpected runtime error occurred while normalizing remote failure.',
  );
}
