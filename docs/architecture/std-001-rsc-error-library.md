# STD-001 RSC Error Library

## Purpose

Этот документ фиксирует новый server-side контур обработки backend-ошибок `STD-001` для Next.js App Router.

Библиотека нужна для того, чтобы:

1. единообразно отличать expected failures от fatal failures;
2. не смешивать route logic и data-access error handling;
3. дать повторяемый pattern для новых server-first страниц;
4. поддерживать как page-level, так и section-level error handling.

## Scope

Версия v1 покрывает:

- `page.tsx`
- `layout.tsx`
- route-private page loaders
- server-side data loading в Next App Router
- route-level inline failures
- fatal route boundaries
- non-critical section degradation

В scope v1 не входят:

- Server Actions
- Route Handlers
- browser runtime
- client-side fetching adapters
- полная миграция legacy `shared/failures`

## Layered Architecture

### 1. `src/lib/std-errors`

Framework-agnostic core.

Отвечает за:

- parsing и validation `STD-001`;
- classification expected/fatal;
- policy resolution;
- extraction `requestId`;
- normalized issues;
- diagnostics.

### 2. `src/server/std-errors`

Next.js adapter и app-facing integration layer.

Отвечает за:

- execution of server request flow;
- app-level policy defaults;
- Next interrupts;
- page-level helper APIs;
- non-critical request execution.

### 3. `src/shared/api`

Throw-based bridge между transport и `std-errors`.

Отвечает за:

- success unwrap;
- runtime error mapping;
- contract failure reporting input.

### 4. `src/shared/errors`

Reusable UI layer для нормализованных failures.

Отвечает за:

- generic inline expected failure UI;
- generic route fatal error UI;
- shared error catalog.

## Failure Categories

### Expected failures

Expected failures принадлежат штатному бизнес-flow и могут быть показаны пользователю без `error.tsx`.

К ним относятся:

- `validation`
- `domain`
- `auth`
- `permission`
- `not_found`

### Fatal failures

Fatal failures не считаются штатной веткой UI и должны эскалироваться в boundary/logging.

К ним относятся:

- `server`
- transport failures
- contract failures
- unexpected runtime failures

### Non-critical failures

Non-critical failures — это failures второстепенных section-level запросов, которые не должны ронять страницу целиком.

Они нужны для сценариев вида:

- route-critical primary request succeeds;
- secondary section request fails;
- route remains renderable;
- specific section shows error state.

## App-Facing APIs

### `executeAppRscRequest`

Основной helper для page-level server requests.

Используется там, где request является route-critical.

Route outcome:

- success render;
- inline expected failure;
- fatal boundary.

### `createAppRscErrorPolicy`

Project-facing helper для сборки app policy.

Используется для настройки:

- inline expected failure;
- `notFound()`;
- `redirect()`;
- auth/permission interrupts;
- catalog keys.

### `executeNonCriticalRequest`

Helper для section-level best-effort requests.

Используется там, где failure допустим локально и не должен ломать весь экран.

Route outcome:

- success section data;
- local section error model;
- optional requestId for diagnostics.

## Policy Model

Policy применяется только к expected failures.

### Priority

1. rule by `error.code`
2. rule by `error.type`

### Supported actions

- `inline`
- `interrupt:notFound`
- `interrupt:unauthorized`
- `interrupt:forbidden`
- `redirect`

### Default expectations

1. `validation` -> usually `inline`
2. `domain` -> usually `inline`
3. `not_found` -> usually `interrupt:notFound`
4. `auth` -> project-defined mode
5. `permission` -> project-defined mode
6. `server` is never expected

## Route Usage Pattern

Новый route-level pattern:

1. route normalizes input;
2. route builds page-data request;
3. route executes critical request через `executeAppRscRequest`;
4. route renders:
   - success screen;
   - inline failure;
   - or fatal boundary.

Для non-critical sections:

1. page-data loader executes secondary request через `executeNonCriticalRequest`;
2. loader stores section result as `success | error`;
3. module/ui renders section-specific success/error/empty state.

## UI Ownership

`std-errors` не владеет screen-specific copy.

Библиотека возвращает:

- `type`
- `code`
- `catalogKey`
- `issues`
- `requestId`

Проект владеет:

- user-facing texts;
- localization;
- screen-specific overrides;
- section-specific error copy.

### Shared UI Layer

`src/shared/errors` содержит generic reusable UI:

- inline expected failure state;
- route fatal error state;
- shared generic catalog.

### Route And Screen Ownership

Route-level или screen-level code может:

- выбрать `catalogKey`;
- переопределить generic title/description;
- деградировать section в local error state.

## Observability

`requestId` должен сохраняться в максимально возможном числе веток.

Приоритет источников:

1. `meta.requestId` из валидного `STD-001`
2. best-effort extracted requestId
3. transport/header request id

Fatal failures должны сохранять diagnostics, достаточные для расследования contract и runtime ошибок.

## Reference Patterns

Reference routes:

- `src/app/draft/home`
- `src/app/draft/places/[placeId]`

Reference shared UI:

- `src/shared/errors`

Reference app-facing helpers:

- `src/server/std-errors`

## Limits

Этот контур не заменяет мгновенно весь legacy error handling.
Он является target pattern для новых server-first экранов и внедряется постепенно.
