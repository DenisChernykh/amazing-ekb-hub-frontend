# STD-001 RSC Error Library

## Назначение

Этот документ фиксирует архитектуру shared-библиотеки обработки backend-ошибок `STD-001` для frontend-приложения на Next.js App Router.

Документ описывает:

- переносимое `core`-ядро обработки `STD-001`;
- `next-rsc` adapter для server components;
- границы первой версии;
- ожидаемое поведение для `validation`, `domain`, `auth`, `permission`, `not_found` и `server`;
- roadmap следующих версий.

Этот документ не описывает текущую legacy-реализацию `src/shared/failures` как целевую архитектуру.
Он задаёт целевую библиотеку, которую можно переносить между проектами.

## Source of truth

1. `../amazing-ekb-hub-backend/docs/api/error-response-standard.md`
2. `../amazing-ekb-hub-backend/docs/api/specification.yaml`

Frontend не определяет собственный формат backend-ошибок.
Библиотека только валидирует, классифицирует и адаптирует `STD-001` под server runtime.

## Цели библиотеки

1. Единообразно отличать expected API failures от fatal runtime failures.
2. Не смешивать `STD-001` ошибки с transport-level и contract-level сбоями.
3. Дать переносимое `core`, не зависящее от `Next.js`, `React`, `openapi-fetch` и конкретного проекта.
4. Вынести platform-specific поведение (`notFound()`, `redirect()`, `unauthorized()`, `forbidden()`) в отдельный adapter.
5. Не использовать raw backend `error.message` как пользовательский UI-текст.
6. Сохранять `requestId` для observability и support/debugging flow.

## Scope v1

Первая версия библиотеки покрывает только server-side data loading в Next.js:

- `page.tsx`
- `layout.tsx`
- shared server loaders
- route-level orchestration для server components

В первую версию не входят:

- Server Actions
- Route Handlers
- browser runtime
- client components
- global UI error rendering
- полная миграция существующего `src/shared/failures`

## Архитектура

Библиотека состоит из двух слоёв.

### 1. `core`

Папка: `src/lib/std-errors`

`core` не зависит от:

- `next/*`
- `react`
- конкретного HTTP-клиента
- generated OpenAPI types
- route path проекта

`core` отвечает за:

- типы `StdErrorEnvelope`, `ExpectedFailure`, `FatalFailure`, `StdErrorPolicy`;
- runtime-валидацию `STD-001`;
- извлечение `requestId`;
- нормализацию `issues`;
- классификацию `expected` / `fatal`;
- policy resolution по `error.code` и `error.type`.

### 2. `next-rsc` adapter

Папка: `src/server/std-errors`

`next-rsc` adapter зависит от `next/navigation` и отвечает за:

- выполнение server request flow;
- безопасную работу с `notFound()`, `redirect()` и другими Next interrupts;
- capability-aware policy для `auth` и `permission`;
- преобразование expected failure в:
  - inline failure model;
  - `notFound()`;
  - `redirect()`;
  - `unauthorized()` / `forbidden()`, если включён `authInterrupts`.

## Expected и fatal failures

### Expected failures

Expected failures относятся к штатному бизнес-flow и могут быть обработаны без `error.tsx`.

К ним относятся:

- `validation`
- `domain`
- `auth`
- `permission`
- `not_found`

Такие ошибки нормализуются в `ExpectedFailure` и получают:

- `type`
- `code`
- `status`
- `requestId`
- `action`
- `catalogKey`
- `issues`

### Fatal failures

Fatal failures не считаются штатной веткой UI/data flow и должны эскалироваться в boundary/logging.

К ним относятся:

- `server`
- transport failures
- contract failures
- unexpected runtime failures

Такие ошибки нормализуются в `FatalFailure` и получают:

- `kind`
- `status`
- `code`, если он доступен
- `requestId`, если он доступен
- `diagnostics`

## Policy model

Project-level policy определяет, что делать с expected failures.

### Приоритет правил

1. правило по `error.code`
2. правило по `error.type`

`error.message` не участвует в branching-логике.

### Возможные actions

- `inline`
- `interrupt:notFound`
- `interrupt:unauthorized`
- `interrupt:forbidden`
- `redirect`

### Общие правила v1

- `validation` -> по умолчанию `inline`
- `domain` -> по умолчанию `inline`
- `not_found` -> по умолчанию `interrupt:notFound`
- `auth` -> по умолчанию `inline`, если проект явно не выбрал другой mode
- `permission` -> по умолчанию `inline`, если проект явно не выбрал другой mode
- `server` никогда не является expected failure

## Message ownership

Библиотека не владеет пользовательскими текстами ошибок.

Библиотека возвращает:

- `catalogKey`
- `type`
- `code`
- `issues`
- `requestId`

Конкретный проект отвечает за:

- локализацию;
- UI-тексты;
- маппинг `catalogKey -> user-facing message`;
- формат показа field/global issues.

Raw backend `error.message` допускается только в diagnostics и logging.

## Observability

`requestId` должен сохраняться во всех возможных ветках.

Порядок приоритета:

1. `meta.requestId` из валидного `STD-001`
2. `body.meta.requestId` при best-effort extraction для contract failure
3. `x-request-id` из headers

Если `requestId` отсутствует, библиотека не подставляет пустую строку.

## Next.js adapter rules

1. Если `notFound()` или `redirect()` уже были вызваны внутри request flow, adapter не должен их проглатывать.
2. Если общий `try/catch` неизбежен, framework-controlled interrupts должны пробрасываться обратно через `unstable_rethrow()`.
3. `unauthorized()` и `forbidden()` используются только если runtime-capability явно включена.
4. Если capability недоступна, `auth` и `permission` должны деградировать в `inline` или `redirect`, в зависимости от project policy.
5. Fatal failures не возвращаются как inline result и не маскируются под expected flow.

## Public API

### `src/lib/std-errors`

Публичный API `core` включает:

- типы `STD-001`
- parser
- helpers
- policy helpers
- `normalizeHttpFailure`
- `createDefaultStdErrorPolicy`

### `src/server/std-errors`

Публичный API `next-rsc` включает:

- `createNextRscErrorPolicy`
- `createNextRscBridge`
- `executeRscRequest`
- `resolveRscFailure`
- `RscFatalError`

## TSDoc requirements

Для всех экспортируемых сущностей библиотеки TSDoc обязателен.

Минимальные требования:

1. summary обязателен для каждого экспортируемого API;
2. `@param` обязателен для нетривиальных параметров;
3. `@returns` обязателен там, где важна контрактная ветка результата;
4. `@remarks` обязателен для side effects, platform limits и runtime caveats;
5. `@typeParam` обязателен для значимых generic API.

Язык TSDoc: русский.

## Ограничения первой версии

1. Библиотека не заменяет весь legacy `src/shared/failures` за один шаг.
2. Библиотека не решает сама, как должен выглядеть UI ошибок.
3. Библиотека не навязывает конкретный redirect route.
4. Библиотека не должна хардкодить route path проекта.
5. Библиотека не должна зависеть от entity-layer типов конкретного приложения.

## Future versions

### v2 — Server Actions

Следующая версия должна покрыть expected/fatal error flow для Server Actions:

- отдельный adapter для action mutation flow;
- согласованный контракт для form errors;
- mapping `validation/domain` в action-friendly serializable shape.

### v3 — Route Handlers

Следующая версия должна покрыть server runtime вне RSC rendering flow:

- Route Handlers;
- backend-for-frontend сценарии;
- повторное использование `core` без зависимости от `next/navigation`.

### v4 — Browser / client runtime

Если появится подтверждённый use case, библиотека может получить browser adapter:

- client-side data loading;
- query/mutation adapters;
- integration с UI error boundaries и retry policy.

### Инварианты для следующих версий

Во всех следующих версиях должны оставаться стабильными:

1. разделение `core` и platform adapter;
2. distinction между expected и fatal failures;
3. branching по `error.code` / `error.type`, а не по `error.message`;
4. project ownership над user-facing messages;
5. сохранение `requestId` для observability.

## Migration note

Текущий проект пока использует `src/shared/failures` и `RemoteFailure` как действующий runtime-контракт.

Новая библиотека должна внедряться постепенно:

- сначала как standalone shared module;
- затем через адаптеры и переходные bridge-слои;
- только после этого как канонический путь для новых server-side сценариев.
