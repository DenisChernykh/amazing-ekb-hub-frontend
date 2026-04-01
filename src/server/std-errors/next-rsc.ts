import { forbidden, notFound, redirect, unauthorized, unstable_rethrow } from 'next/navigation';

import { getFieldIssues, getGlobalIssues, groupIssuesByPath } from '@/lib/std-errors/helpers';
import { isFatalFailure, normalizeHttpFailure } from '@/lib/std-errors/policy';
import type {
  ExpectedFailure,
  FatalFailure,
  HttpFailureInput,
  NormalizedIssue,
  StdErrorPolicy,
} from '@/lib/std-errors/types';
/**
 * Описывает serializable inline-модель expected failure для route-level UI.
 */
export interface RscInlineFailureModel {
  /**
   * Категория ошибки `STD-001`.
   */
  type: ExpectedFailure['type'];

  /**
   * Envelope-level код ошибки.
   */
  code: string;

  /**
   * HTTP status ответа, если он известен.
   */
  status?: number;

  /**
   * Ключ project-level каталога сообщений.
   */
  catalogKey: string;

  /**
   * Идентификатор запроса для диагностики и саппорта.
   */
  requestId?: string;

  /**
   * Полный список нормализованных issues.
   */
  issues: NormalizedIssue[];

  /**
   * Global/root issues без привязки к полю.
   */
  globalIssues: NormalizedIssue[];

  /**
   * Field issues, сгруппированные по `dot notation` пути.
   */
  fieldIssues: Record<string, NormalizedIssue[]>;
}

/**
 * Описывает успешный результат server-side загрузки.
 *
 * @typeParam TData - Тип полезных данных loader-а.
 */
export interface RscLoadSuccess<TData> {
  /**
   * Признак успешной загрузки.
   */
  ok: true;

  /**
   * Полезные данные loader-а.
   */
  data: TData;
}

/**
 * Описывает expected failure в server-side загрузке.
 */
export interface RscLoadFailure {
  /**
   * Признак expected failure.
   */
  ok: false;

  /**
   * Нормализованный expected failure.
   */
  failure: ExpectedFailure;
}

/**
 * Описывает результат выполнения server-side loader-а.
 *
 * @typeParam TData - Тип полезных данных loader-а.
 */
export type RscLoadResult<TData> = RscLoadSuccess<TData> | RscLoadFailure;

/**
 * Описывает runtime-capabilities Next adapter-а.
 */
export interface NextRscBridgeCapabilities {
  /**
   * Доступны ли experimental `unauthorized()` и `forbidden()`.
   *
   * @remarks
   * Capability зависит от `experimental.authInterrupts` в `next.config.ts`.
   */
  authInterrupts: boolean;
}

/**
 * Описывает platform bridge для Next Server Components.
 */
export interface NextRscBridge {
  /**
   * Набор доступных platform-capabilities.
   */
  capabilities: NextRscBridgeCapabilities;

  /**
   * Завершает рендеринг сегмента через `notFound()`.
   */
  notFound(): never;

  /**
   * Завершает рендеринг сегмента через `redirect()`.
   *
   * @param href - URL назначения.
   */
  redirect(href: string): never;

  /**
   * Завершает рендеринг сегмента через `unauthorized()`.
   */
  unauthorized(): never;

  /**
   * Завершает рендеринг сегмента через `forbidden()`.
   */
  forbidden(): never;
}

/**
 * Описывает опции выполнения server-side loader-а через `next-rsc` adapter.
 *
 * @typeParam TData - Тип полезных данных loader-а.
 */
export interface ExecuteRscRequestOptions<TData> {
  /**
   * Loader или request-bound операция загрузки данных.
   */
  request: () => Promise<TData>;

  /**
   * Project-specific mapper, преобразующий runtime error в transport-agnostic `HttpFailureInput`.
   *
   * @param error - Пойманная ошибка runtime/data-access слоя.
   * @returns Нормализованный вход для `core` normalizer.
   */
  mapError: (error: unknown) => HttpFailureInput;

  /**
   * Project-level policy обработки `STD-001`.
   */
  policy: StdErrorPolicy;
}

/**
 * Описывает опции разрешения expected failure в runtime-поведение Next.
 */
export interface ResolveRscFailureOptions {
  /**
   * Platform bridge. Если не передан, используется стандартный bridge для Next.
   */
  bridge?: NextRscBridge;
}

/**
 * Ошибка-обёртка для fatal failure в `next-rsc` adapter.
 *
 * @remarks
 * Такая ошибка предназначена для эскалации в `error.tsx` или внешний logging layer.
 */
export class RscFatalError extends Error {
  /**
   * Нормализованный fatal failure.
   */
  public readonly failure: FatalFailure;

  /**
   * Создаёт fatal error для server runtime.
   *
   * @param failure - Нормализованный fatal failure.
   */
  public constructor(failure: FatalFailure) {
    super(buildFatalErrorMessage(failure));
    this.name = 'RscFatalError';
    this.failure = failure;
  }
}

/**
 * Создаёт стандартный Next bridge для Server Components.
 *
 * @param capabilities - Runtime-capabilities adapter-а.
 * @returns Bridge к `next/navigation`.
 */
export function createNextRscBridge(
  capabilities: Partial<NextRscBridgeCapabilities> = {},
): NextRscBridge {
  return {
    capabilities: {
      authInterrupts: capabilities.authInterrupts ?? false,
    },
    notFound,
    redirect,
    unauthorized,
    forbidden,
  };
}

/**
 * Выполняет server-side request и нормализует error flow по `STD-001`.
 *
 * @typeParam TData - Тип полезных данных loader-а.
 * @param options - Loader, mapper ошибки и project policy.
 * @returns Успешный результат либо expected failure.
 *
 * @remarks
 * Если внутри `request()` или ниже по стеку был вызван `notFound()` / `redirect()`
 * или другой framework-controlled interrupt, `unstable_rethrow()` немедленно
 * пробросит его обратно в Next.js.
 *
 * Fatal failures не возвращаются как `Result`, а эскалируются через `RscFatalError`.
 */
export async function executeRscRequest<TData>(
  options: ExecuteRscRequestOptions<TData>,
): Promise<RscLoadResult<TData>> {
  try {
    const data = await options.request();

    return {
      ok: true,
      data,
    };
  } catch (error) {
    unstable_rethrow(error);

    const failureInput = safeMapError(error, options.mapError);
    const normalizedFailure = normalizeHttpFailure(failureInput, options.policy);

    if (isFatalFailure(normalizedFailure)) {
      throw new RscFatalError(normalizedFailure);
    }

    return {
      ok: false,
      failure: normalizedFailure,
    };
  }
}

/**
 * Применяет runtime-действие к expected failure в Next Server Components.
 *
 * @param failure - Expected failure из `executeRscRequest()`.
 * @param options - Platform bridge и runtime-настройки.
 * @returns Serializable inline-модель, если failure нужно рендерить в UI.
 *
 * @remarks
 * Если requested action не поддерживается текущими capabilities, adapter
 * деградирует к inline model вместо generic runtime-crash.
 */
export function resolveRscFailure(
  failure: ExpectedFailure,
  options: ResolveRscFailureOptions = {},
): RscInlineFailureModel | never {
  const bridge = options.bridge ?? createNextRscBridge();

  switch (failure.action) {
    case 'inline':
      return toRscInlineFailureModel(failure);

    case 'interrupt:notFound':
      bridge.notFound();

    case 'interrupt:unauthorized':
      if (bridge.capabilities.authInterrupts) {
        bridge.unauthorized();
      }

      return toRscInlineFailureModel(failure);

    case 'interrupt:forbidden':
      if (bridge.capabilities.authInterrupts) {
        bridge.forbidden();
      }

      return toRscInlineFailureModel(failure);

    case 'redirect':
      if (isNonEmptyString(failure.redirectTo)) {
        bridge.redirect(failure.redirectTo);
      }

      throw new RscFatalError(
        createUnexpectedAdapterFailure(
          'Expected redirect failure must include non-empty `redirectTo`.',
          failure,
        ),
      );
  }
}

/**
 * Преобразует expected failure в serializable inline-модель для route-level UI.
 *
 * @param failure - Expected failure после policy-нормализации.
 * @returns Готовая модель для server component rendering.
 */
export function toRscInlineFailureModel(failure: ExpectedFailure): RscInlineFailureModel {
  return {
    type: failure.type,
    code: failure.code,
    status: failure.status,
    catalogKey: failure.catalogKey,
    requestId: failure.requestId,
    issues: failure.issues,
    globalIssues: getGlobalIssues(failure.issues),
    fieldIssues: toFieldIssuesRecord(failure.issues),
  };
}
/**
 * Безопасно преобразует runtime-ошибку в `HttpFailureInput`.
 *
 * @param error - Исходная runtime-ошибка request слоя.
 * @param mapError - Адаптер преобразования runtime-ошибки в transport input.
 * @returns Нормализованный `HttpFailureInput`.
 *
 * @throws RscFatalError
 * Бросает fatal error, если сам adapter `mapError` завершился с ошибкой.
 */
function safeMapError(
  error: unknown,
  mapError: (error: unknown) => HttpFailureInput,
): HttpFailureInput {
  try {
    return mapError(error);
  } catch (mapErrorCause) {
    throw new RscFatalError(
      createUnexpectedAdapterFailure(
        'Failed to map runtime error to `HttpFailureInput`.',
        mapErrorCause,
        error,
      ),
    );
  }
}
/**
 * Группирует field-level issues в record по `path`.
 *
 * @param issues - Нормализованный список issues expected failure.
 * @returns Record вида `{ [path]: NormalizedIssue[] }`.
 */
function toFieldIssuesRecord(issues: NormalizedIssue[]): Record<string, NormalizedIssue[]> {
  const groupedIssues = groupIssuesByPath(getFieldIssues(issues));
  const fieldIssues: Record<string, NormalizedIssue[]> = {};

  for (const [path, pathIssues] of groupedIssues.entries()) {
    fieldIssues[path] = pathIssues;
  }

  return fieldIssues;
}
/**
 * Собирает человекочитаемое сообщение для `RscFatalError`.
 *
 * @param failure - Fatal failure, эскалируемый в error boundary.
 * @returns Короткое сообщение с kind, optional code и optional request id.
 */
function buildFatalErrorMessage(failure: FatalFailure): string {
  const requestIdPart = failure.requestId == null ? '' : ` requestId=${failure.requestId}`;
  const codePart = failure.code == null ? '' : ` code=${failure.code}`;

  return `RSC fatal failure (${failure.kind})${codePart}${requestIdPart}`;
}
/**
 * Создает fatal failure для неожиданного сбоя adapter/runtime слоя.
 *
 * @param message - Человекочитаемое описание unexpected failure.
 * @param cause - Исходная ошибка adapter-а.
 * @param rawBody - Optional raw body или исходный payload для diagnostics.
 * @returns Fatal failure c kind `unexpected`.
 */
function createUnexpectedAdapterFailure(
  message: string,
  cause?: unknown,
  rawBody?: unknown,
): FatalFailure {
  return {
    kind: 'unexpected',
    diagnostics: {
      source: 'unknown',
      message,
      cause,
      rawBody,
    },
  };
}
/**
 * Проверяет, что значение является непустой строкой.
 *
 * @param value - Проверяемое значение.
 * @returns `true`, если значение является строкой с непустым trimmed content.
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}
