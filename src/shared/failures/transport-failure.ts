import type { FailureMeta } from '@/shared/failures/api-failure';

/**
 * Machine-readable коды transport-level ошибок.
 */
export type TransportFailureCode = 'canceled' | 'network' | 'unexpected';

type TransportFailureFactoryArgs = {
  meta: Omit<FailureMeta, 'status'>;
  cause?: unknown;
  message?: string;
};

/**
 * Нормализованная transport-level ошибка remote-вызова.
 */
export type TransportFailure = {
  readonly kind: 'transport';
  readonly code: TransportFailureCode;
  readonly message: string;
  readonly cause?: unknown;
  readonly meta: Omit<FailureMeta, 'status'>;
};

/**
 * Создает failure для отмененного запроса.
 *
 * @param args - Метаданные вызова и optional причина.
 * @returns Typed transport failure с кодом `canceled`.
 */
export function createCanceledFailure(args: TransportFailureFactoryArgs): TransportFailure {
  const { meta, cause, message = 'Request was canceled' } = args;

  return {
    kind: 'transport',
    code: 'canceled',
    message,
    cause,
    meta,
  };
}

/**
 * Создает failure для сетевого сбоя.
 *
 * @param args - Метаданные вызова и optional причина.
 * @returns Typed transport failure с кодом `network`.
 */
export function createNetworkFailure(args: TransportFailureFactoryArgs): TransportFailure {
  const { meta, cause, message = 'Network request failed' } = args;

  return {
    kind: 'transport',
    code: 'network',
    message,
    cause,
    meta,
  };
}

/**
 * Создает failure для непредвиденного transport-исключения.
 *
 * @param args - Метаданные вызова и optional причина.
 * @returns Typed transport failure с кодом `unexpected`.
 */
export function createUnexpectedFailure(args: TransportFailureFactoryArgs): TransportFailure {
  const { meta, cause, message = 'Unexpected transport error' } = args;

  return {
    kind: 'transport',
    code: 'unexpected',
    message,
    cause,
    meta,
  };
}

/**
 * Маппит runtime-исключение transport-слоя в typed `TransportFailure`.
 *
 * @param args - Исходная ошибка и метаданные вызова.
 * @returns `canceled`, `network` или `unexpected` failure в зависимости от природы исключения.
 */
export function mapTransportErrorToFailure(args: {
  error: unknown;
  meta: Omit<FailureMeta, 'status'>;
}): TransportFailure {
  const { error, meta } = args;

  if (error instanceof DOMException && error.name === 'AbortError') {
    return createCanceledFailure({ meta, cause: error });
  }

  if (error instanceof TypeError) {
    return createNetworkFailure({ meta, cause: error });
  }

  return createUnexpectedFailure({ meta, cause: error });
}
