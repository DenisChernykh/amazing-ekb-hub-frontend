import type { RemoteFailure } from '@/shared/failures/remote-failure';
import {
  isApiFailure,
  isContractFailure,
  isTransportFailure,
} from '@/shared/failures/remote-failure.guards';
/**
 * Проверяет, что произвольная ошибка уже относится к union `RemoteFailure`.
 *
 * @param error - Произвольное runtime-значение.
 * @returns `true`, если значение имеет `kind` одного из поддерживаемых failure-типов.
 */
function isRemoteFailure(error: unknown): error is RemoteFailure {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const value = error as { kind?: unknown };

  return value.kind === 'transport' || value.kind === 'api' || value.kind === 'contract';
}

/**
 * Определяет, можно ли безопасно повторить remote-запрос после данной ошибки.
 *
 * Retry разрешается для:
 * - transport-сбоев `network` и `unexpected`;
 * - API-ошибок категории `server`;
 * - contract-ошибки `invalidApiErrorEnvelope`, если HTTP status `>= 500`.
 *
 * @param error - Произвольная ошибка из query/mutation слоя.
 * @returns `true`, если ошибку можно считать retryable; иначе `false`.
 */
export function isRetryableRemoteFailure(error: unknown): boolean {
  if (!isRemoteFailure(error)) {
    return false;
  }

  if (isTransportFailure(error)) {
    return error.code === 'network' || error.code === 'unexpected';
  }

  if (isApiFailure(error)) {
    return error.type === 'server';
  }

  if (isContractFailure(error)) {
    return error.code === 'invalidApiErrorEnvelope' && (error.meta.status ?? 0) >= 500;
  }

  return false;
}
