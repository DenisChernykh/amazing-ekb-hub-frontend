# Server-First Screen Pattern

## Goal

Этот документ описывает практический шаблон построения нового server-first экрана в проекте.

Он нужен не для архитектурного решения, а для ежедневной реализации следующего route.

## Route Folder Shape

Новый экран по умолчанию строится так:

```text
src/app/<route>/
  page.tsx
  loading.tsx
  error.tsx
  _lib/
    query/
    page-data/
    view-model/
  _components/
```

## Responsibilities By Layer

### `page.tsx`

Должен быть thin entrypoint.

Он делает только следующее:

1. получает route input;
2. вызывает route-private loaders;
3. применяет app-facing error flow;
4. рендерит route-level screen.

### `loading.tsx`

Содержит route-level loading UI.

Он не должен повторять `page.tsx` и не должен выполнять data loading.

### `error.tsx`

Содержит route-level fatal boundary UI.

Он не должен дублировать expected failure handling.

### `_lib/query`

Содержит:

- `searchParams` types;
- query normalization;
- href builders;
- route-specific URL rules.

### `_lib/page-data`

Содержит:

- page-level data loaders;
- orchestration critical/non-critical requests;
- route-private page data shape.

### `_lib/view-model`

Содержит:

- screen-level view model types;
- screen-level view model builders;
- composition of multiple modules into one screen.

### `_components`

Содержит:

- route-private screen;
- route-private content;
- route-private actions and layout helpers.

## Module Interaction Pattern

Route использует только:

- `modules/<domain>/server` для данных;
- `modules/<domain>/ui` или root module API для reusable domain UI;
- `shared/errors` для generic error UI.

Route не должен:

- обращаться к transport напрямую;
- импортировать DTO;
- импортировать internal files из module `api/http`;
- держать доменный rendering внутри `page.tsx`.

## Recommended Runtime Flow

1. Normalize route input.
2. Execute critical page request.
3. Render success or failure content.
4. Let fatal failures go to `error.tsx`.
5. For secondary sections, use non-critical request execution and local degradation.

## View Model Pattern

### Route-level view model

Используется, когда экран собирает несколько модулей.

Признаки:

- multiple domain sections;
- route-specific href;
- route-specific actions;
- route-private layout decisions.

### Module-level view model

Используется внутри доменного модуля.

Признаки:

- reusable section state;
- domain-specific presentation;
- no route-specific knowledge.

## UI Composition Pattern

### In `app`

`app` UI отвечает за screen composition.

Примеры:

- screen
- content
- actions
- intro cards
- route-private wrappers

### In `modules`

`modules` UI отвечает за reusable domain sections.

Примеры:

- feed
- card
- summary section
- counters section
- platform section

## State Component Rules

1. Stateful section components используют thin root component и отдельные state files.
2. Route-level `Content` может иметь `failure-state` и `success-state`.
3. `success-state` нужен, если он содержит собственную композицию.
4. Если success-state является чистым прокси в один child component, его можно не выносить, если консистентность не важнее.
5. Optional fragment лучше оформлять через:
   - `if (...) return null`
   - `condition && <Block />`
6. Большие inline ternary blocks не рекомендуются.
7. Private subparts можно держать рядом с основным компонентом, если они не являются public API.

## Practical Heuristics

### Component belongs in `app` if

1. Он знает конкретный route.
2. Он знает `backHref`, `params`, `searchParams`.
3. Он собирает несколько модулей в один screen.
4. Он нужен только одному маршруту.

### Component belongs in `modules` if

1. Он представляет доменную сущность или секцию.
2. Он не знает route path.
3. Он может быть переиспользован на другом экране.
4. Он получает уже готовый view model.

## Error Handling Pattern

### Critical request

Использовать `executeAppRscRequest`.

### Non-critical section request

Использовать `executeNonCriticalRequest`.

### Generic UI

Использовать `src/shared/errors`.

## Reference Screens

### `src/app/draft/home`

Показывает:

- простой list route;
- route-private content;
- page-data loader;
- screen-level view model;
- domain feed UI.

### `src/app/draft/places/[placeId]`

Показывает:

- route-critical primary request;
- non-critical section requests;
- route-private query/page-data/view-model split;
- domain UI from multiple modules.

## Checklist For New Screen

1. Создан thin `page.tsx`.
2. Созданы `loading.tsx` и `error.tsx`.
3. Есть `_lib/query`, если у route есть input normalization или href building.
4. Есть `_lib/page-data`, если route orchestration нетривиален.
5. Есть `_lib/view-model`, если экран собирает несколько модулей.
6. Route imports only public module APIs.
7. Domain UI lives in `modules`, not in `app`.
8. Expected, fatal и non-critical failures разделены.
9. Screen composition не утекла в `page.tsx`.
10. `pnpm typecheck` и `pnpm lint:strict` зелёные.
