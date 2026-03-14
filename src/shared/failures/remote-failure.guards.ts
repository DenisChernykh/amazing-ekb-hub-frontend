import type {
  ApiFailure,
  AuthApiFailure,
  DomainApiFailure,
  NotFoundApiFailure,
  PermissionApiFailure,
  ServerApiFailure,
  ValidationApiFailure,
} from '@/shared/failures/api-failure';
import type { ContractFailure } from '@/shared/failures/contract-failure';
import type { RemoteFailure } from '@/shared/failures/remote-failure';
import type { TransportFailure } from '@/shared/failures/transport-failure';

/**
 * Проверяет, что `RemoteFailure` относится к API-ошибкам.
 *
 * @param failure - Нормализованная remote-ошибка.
 * @returns `true`, если ошибка имеет `kind = 'api'`; иначе `false`.
 */
export function isApiFailure(failure: RemoteFailure): failure is ApiFailure {
  return failure.kind === 'api';
}

/**
 * Проверяет, что `RemoteFailure` является validation-ошибкой API.
 *
 * @param failure - Нормализованная remote-ошибка.
 * @returns `true`, если ошибка имеет `kind = 'api'` и `type = 'validation'`; иначе `false`.
 */
export function isValidationFailure(failure: RemoteFailure): failure is ValidationApiFailure {
  return failure.kind === 'api' && failure.type === 'validation';
}

/**
 * Проверяет, что `RemoteFailure` является domain-ошибкой API.
 *
 * @param failure - Нормализованная remote-ошибка.
 * @returns `true`, если ошибка имеет `kind = 'api'` и `type = 'domain'`; иначе `false`.
 */
export function isDomainFailure(failure: RemoteFailure): failure is DomainApiFailure {
  return failure.kind === 'api' && failure.type === 'domain';
}

/**
 * Проверяет, что `RemoteFailure` является auth-ошибкой API.
 *
 * @param failure - Нормализованная remote-ошибка.
 * @returns `true`, если ошибка имеет `kind = 'api'` и `type = 'auth'`; иначе `false`.
 */
export function isAuthFailure(failure: RemoteFailure): failure is AuthApiFailure {
  return failure.kind === 'api' && failure.type === 'auth';
}

/**
 * Проверяет, что `RemoteFailure` является permission-ошибкой API.
 *
 * @param failure - Нормализованная remote-ошибка.
 * @returns `true`, если ошибка имеет `kind = 'api'` и `type = 'permission'`; иначе `false`.
 */
export function isPermissionFailure(failure: RemoteFailure): failure is PermissionApiFailure {
  return failure.kind === 'api' && failure.type === 'permission';
}

/**
 * Проверяет, что `RemoteFailure` является not_found-ошибкой API.
 *
 * @param failure - Нормализованная remote-ошибка.
 * @returns `true`, если ошибка имеет `kind = 'api'` и `type = 'not_found'`; иначе `false`.
 */
export function isNotFoundFailure(failure: RemoteFailure): failure is NotFoundApiFailure {
  return failure.kind === 'api' && failure.type === 'not_found';
}

/**
 * Проверяет, что `RemoteFailure` является server-ошибкой API.
 *
 * @param failure - Нормализованная remote-ошибка.
 * @returns `true`, если ошибка имеет `kind = 'api'` и `type = 'server'`; иначе `false`.
 */
export function isServerFailure(failure: RemoteFailure): failure is ServerApiFailure {
  return failure.kind === 'api' && failure.type === 'server';
}

/**
 * Проверяет, что `RemoteFailure` относится к contract-level ошибкам.
 *
 * @param failure - Нормализованная remote-ошибка.
 * @returns `true`, если ошибка имеет `kind = 'contract'`; иначе `false`.
 */
export function isContractFailure(failure: RemoteFailure): failure is ContractFailure {
  return failure.kind === 'contract';
}

/**
 * Проверяет, что `RemoteFailure` относится к transport-level ошибкам.
 *
 * @param failure - Нормализованная remote-ошибка.
 * @returns `true`, если ошибка имеет `kind = 'transport'`; иначе `false`.
 */
export function isTransportFailure(failure: RemoteFailure): failure is TransportFailure {
  return failure.kind === 'transport';
}

/**
 * Проверяет, что `RemoteFailure` является domain-ошибкой с конкретным `error.code`.
 *
 * @typeParam TCode - Конкретный domain code, ожидаемый вызывающим кодом.
 * @param failure - Нормализованная remote-ошибка.
 * @param code - Ожидаемый machine-readable код domain-ошибки.
 * @returns `true`, если ошибка является `domain` и её `code` совпадает с переданным значением.
 */
export function isDomainFailureCode<TCode extends DomainApiFailure['code']>(
  failure: RemoteFailure,
  code: TCode,
): failure is Extract<DomainApiFailure, { code: TCode }> {
  return isDomainFailure(failure) && failure.code === code;
}
