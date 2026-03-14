import type {
  ApiDomainIssue,
  ApiErrorCodeByType,
  ApiErrorMessage,
  ApiErrorPayload,
  ApiErrorRequestId,
  ApiErrorType,
  ApiValidationIssue,
} from '@/shared/failures/api-error-envelope';

/**
 * Допустимые HTTP-методы remote-вызовов.
 */
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS' | 'TRACE';

/**
 * Метаданные remote-операции, полезные для диагностики и retry-логики.
 */
export type FailureMeta = {
  readonly endpoint: string;
  readonly method: ApiMethod;
  readonly status?: number;
};

type ApiFailureBase<TType extends ApiErrorType> = {
  readonly kind: 'api';
  readonly type: TType;
  readonly code: ApiErrorCodeByType<TType>;
  readonly message: ApiErrorMessage;
  readonly requestId?: ApiErrorRequestId;
  readonly meta: FailureMeta;
};

/**
 * Нормализованная validation-ошибка API.
 *
 * Содержит `issues`, если backend передал `error.details.issues[]`.
 */
export type ValidationApiFailure = ApiFailureBase<'validation'> & {
  readonly issues?: readonly ApiValidationIssue[];
};

/**
 * Нормализованная domain-ошибка API.
 *
 * Содержит `issues`, если backend передал `error.details.issues[]`.
 */
export type DomainApiFailure = ApiFailureBase<'domain'> & {
  readonly issues?: readonly ApiDomainIssue[];
};

/**
 * Нормализованная auth-ошибка API.
 */
export type AuthApiFailure = ApiFailureBase<'auth'>;

/**
 * Нормализованная permission-ошибка API.
 */
export type PermissionApiFailure = ApiFailureBase<'permission'>;

/**
 * Нормализованная not_found-ошибка API.
 */
export type NotFoundApiFailure = ApiFailureBase<'not_found'>;

/**
 * Нормализованная server-ошибка API.
 */
export type ServerApiFailure = ApiFailureBase<'server'>;

/**
 * Объединение всех нормализованных API-failure вариантов.
 */
export type ApiFailure =
  | ValidationApiFailure
  | DomainApiFailure
  | AuthApiFailure
  | PermissionApiFailure
  | NotFoundApiFailure
  | ServerApiFailure;

/**
 * Создает typed `ApiFailure` из уже провалидированного `ApiErrorPayload`.
 *
 * @param input - Объект с payload ошибки, HTTP metadata и опциональным `requestId`.
 * Поле `input.payload` должно содержать уже провалидированный `error` из API error envelope.
 * Поле `input.meta` описывает endpoint/method/status текущего HTTP-вызова.
 * Поле `input.requestId` передается из `envelope.meta?.requestId`, если оно есть.
 * @returns Нормализованный `ApiFailure`, пригодный для guards, UI и retry-логики.
 */
export function createApiFailure(input: {
  payload: ApiErrorPayload;
  meta: FailureMeta;
  requestId?: ApiErrorRequestId;
}): ApiFailure {
  const { payload, meta, requestId } = input;

  switch (payload.type) {
    case 'validation':
      return {
        kind: 'api',
        type: 'validation',
        code: payload.code,
        message: payload.message,
        requestId,
        meta,
        issues: payload.details?.issues,
      };

    case 'domain':
      return {
        kind: 'api',
        type: 'domain',
        code: payload.code,
        message: payload.message,
        requestId,
        meta,
        issues: payload.details?.issues,
      };

    case 'auth':
      return {
        kind: 'api',
        type: 'auth',
        code: payload.code,
        message: payload.message,
        requestId,
        meta,
      };

    case 'permission':
      return {
        kind: 'api',
        type: 'permission',
        code: payload.code,
        message: payload.message,
        requestId,
        meta,
      };

    case 'not_found':
      return {
        kind: 'api',
        type: 'not_found',
        code: payload.code,
        message: payload.message,
        requestId,
        meta,
      };

    case 'server':
      return {
        kind: 'api',
        type: 'server',
        code: payload.code,
        message: payload.message,
        requestId,
        meta,
      };
  }
}
