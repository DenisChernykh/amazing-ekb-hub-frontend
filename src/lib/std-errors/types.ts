/**
 * Канонические типы ошибок backend-контракта `STD-001`.
 *
 * @remarks
 * Эти типы не зависят от `Next.js`, конкретного HTTP-клиента и generated OpenAPI schema.
 * Они составляют стабильный публичный API `core`-слоя библиотеки.
 */
export type StdErrorType = 'validation' | 'domain' | 'auth' | 'permission' | 'not_found' | 'server';

/**
 * Описывает transport metadata error-ответа.
 */
export interface StdErrorMeta {
  /**
   * Идентификатор запроса для трассировки в логах и observability-контуре.
   */
  requestId?: string;
}

/**
 * Описывает одну конкретную проблему внутри `validation` или `domain` ошибки.
 */
export interface StdErrorIssue {
  /**
   * Машиночитаемый код issue.
   */
  code: string;

  /**
   * Человекочитаемое описание issue из backend payload.
   *
   * @remarks
   * Это поле не предназначено для прямого показа в UI без project-level mapping.
   */
  message: string;

  /**
   * `dot notation` путь в request payload.
   *
   * @remarks
   * Если поле отсутствует, issue считается global/root issue.
   */
  path?: string;
}

/**
 * Описывает type-specific payload `STD-001` ошибки.
 */
export interface StdErrorDetails {
  /**
   * Список конкретных проблем для `validation` и `domain` сценариев.
   */
  issues?: StdErrorIssue[];
}

/**
 * Описывает каноническое тело ошибки `STD-001`.
 */
export interface StdErrorBody {
  /**
   * Категория ошибки.
   */
  type: StdErrorType;

  /**
   * Машиночитаемый envelope-level код ошибки.
   */
  code: string;

  /**
   * Человекочитаемое summary-сообщение backend.
   *
   * @remarks
   * Это поле не должно использоваться для branching-логики и не должно считаться готовым UI-текстом.
   */
  message: string;

  /**
   * Дополнительный type-specific payload ошибки.
   */
  details?: StdErrorDetails;
}

/**
 * Описывает нормализованный `STD-001` error envelope.
 */
export interface StdErrorEnvelope {
  /**
   * Transport metadata ответа.
   */
  meta?: StdErrorMeta;

  /**
   * Каноническое тело ошибки.
   */
  error: StdErrorBody;
}

/**
 * Описывает источник сбоя на входе в нормализатор.
 */
export type StdFailureSource = 'http' | 'network' | 'timeout' | 'abort' | 'unknown';

/**
 * Описывает headers error-ответа в transport-agnostic виде.
 */
export type StdHeaders = Record<string, string | undefined>;

/**
 * Описывает входные данные для нормализации remote failure.
 *
 * @typeParam TBody - Тип raw payload до runtime-валидации.
 */
export interface HttpFailureInput<TBody = unknown> {
  /**
   * HTTP status ответа, если он известен.
   */
  status?: number;

  /**
   * Нормализованные response headers.
   */
  headers?: StdHeaders;

  /**
   * Raw body ответа до проверки на соответствие `STD-001`.
   */
  body?: TBody;

  /**
   * Источник сбоя.
   */
  source: StdFailureSource;

  /**
   * Исходная ошибка transport/runtime слоя.
   */
  cause?: unknown;
}

/**
 * Описывает типы ошибок `STD-001`, которые считаются expected flow.
 */
export type ExpectedStdErrorType = Exclude<StdErrorType, 'server'>;

/**
 * Описывает стратегию действия для expected failure в runtime-адаптере.
 */
export type ExpectedFailureAction =
  | 'inline'
  | 'interrupt:notFound'
  | 'interrupt:unauthorized'
  | 'interrupt:forbidden'
  | 'redirect';

/**
 * Описывает один issue после нормализации для frontend policy/UI слоя.
 */
export interface NormalizedIssue {
  /**
   * Машиночитаемый код issue.
   */
  code: string;

  /**
   * Исходное backend-сообщение issue.
   */
  message: string;

  /**
   * Путь к полю в `dot notation`, если issue привязана к конкретной части payload.
   */
  path?: string;

  /**
   * Признак global/root issue без привязки к конкретному пути.
   */
  isGlobal: boolean;
}

/**
 * Описывает expected failure, с которым route или adapter умеет работать штатно.
 */
export interface ExpectedFailure {
  /**
   * Категория ошибки `STD-001`.
   */
  type: ExpectedStdErrorType;

  /**
   * Envelope-level код ошибки.
   */
  code: string;

  /**
   * HTTP status ответа, если он известен.
   */
  status?: number;

  /**
   * Идентификатор запроса для диагностики.
   */
  requestId?: string;

  /**
   * Action, выбранный policy-слоем для runtime-адаптера.
   */
  action: ExpectedFailureAction;

  /**
   * Ключ project-level каталога пользовательских сообщений.
   */
  catalogKey: string;

  /**
   * Нормализованные issues, если они есть.
   */
  issues: NormalizedIssue[];

  /**
   * URL назначения для сценариев с `redirect`.
   */
  redirectTo?: string;
}

/**
 * Описывает категорию fatal failure, которую нельзя обрабатывать как expected flow.
 */
export type FatalFailureKind = 'server' | 'transport' | 'contract' | 'unexpected';

/**
 * Описывает fatal failure, который должен эскалироваться в error boundary или logging.
 */
export interface FatalFailure {
  /**
   * Категория fatal failure.
   */
  kind: FatalFailureKind;

  /**
   * HTTP status ответа, если он известен.
   */
  status?: number;

  /**
   * Envelope-level код backend-ошибки, если он был доступен.
   */
  code?: string;

  /**
   * Идентификатор запроса для трассировки.
   */
  requestId?: string;

  /**
   * Диагностические данные для логирования и observability.
   */
  diagnostics: {
    source: StdFailureSource;
    message?: string;
    cause?: unknown;
    rawBody?: unknown;
  };
}

/**
 * Описывает результат нормализации remote failure.
 */
export type NormalizedFailure = ExpectedFailure | FatalFailure;

/**
 * Описывает policy rule без redirect-навигации.
 */
export interface NonRedirectStdErrorPolicyRule {
  /**
   * Action, не требующий `redirectTo`.
   */
  action: Exclude<ExpectedFailureAction, 'redirect'>;

  /**
   * Ключ project-level каталога сообщений.
   */
  catalogKey: string;

  /**
   * Для non-redirect action поле не используется.
   */
  redirectTo?: never;
}

/**
 * Описывает policy rule для сценариев с redirect.
 */
export interface RedirectStdErrorPolicyRule {
  /**
   * Action redirect-сценария.
   */
  action: 'redirect';

  /**
   * Ключ project-level каталога сообщений.
   */
  catalogKey: string;

  /**
   * URL назначения для redirect.
   */
  redirectTo: string;
}

/**
 * Описывает одно project-level правило обработки expected failure.
 */
export type StdErrorPolicyRule = NonRedirectStdErrorPolicyRule | RedirectStdErrorPolicyRule;

/**
 * Описывает policy-конфигурацию обработки `STD-001` ошибок.
 */
export interface StdErrorPolicy {
  /**
   * Специфичные правила для envelope-level кодов ошибок.
   */
  byCode?: Partial<Record<string, StdErrorPolicyRule>>;

  /**
   * Базовые правила по expected типам ошибок.
   *
   * @remarks
   * Карта должна быть полной, чтобы `core` не бросал generic runtime-ошибки
   * из-за неполной policy-конфигурации.
   */
  byType: Record<ExpectedStdErrorType, StdErrorPolicyRule>;
}
