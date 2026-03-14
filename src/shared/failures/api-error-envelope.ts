/**
 * Зарегистрированные issue-level коды для `domain` ошибок.
 *
 * Используются в `error.details.issues[*].code`, когда backend возвращает
 * конкретные нарушения бизнес-правил проекта.
 */
export const API_DOMAIN_ISSUE_CODES = ['PINNED_MATERIAL_MUST_BELONG_TO_PLACE'] as const;

/**
 * Зарегистрированные issue-level коды для `validation` ошибок.
 *
 * Используются в `error.details.issues[*].code` для field/root validation mapping.
 */
export const API_VALIDATION_ISSUE_CODES = [
  'required',
  'string',
  'number',
  'boolean',
  'email',
  'url',
  'uuid',
  'date',
  'array',
  'object',
  'min_length',
  'max_length',
  'min',
  'max',
  'enum',
  'unknown_property',
] as const;

/**
 * Канонический реестр envelope-level `error.code`, сгруппированных по `error.type`.
 *
 * Используется одновременно как compile-time источник union-типов и как runtime whitelist
 * для строгой валидации error envelope по `STD-001`.
 */
export const API_ERROR_CODES_BY_TYPE = {
  validation: ['VALIDATION_ERROR'],
  domain: ['DOMAIN_RULES_VIOLATED', ...API_DOMAIN_ISSUE_CODES],
  auth: [
    'UNAUTHORIZED',
    'INVALID_ACCESS_TOKEN',
    'INVALID_ACCESS_TOKEN_PAYLOAD',
    'INVALID_REFRESH_TOKEN',
    'INVALID_REFRESH_TOKEN_PAYLOAD',
    'REFRESH_TOKEN_REVOKED',
    'REFRESH_TOKEN_EXPIRED',
  ],
  permission: ['FORBIDDEN', 'INSUFFICIENT_ROLE'],
  not_found: ['PLACE_NOT_FOUND', 'MATERIAL_NOT_FOUND', 'USER_NOT_FOUND', 'RESOURCE_NOT_FOUND'],
  server: ['INTERNAL_ERROR', 'SERVICE_UNAVAILABLE', 'CONFIGURATION_ERROR'],
} as const;

type ApiErrorCodesByType = typeof API_ERROR_CODES_BY_TYPE;

/**
 * Допустимые категории API-ошибок из `error.type`.
 */
export type ApiErrorType = keyof ApiErrorCodesByType;

/**
 * Человекочитаемое summary-сообщение из `error.message`.
 */
export type ApiErrorMessage = string;

/**
 * Трассировочный идентификатор запроса из `meta.requestId`.
 */
export type ApiErrorRequestId = string;

/**
 * Путь к полю request payload в dot-notation.
 */
export type ApiIssuePath = string;

type ApiErrorCodeByTypeMap = {
  [K in ApiErrorType]: ApiErrorCodesByType[K][number];
};

/**
 * Машиночитаемый envelope-level код для конкретного `error.type`.
 *
 * @typeParam TType - Категория API-ошибки.
 */
export type ApiErrorCodeByType<TType extends ApiErrorType> = ApiErrorCodeByTypeMap[TType];

/**
 * Любой допустимый envelope-level код API-ошибки.
 */
export type ApiErrorCode = ApiErrorCodeByType<ApiErrorType>;

/**
 * Envelope-level код validation-ошибки.
 */
export type ApiValidationErrorCode = ApiErrorCodeByType<'validation'>;

/**
 * Envelope-level код domain-ошибки.
 */
export type ApiDomainErrorCode = ApiErrorCodeByType<'domain'>;

/**
 * Issue-level код validation-ошибки.
 */
export type ApiValidationIssueCode = (typeof API_VALIDATION_ISSUE_CODES)[number];

/**
 * Issue-level код domain-ошибки.
 */
export type ApiDomainIssueCode = (typeof API_DOMAIN_ISSUE_CODES)[number];

/**
 * Любой допустимый issue-level код для `validation` и `domain`.
 */
export type ApiIssueCode = ApiValidationIssueCode | ApiDomainIssueCode;

/**
 * Issue validation-ошибки из `error.details.issues[]`.
 */
export type ApiValidationIssue = {
  readonly code: ApiValidationIssueCode;
  readonly message: string;
  readonly path?: ApiIssuePath;
};

/**
 * Issue domain-ошибки из `error.details.issues[]`.
 */
export type ApiDomainIssue = {
  readonly code: ApiDomainIssueCode;
  readonly message: string;
  readonly path?: ApiIssuePath;
};

/**
 * Контейнер transport metadata в error envelope.
 */
export type ApiErrorMeta = {
  readonly requestId?: ApiErrorRequestId;
};

/**
 * Payload `details` для validation-ошибки.
 */
export type ApiValidationErrorDetails = {
  readonly issues: readonly [ApiValidationIssue, ...ApiValidationIssue[]];
};

/**
 * Payload `details` для domain-ошибки.
 */
export type ApiDomainErrorDetails = {
  readonly issues: readonly [ApiDomainIssue, ...ApiDomainIssue[]];
};

/**
 * Базовая часть payload API-ошибки для конкретного `type`.
 *
 * @typeParam TType - Тип ошибки, определяющий допустимый набор `code`.
 */
export type ApiErrorPayloadBase<TType extends ApiErrorType> = {
  readonly type: TType;
  readonly code: ApiErrorCodeByType<TType>;
  readonly message: ApiErrorMessage;
};

/**
 * Payload validation-ошибки API.
 */
export type ApiValidationErrorPayload = ApiErrorPayloadBase<'validation'> & {
  readonly details?: ApiValidationErrorDetails;
};

/**
 * Payload domain-ошибки API.
 */
export type ApiDomainErrorPayload = ApiErrorPayloadBase<'domain'> & {
  readonly details?: ApiDomainErrorDetails;
};

type ApiNonIssueErrorType = Exclude<ApiErrorType, 'validation' | 'domain'>;

/**
 * Payload API-ошибок без `details.issues`.
 */
export type ApiNonIssueErrorPayload = {
  [K in ApiNonIssueErrorType]: ApiErrorPayloadBase<K> & {
    readonly details?: never;
  };
}[ApiNonIssueErrorType];

/**
 * Строго типизированный payload ошибки API по `STD-001`.
 */
export type ApiErrorPayload =
  | ApiValidationErrorPayload
  | ApiDomainErrorPayload
  | ApiNonIssueErrorPayload;

/**
 * Корневой error envelope ответа API.
 */
export type ApiErrorEnvelope = {
  readonly meta?: ApiErrorMeta;
  readonly error: ApiErrorPayload;
};

/**
 * Проверяет, что значение является объектом-словарем.
 *
 * @param value - Произвольное значение.
 * @returns `true`, если значение является объектом; иначе `false`.
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Проверяет, что значение является непустой строкой.
 *
 * @param value - Произвольное значение.
 * @returns `true`, если значение является строкой с непустым содержимым; иначе `false`.
 */
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Проверяет, что `issues[*].path` соответствует dot-notation пути.
 *
 * @param value - Произвольное значение пути.
 * @returns `true`, если путь является непустой строкой без bracket notation; иначе `false`.
 */
function isIssuePath(value: unknown): value is ApiIssuePath {
  return isNonEmptyString(value) && !value.includes('[') && !value.includes(']');
}

/**
 * Проверяет, что значение входит в зарегистрированный реестр `error.type`.
 *
 * @param value - Произвольное значение категории ошибки.
 * @returns `true`, если значение является допустимым `ApiErrorType`; иначе `false`.
 */
function isApiErrorType(value: unknown): value is ApiErrorType {
  if (typeof value !== 'string') {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(API_ERROR_CODES_BY_TYPE, value);
}

/**
 * Проверяет, что `error.code` разрешен для конкретного `error.type`.
 *
 * @typeParam TType - Категория API-ошибки.
 * @param type - Уже провалидированный `error.type`.
 * @param code - Произвольное значение `error.code`.
 * @returns `true`, если код входит в whitelist для переданного `type`; иначе `false`.
 */
function isApiErrorCodeForType<TType extends ApiErrorType>(
  type: TType,
  code: unknown,
): code is ApiErrorCodeByType<TType> {
  if (typeof code !== 'string') {
    return false;
  }

  const allowed = API_ERROR_CODES_BY_TYPE[type] as readonly string[];
  return allowed.includes(code);
}

/**
 * Проверяет, что значение является допустимым validation issue code.
 *
 * @param value - Произвольное значение issue-кода.
 * @returns `true`, если значение входит в `API_VALIDATION_ISSUE_CODES`; иначе `false`.
 */
function isApiValidationIssueCode(value: unknown): value is ApiValidationIssueCode {
  if (typeof value !== 'string') {
    return false;
  }

  return (API_VALIDATION_ISSUE_CODES as readonly string[]).includes(value);
}

/**
 * Проверяет, что значение является допустимым domain issue code.
 *
 * @param value - Произвольное значение issue-кода.
 * @returns `true`, если значение входит в `API_DOMAIN_ISSUE_CODES`; иначе `false`.
 */
function isApiDomainIssueCode(value: unknown): value is ApiDomainIssueCode {
  if (typeof value !== 'string') {
    return false;
  }

  return (API_DOMAIN_ISSUE_CODES as readonly string[]).includes(value);
}

/**
 * Проверяет payload одной validation issue.
 *
 * @param value - Произвольный элемент из `error.details.issues[]`.
 * @returns `true`, если значение соответствует `ApiValidationIssue`; иначе `false`.
 */
function isApiValidationIssue(value: unknown): value is ApiValidationIssue {
  if (!isRecord(value)) {
    return false;
  }

  if (!isApiValidationIssueCode(value.code)) {
    return false;
  }

  if (!isNonEmptyString(value.message)) {
    return false;
  }

  if ('path' in value && value.path !== undefined && !isIssuePath(value.path)) {
    return false;
  }

  return true;
}

/**
 * Проверяет payload одной domain issue.
 *
 * @param value - Произвольный элемент из `error.details.issues[]`.
 * @returns `true`, если значение соответствует `ApiDomainIssue`; иначе `false`.
 */
function isApiDomainIssue(value: unknown): value is ApiDomainIssue {
  if (!isRecord(value)) {
    return false;
  }

  if (!isApiDomainIssueCode(value.code)) {
    return false;
  }

  if (!isNonEmptyString(value.message)) {
    return false;
  }

  if ('path' in value && value.path !== undefined && !isIssuePath(value.path)) {
    return false;
  }

  return true;
}

/**
 * Проверяет, что значение является непустым массивом и все элементы проходят вложенный guard.
 *
 * @typeParam TItem - Тип элемента после успешной проверки.
 * @param value - Произвольное значение массива.
 * @param guard - Guard для элемента массива.
 * @returns `true`, если значение является непустым массивом валидных элементов; иначе `false`.
 */
function isNonEmptyArray<TItem>(
  value: unknown,
  guard: (item: unknown) => item is TItem,
): value is readonly [TItem, ...TItem[]] {
  return Array.isArray(value) && value.length > 0 && value.every(guard);
}

/**
 * Проверяет `details` validation-ошибки.
 *
 * @param value - Произвольный payload `error.details`.
 * @returns `true`, если значение соответствует `ApiValidationErrorDetails`; иначе `false`.
 */
function isApiValidationErrorDetails(value: unknown): value is ApiValidationErrorDetails {
  if (!isRecord(value)) {
    return false;
  }

  return isNonEmptyArray(value.issues, isApiValidationIssue);
}

/**
 * Проверяет `details` domain-ошибки.
 *
 * @param value - Произвольный payload `error.details`.
 * @returns `true`, если значение соответствует `ApiDomainErrorDetails`; иначе `false`.
 */
function isApiDomainErrorDetails(value: unknown): value is ApiDomainErrorDetails {
  if (!isRecord(value)) {
    return false;
  }

  return isNonEmptyArray(value.issues, isApiDomainIssue);
}

/**
 * Проверяет контейнер transport metadata.
 *
 * @param value - Произвольное значение `meta`.
 * @returns `true`, если значение соответствует `ApiErrorMeta`; иначе `false`.
 */
function isApiErrorMeta(value: unknown): value is ApiErrorMeta {
  if (!isRecord(value)) {
    return false;
  }

  if ('requestId' in value && value.requestId !== undefined && !isNonEmptyString(value.requestId)) {
    return false;
  }

  return true;
}

/**
 * Проверяет payload validation-ошибки по `STD-001`.
 *
 * @param value - Произвольное значение `error`.
 * @returns `true`, если payload соответствует `ApiValidationErrorPayload`; иначе `false`.
 */
function isApiValidationErrorPayload(value: unknown): value is ApiValidationErrorPayload {
  if (!isRecord(value)) {
    return false;
  }

  if (value.type !== 'validation') {
    return false;
  }

  if (!isApiErrorCodeForType('validation', value.code)) {
    return false;
  }

  if (!isNonEmptyString(value.message)) {
    return false;
  }

  if ('requestId' in value) {
    return false;
  }

  if ('fields' in value) {
    return false;
  }

  if (
    'details' in value &&
    value.details !== undefined &&
    !isApiValidationErrorDetails(value.details)
  ) {
    return false;
  }

  return true;
}

/**
 * Проверяет payload domain-ошибки по `STD-001`.
 *
 * @param value - Произвольное значение `error`.
 * @returns `true`, если payload соответствует `ApiDomainErrorPayload`; иначе `false`.
 */
function isApiDomainErrorPayload(value: unknown): value is ApiDomainErrorPayload {
  if (!isRecord(value)) {
    return false;
  }

  if (value.type !== 'domain') {
    return false;
  }

  if (!isApiErrorCodeForType('domain', value.code)) {
    return false;
  }

  if (!isNonEmptyString(value.message)) {
    return false;
  }

  if ('requestId' in value) {
    return false;
  }

  if ('fields' in value) {
    return false;
  }

  if (
    'details' in value &&
    value.details !== undefined &&
    !isApiDomainErrorDetails(value.details)
  ) {
    return false;
  }

  return true;
}

/**
 * Проверяет payload API-ошибок без `details.issues`.
 *
 * @param value - Произвольное значение `error`.
 * @returns `true`, если payload соответствует `ApiNonIssueErrorPayload`; иначе `false`.
 */
function isApiNonIssueErrorPayload(value: unknown): value is ApiNonIssueErrorPayload {
  if (!isRecord(value)) {
    return false;
  }

  if (!isApiErrorType(value.type) || value.type === 'validation' || value.type === 'domain') {
    return false;
  }

  if (!isApiErrorCodeForType(value.type, value.code)) {
    return false;
  }

  if (!isNonEmptyString(value.message)) {
    return false;
  }

  if ('requestId' in value) {
    return false;
  }

  if ('fields' in value) {
    return false;
  }

  if ('details' in value) {
    return false;
  }

  return true;
}

/**
 * Проверяет, что значение соответствует одному из допустимых payload-вариантов API-ошибки.
 *
 * @param value - Произвольное значение `error`.
 * @returns `true`, если payload соответствует `ApiErrorPayload`; иначе `false`.
 */
function isApiErrorPayload(value: unknown): value is ApiErrorPayload {
  return (
    isApiValidationErrorPayload(value) ||
    isApiDomainErrorPayload(value) ||
    isApiNonIssueErrorPayload(value)
  );
}

/**
 * Валидирует неизвестный payload как `ApiErrorEnvelope` по runtime-контракту `STD-001`.
 *
 * @param payload - Произвольный payload HTTP error body.
 * @returns `ApiErrorEnvelope`, если payload соответствует контракту; иначе `null`.
 */
export function getApiErrorEnvelope(payload: unknown): ApiErrorEnvelope | null {
  if (!isRecord(payload)) {
    return null;
  }

  if (!isApiErrorPayload(payload.error)) {
    return null;
  }

  const meta = 'meta' in payload ? payload.meta : undefined;
  if (meta !== undefined && !isApiErrorMeta(meta)) {
    return null;
  }

  if (meta === undefined) {
    return { error: payload.error };
  }

  return {
    meta,
    error: payload.error,
  };
}
