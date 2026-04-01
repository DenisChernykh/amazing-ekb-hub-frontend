# Frontend Architecture

## Architectural Style

Frontend построен на Next.js App Router и Material UI.

Целевая архитектура для новых экранов:

- server-first data loading;
- route-centric `app` слой;
- vertical domain modules в `src/modules`;
- generic reusable primitives в `src/shared`;
- throw-based API bridge;
- единый `std-errors` flow для server-side ошибок.

## Layer Model

### `src/app`

`app` — это framework integration layer.

Он отвечает за:

- `page.tsx`
- `loading.tsx`
- `error.tsx`
- route-private `_lib`
- route-private `_components`

`app` знает про:

- `params`
- `searchParams`
- route-specific href
- page-level composition
- Next interrupt behavior

`app` не должен содержать reusable domain logic.

### `src/modules`

`modules` — это доменные вертикальные срезы.

Типичная структура модуля:

- `api`
- `model`
- `server`
- `ui`

`modules` содержат:

- доменные типы;
- pure helpers;
- throw-based data-access API;
- server-side loaders/use cases;
- reusable domain UI и view models.

### `src/shared`

`shared` — это generic cross-cutting layer.

Содержит:

- `api`
- `errors`
- `ui`
- `lib`
- `config`

`shared` не должен знать ни о конкретных модулях, ни о route-specific бизнес-логике.

## Import Rules

1. `app` может импортировать `modules` и `shared`.
2. `modules` могут импортировать `shared`.
3. `modules` не должны импортировать `app`.
4. `shared` не должен импортировать `modules` и `app`.
5. Route должен предпочитать public API модуля, а не deep-import во внутренности.
6. Внутри самого модуля допустимы private imports между подслоями модуля.

## Route Pattern

Новый route по умолчанию состоит из:

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

Высокоуровневое правило:

1. `page.tsx` остается тонким route entrypoint.
2. Route-specific orchestration живет в `_lib`.
3. Route-private композиция живет в `_components`.

Подробный рецепт структуры route и обязанностей `_lib/*` описан в `docs/architecture/server-first-screen-pattern.md`.

## Module Pattern

Новый модуль по умолчанию строится так:

```text
src/modules/<domain>/
  api/
  model/
  server/
  ui/
  index.ts
```

### `api`

Отвечает за:

- transport integration;
- DTO validation;
- DTO -> model mapping;
- throw-based module API.

### `model`

Отвечает за:

- entity types;
- query params types/builders;
- display helpers;
- pure functions.

### `server`

Отвечает за:

- server-only use cases;
- bound module API for server runtime;
- use-case specific loaders.

### `ui`

Отвечает за:

- reusable domain components;
- view-model builders;
- stateful section components;
- domain-level presentation.

## UI Ownership

### UI in `app`

UI в `app` — это route-level UI.

Он отвечает за:

- screen composition;
- route-private states;
- page-level layout;
- binding between multiple modules.

### UI in `modules`

UI в `modules` — это reusable domain UI.

Он отвечает за:

- представление доменных сущностей;
- presentation sections;
- domain-level state components;
- reusable view models.

## State Component Rules

1. Stateful section components используют thin switch и отдельные state components.
2. Route-level `Content` может иметь `failure-state` и `success-state`.
3. `success-state` оправдан, если содержит собственную screen composition.
4. Thin proxy component без собственной композиции допустим только осознанно ради консистентности.
5. Leaf-компоненты не должны искусственно получать `empty/error`, если у них нет реального state ownership.

Практические примеры и более подробные UI-правила вынесены в `docs/architecture/server-first-screen-pattern.md`.

## Data Loading Model

Новые страницы используют server-first flow:

1. route normalizes input;
2. route/private page-data loader calls module/server;
3. module/server calls module/api;
4. module/api uses `shared/api` bridge;
5. route receives success or normalized failure through `std-errors`.

## Error Handling Model

Новый server-side error flow использует:

- throw-based API bridge в `src/shared/api`;
- `std-errors` core и app-facing helpers в `src/server/std-errors`;
- shared reusable error UI в `src/shared/errors`.

Route-level outcome:

- success render;
- inline expected failure;
- section-level degradation for non-critical requests;
- fatal route boundary via `error.tsx`.

Подробности expected/fatal/non-critical flow и app-facing helpers описаны в `docs/architecture/std-001-rsc-error-library.md`.

## Reference Routes

Текущие reference implementations:

- `src/app/draft/home`
- `src/app/draft/places/[placeId]`

Они демонстрируют:

- route-private `_lib` split;
- route-private `_components`;
- `modules/place`;
- `modules/material`;
- `shared/errors`;
- `std-errors` server flow.

## Legacy Status

Legacy `features`, `entities`, `app/di` и result-first flow могут продолжать существовать, но не являются preferred pattern для новых server-first экранов.

## Non-Goals

На текущем этапе архитектура не ставит целью:

1. немедленный полный переход на FSD;
2. полную миграцию legacy-кода за один шаг;
3. отказ от всех существующих legacy abstraction layers;
4. превращение `app` в FSD-style слой.

## Related Documents

- `docs/adr/ADR-0005-server-first-modular-frontend.md`
- `docs/architecture/api-integration.md`
- `docs/architecture/std-001-rsc-error-library.md`
- `docs/architecture/server-first-screen-pattern.md`
