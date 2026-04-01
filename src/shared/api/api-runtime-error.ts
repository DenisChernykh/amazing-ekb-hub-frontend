/**
 * Опции создания типизированной HTTP-ошибки backend-вызова.
 */
export interface ApiHttpErrorOptions {
  /**
   * HTTP status ошибочного ответа.
   */
  status: number;

  /**
   * Response headers ошибочного ответа.
   */
  headers: Headers;

  /**
   * Raw body ошибочного ответа.
   */
  body: unknown;

  /**
   * Человекочитаемое описание ошибки.
   */
  message?: string;

  /**
   * Исходная причина ошибки.
   */
  cause?: unknown;
}

/**
 * Типизированная HTTP-ошибка backend-вызова.
 *
 * @remarks
 * Используется в throw-based data-access слое как carrier для `STD-001`
 * error envelope и transport metadata.
 */
export class ApiHttpError extends Error {
  /**
   * HTTP status ошибочного ответа.
   */
  public readonly status: number;

  /**
   * Response headers ошибочного ответа.
   */
  public readonly headers: Headers;

  /**
   * Raw body ошибочного ответа.
   */
  public readonly body: unknown;

  /**
   * Исходная причина ошибки.
   */
  public readonly cause?: unknown;

  /**
   * Создает типизированную HTTP-ошибку.
   *
   * @param options - Status, headers, raw body и optional cause.
   */
  public constructor(options: ApiHttpErrorOptions) {
    super(options.message ?? `HTTP request failed with status ${options.status}`);
    this.name = 'ApiHttpError';
    this.status = options.status;
    this.headers = options.headers;
    this.body = options.body;
    this.cause = options.cause;
  }
}

/**
 * Описывает одну contract-диагностику API-слоя.
 *
 * @remarks
 * Используется для schema-валидации success payload и предназначена для
 * developer-facing diagnostics, а не для прямого показа в UI.
 */
export interface ApiContractDiagnosticIssue {
  /**
   * Машиночитаемый код contract issue.
   */
  code: string;

  /**
   * Человекочитаемое описание contract issue.
   */
  message: string;

  /**
   * Путь к проблемному полю в `dot notation`, если он известен.
   */
  path?: string;
}

/**
 * Опции создания contract-ошибки API-слоя.
 */
export interface ApiContractErrorOptions {
  /**
   * HTTP status ответа, если он известен.
   */
  status?: number;

  /**
   * Response headers, если они доступны.
   */
  headers?: Headers;

  /**
   * Raw payload, не прошедший contract-проверку.
   */
  body: unknown;

  /**
   * Детализация contract issues.
   */
  issues?: readonly ApiContractDiagnosticIssue[];

  /**
   * Человекочитаемое описание сбоя.
   */
  message?: string;

  /**
   * Исходная причина ошибки.
   */
  cause?: unknown;
}

/**
 * Типизированная contract-ошибка API-слоя.
 *
 * @remarks
 * Используется для невалидного success payload после schema-проверки.
 * Далее `std-errors` классифицирует такую ошибку как fatal contract failure.
 */
export class ApiContractError extends Error {
  /**
   * HTTP status ответа, если он известен.
   */
  public readonly status?: number;

  /**
   * Response headers, если они доступны.
   */
  public readonly headers?: Headers;

  /**
   * Raw payload, не прошедший contract-проверку.
   */
  public readonly body: unknown;

  /**
   * Детализация contract issues.
   */
  public readonly issues?: readonly ApiContractDiagnosticIssue[];

  /**
   * Исходная причина ошибки.
   */
  public readonly cause?: unknown;

  /**
   * Создает contract-ошибку API-слоя.
   *
   * @param options - Status, headers, raw payload, issues и optional cause.
   */
  public constructor(options: ApiContractErrorOptions) {
    super(
      options.message ?? 'API response contract violation: success payload does not match schema',
    );

    this.name = 'ApiContractError';
    this.status = options.status;
    this.headers = options.headers;
    this.body = options.body;
    this.issues = options.issues;
    this.cause = options.cause;
  }
}
