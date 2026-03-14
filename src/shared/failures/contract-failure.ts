import type { FailureMeta } from '@/shared/failures/api-failure';

/**
 * Описание конкретного нарушения API-контракта.
 */
export type ContractIssue = {
  readonly path: string;
  readonly code: string;
  readonly message: string;
};

/**
 * Machine-readable коды contract-level сбоев.
 */
export type ContractFailureCode = 'invalidApiErrorEnvelope' | 'invalidApiResponse';

/**
 * Нормализованная contract-level ошибка remote-вызова.
 */
export type ContractFailure = {
  readonly kind: 'contract';
  readonly code: ContractFailureCode;
  readonly message: string;
  readonly meta: FailureMeta;
  readonly payload: unknown;
  readonly issues?: readonly ContractIssue[];
};

/**
 * Создает `ContractFailure` для невалидного API error envelope.
 *
 * @param args - Метаданные вызова, сырой payload и optional сообщение.
 * @returns Typed contract failure с кодом `invalidApiErrorEnvelope`.
 */
export function createInvalidApiErrorEnvelopeFailure(args: {
  meta: FailureMeta;
  payload: unknown;
  message?: string;
}): ContractFailure {
  const {
    meta,
    payload,
    message = 'API error contract violation: expected { error: { type, code, message } }',
  } = args;

  return {
    kind: 'contract',
    code: 'invalidApiErrorEnvelope',
    message,
    meta,
    payload,
  };
}

/**
 * Создает `ContractFailure` для success payload, не прошедшего schema-валидацию.
 *
 * @param args - Метаданные вызова, сырой payload, список contract issues и optional сообщение.
 * @returns Typed contract failure с кодом `invalidApiResponse`.
 */
export function createInvalidApiResponseFailure(args: {
  meta: FailureMeta;
  payload: unknown;
  issues: readonly ContractIssue[];
  message?: string;
}): ContractFailure {
  const {
    meta,
    payload,
    issues,
    message = 'API response contract violation: success payload does not match schema',
  } = args;

  return {
    kind: 'contract',
    code: 'invalidApiResponse',
    message,
    meta,
    payload,
    issues,
  };
}
