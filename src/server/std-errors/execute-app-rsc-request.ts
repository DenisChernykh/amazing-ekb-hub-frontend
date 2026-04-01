import type { StdErrorPolicy } from '@/lib/std-errors';
import { mapApiRuntimeErrorToHttpFailureInput } from '@/shared/api';
import { createAppRscErrorPolicy } from './create-app-rsc-error-policy';
import {
  RscFatalError,
  executeRscRequest,
  resolveRscFailure,
  type NextRscBridge,
  type RscInlineFailureModel,
} from './next-rsc';

/**
 * Опции app-level выполнения server-side запроса в RSC.
 *
 * @typeParam TData - Тип полезных данных loader-а.
 */
export interface ExecuteAppRscRequestOptions<TData> {
  /**
   * Server-side операция загрузки данных.
   */
  request: () => Promise<TData>;

  /**
   * Project-level policy обработки expected failures.
   *
   * @remarks
   * Если policy не передана, используется app-default policy.
   */
  policy?: StdErrorPolicy;

  /**
   * Необязательный platform bridge для тестов и специальных runtime-сценариев.
   */
  bridge?: NextRscBridge;
}

/**
 * Успешный результат app-level RSC-загрузки.
 *
 * @typeParam TData - Тип полезных данных loader-а.
 */
export interface AppRscRequestSuccess<TData> {
  /**
   * Признак успешной загрузки.
   */
  ok: true;

  /**
   * Полезные данные страницы или route-level composition.
   */
  data: TData;
}

/**
 * Expected failure в app-level RSC-загрузке.
 */
export interface AppRscRequestFailure {
  /**
   * Признак expected failure.
   */
  ok: false;

  /**
   * Serializable inline-модель для route-level UI.
   */
  failure: RscInlineFailureModel;
}

/**
 * Результат app-level RSC-загрузки.
 *
 * @typeParam TData - Тип полезных данных loader-а.
 */
export type AppRscRequestResult<TData> = AppRscRequestSuccess<TData> | AppRscRequestFailure;

/**
 * Выполняет app-level server-side request через единый `std-errors` паттерн.
 *
 * @typeParam TData - Тип полезных данных loader-а.
 * @param options - Loader, optional policy и optional bridge.
 * @returns Успешные данные либо inline failure model.
 *
 * @remarks
 * Expected failures преобразуются в route-safe inline model или вызывают
 * platform interrupt (`notFound`, `redirect`, `unauthorized`, `forbidden`)
 * в зависимости от policy. Fatal failures эскалируются как исключения.
 */
export async function executeAppRscRequest<TData>(
  options: ExecuteAppRscRequestOptions<TData>,
): Promise<AppRscRequestResult<TData>> {
  try {
    const loadResult = await executeRscRequest({
      request: options.request,
      mapError: mapApiRuntimeErrorToHttpFailureInput,
      policy: options.policy ?? createAppRscErrorPolicy(),
    });

    if (loadResult.ok) {
      return {
        ok: true,
        data: loadResult.data,
      };
    }

    return {
      ok: false,
      failure: resolveRscFailure(loadResult.failure, {
        bridge: options.bridge,
      }),
    };
  } catch (error) {
    reportContractFailureDiagnostics(error);
    throw error;
  }
}

/**
 * Временно пишет contract failure diagnostics в server console.
 *
 * @param error - Пойманная ошибка app-level RSC request flow.
 *
 * @remarks
 * Helper намеренно оформлен как reporting boundary, чтобы позже его можно было
 * заменить на `logger.error(...)` или Sentry без изменения call sites.
 */
function reportContractFailureDiagnostics(error: unknown): void {
  if (!(error instanceof RscFatalError)) {
    return;
  }

  if (error.failure.kind !== 'contract') {
    return;
  }

  const logPayload = {
    kind: error.failure.kind,
    status: error.failure.status,
    code: error.failure.code,
    requestId: error.failure.requestId,
    source: error.failure.diagnostics.source,
    message: error.failure.diagnostics.message,
    contractIssues: error.failure.diagnostics.contractIssues,
    ...(process.env.NODE_ENV !== 'production'
      ? {
          rawBody: error.failure.diagnostics.rawBody,
          cause: toCompactErrorLog(error.failure.diagnostics.cause),
        }
      : {}),
  };

  console.error('[std-errors][contract-failure]', logPayload);
}

/**
 * Преобразует unknown error cause в компактный log-friendly объект.
 *
 * @param cause - Исходная причина fatal failure.
 * @returns Компактное представление ошибки для временного diagnostics logging.
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
