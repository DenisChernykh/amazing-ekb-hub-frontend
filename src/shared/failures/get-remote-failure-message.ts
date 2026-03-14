import type { ApiFailure } from '@/shared/failures/api-failure';
import type { ContractFailure, ContractFailureCode } from '@/shared/failures/contract-failure';
import type { RemoteFailure } from '@/shared/failures/remote-failure';
import type { TransportFailure, TransportFailureCode } from '@/shared/failures/transport-failure';

const API_FAILURE_MESSAGES: Record<ApiFailure['code'], string> = {
  VALIDATION_ERROR: 'Проверьте корректность заполнения формы',
  DOMAIN_RULES_VIOLATED: 'Операция нарушает бизнес-правила',
  PINNED_MATERIAL_MUST_BELONG_TO_PLACE: 'Материал должен принадлежать выбранному месту',
  UNAUTHORIZED: 'Требуется авторизация',
  INVALID_ACCESS_TOKEN: 'Сессия истекла. Войдите снова',
  INVALID_ACCESS_TOKEN_PAYLOAD: 'Сессия истекла. Войдите снова',
  INVALID_REFRESH_TOKEN: 'Не удалось обновить сессию. Войдите снова',
  INVALID_REFRESH_TOKEN_PAYLOAD: 'Не удалось обновить сессию. Войдите снова',
  REFRESH_TOKEN_REVOKED: 'Сессия завершена. Войдите снова',
  REFRESH_TOKEN_EXPIRED: 'Сессия истекла. Войдите снова',
  FORBIDDEN: 'Недостаточно прав для выполнения действия',
  INSUFFICIENT_ROLE: 'Недостаточно прав для выполнения действия',
  PLACE_NOT_FOUND: 'Место не найдено',
  MATERIAL_NOT_FOUND: 'Материал не найден',
  USER_NOT_FOUND: 'Пользователь не найден',
  RESOURCE_NOT_FOUND: 'Ресурс не найден',
  INTERNAL_ERROR: 'Не удалось выполнить запрос. Попробуйте позже',
  SERVICE_UNAVAILABLE: 'Сервис временно недоступен',
  CONFIGURATION_ERROR: 'Сервис временно недоступен',
};

const CONTRACT_FAILURE_MESSAGES: Record<ContractFailureCode, string> = {
  invalidApiErrorEnvelope: 'Сервер вернул ошибку в неожиданном формате',
  invalidApiResponse: 'Сервер вернул данные в неожиданном формате',
};

const TRANSPORT_FAILURE_MESSAGES: Record<TransportFailureCode, string> = {
  canceled: 'Запрос был отменен',
  network: 'Не удалось связаться с сервером',
  unexpected: 'Произошла непредвиденная ошибка',
};
/**
 * Возвращает frontend-сообщение для API failure по machine-readable `error.code`.
 *
 * @param failure - Нормализованная API-ошибка.
 * @returns Локализованное сообщение для показа пользователю.
 */
function getApiFailureMessage(failure: ApiFailure): string {
  return API_FAILURE_MESSAGES[failure.code];
}
/**
 * Возвращает frontend-сообщение для contract failure по machine-readable коду.
 *
 * @param failure - Нормализованная contract-ошибка.
 * @returns Локализованное сообщение для показа пользователю.
 */
function getContractFailureMessage(failure: ContractFailure): string {
  return CONTRACT_FAILURE_MESSAGES[failure.code];
}

/**
 * Возвращает frontend-сообщение для transport failure по machine-readable коду.
 *
 * @param failure - Нормализованная transport-ошибка.
 * @returns Локализованное сообщение для показа пользователю.
 */
function getTransportFailureMessage(failure: TransportFailure): string {
  return TRANSPORT_FAILURE_MESSAGES[failure.code];
}

/**
 * Возвращает frontend-сообщение для `RemoteFailure` по machine-readable коду.
 *
 * Для API-ошибок сообщение выбирается по `error.code`, для contract и transport —
 * по их собственным typed кодам. Backend `message` не используется как источник
 * текста для UI.
 *
 * @param failure - Нормализованная remote-ошибка.
 * @returns Локализованное сообщение для показа пользователю.
 */
export function getRemoteFailureMessage(failure: RemoteFailure): string {
  switch (failure.kind) {
    case 'api':
      return getApiFailureMessage(failure);

    case 'contract':
      return getContractFailureMessage(failure);

    case 'transport':
      return getTransportFailureMessage(failure);
  }
}
