import {
  createFatalFailure,
  getRequestIdFromHeaders,
  getRequestIdFromUnknownBody,
  type HttpFailureInput,
} from '@/lib/std-errors';
import { mapApiRuntimeErrorToHttpFailureInput } from '@/shared/api';

/**
 * Успешный результат non-critical server-side запроса.
 *
 * @typeParam TData - Тип полезных данных.
 */
export interface NonCriticalRequestSuccess<TData> {
  kind: 'success';
  data: TData;
}

/**
 * Ошибка non-critical server-side запроса.
 */
export interface NonCriticalRequestError {
  kind: 'error';
  message: string;
  requestId?: string;
}

/**
 * Результат non-critical server-side запроса.
 *
 * @typeParam TData - Тип полезных данных.
 */
export type NonCriticalRequestResult<TData> =
  | NonCriticalRequestSuccess<TData>
  | NonCriticalRequestError;

/**
 * Опции выполнения non-critical server-side запроса.
 *
 * @typeParam TData - Тип полезных данных.
 */
export interface ExecuteNonCriticalRequestOptions<TData> {
  /**
   * Server-side операция загрузки данных.
   */
  request: () => Promise<TData>;

  /**
   * Короткий идентификатор контекста для логов.
   */
  context: string;

  /**
   * Безопасное пользовательское сообщение для локальной деградации UI.
   */
  fallbackMessage: string;
}

/**
 * Выполняет best-effort server-side запрос для non-critical секции.
 *
 * @typeParam TData - Тип полезных данных.
 * @param options - Request, log context и fallback message.
 * @returns Успешные данные или локальную error model для UI.
 *
 * @remarks
 * В отличие от `executeAppRscRequest`, helper не поддерживает `policy`,
 * `interrupt` и route-level semantics. Он предназначен только для секций,
 * которые должны деградировать локально без падения страницы.
 */
export async function executeNonCriticalRequest<TData>(
  options: ExecuteNonCriticalRequestOptions<TData>,
): Promise<NonCriticalRequestResult<TData>> {
  try {
    const data = await options.request();

    return {
      kind: 'success',
      data,
    };
  } catch (error) {
    const failureInput = safeMapError(error);
    const requestId = resolveNonCriticalRequestId(failureInput);

    reportNonCriticalRequestFailure({
      context: options.context,
      message: options.fallbackMessage,
      requestId,
      input: failureInput,
      error,
    });

    return {
      kind: 'error',
      message: options.fallbackMessage,
      requestId,
    };
  }
}

/**
 * Безопасно преобразует runtime error в `HttpFailureInput`.
 *
 * @param error - Пойманная runtime-ошибка request слоя.
 * @returns Нормализованный transport-agnostic input.
 */
function safeMapError(error: unknown): HttpFailureInput {
  try {
    return mapApiRuntimeErrorToHttpFailureInput(error);
  } catch (mapErrorCause) {
    return {
      source: 'unknown',
      cause: mapErrorCause,
    };
  }
}

/**
 * Best-effort извлекает `requestId` из non-critical failure input.
 *
 * @param input - Нормализованный transport-agnostic input.
 * @returns `requestId`, если его удалось найти.
 */
function resolveNonCriticalRequestId(input: HttpFailureInput): string | undefined {
  return getRequestIdFromUnknownBody(input.body) ?? getRequestIdFromHeaders(input.headers);
}

/**
 * Пишет в dev-console диагностику non-critical request failure.
 *
 * @param args - Контекст, fallback message, transport input и исходная ошибка.
 */
function reportNonCriticalRequestFailure(args: {
  context: string;
  message: string;
  requestId?: string;
  input: HttpFailureInput;
  error: unknown;
}): void {
  const { context, message, requestId, input, error } = args;

  const fatalFailure = createFatalFailure(input, 'unexpected', message);

  const logPayload = {
    context,
    requestId,
    source: input.source,
    status: input.status,
    message,
    contractIssues: fatalFailure.diagnostics.contractIssues,
    ...(process.env.NODE_ENV !== 'production'
      ? {
          rawBody: fatalFailure.diagnostics.rawBody,
          cause: toCompactErrorLog(error),
        }
      : {}),
  };

  console.error('[std-errors][non-critical-failure]', logPayload);
}

/**
 * Преобразует unknown error cause в компактный log-friendly объект.
 *
 * @param cause - Исходная причина сбоя.
 * @returns Компактное представление ошибки для диагностики.
 */
function toCompactErrorLog(cause: unknown): unknown {
  if (!(cause instanceof Error)) {
    return cause;
  }

  return {
    name: cause.name,
    message: cause.message,
  };
}
