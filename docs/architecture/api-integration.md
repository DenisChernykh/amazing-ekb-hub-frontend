# API Integration

## Source of Truth

1. Backend OpenAPI document served from `/docs/openapi.yaml`.
2. Local frontend snapshot: `openapi.yaml`.

Frontend не определяет собственный backend contract.
Frontend только генерирует client schema, валидирует runtime payload и адаптирует backend responses под свой runtime flow.

Локальный snapshot обновляется командой `pnpm run api:update`. По умолчанию она читает
удаленный backend `https://api.strelchukgo.ru/docs/openapi.yaml`; для ручной синхронизации
можно передать `OPENAPI_SPEC_SOURCE=/path/to/openapi.yaml pnpm run api:update`.

## Core Rules

1. Любое изменение API сначала фиксируется в backend.
2. Frontend ориентируется на machine-readable shape:
   - `error.type`
   - `error.code`
   - `issues[*].code`
   - `requestId`
3. Raw backend `message` не используется как source of truth для UI branching.
4. Канонический frontend base path для backend API — `/v1`.
5. Typed client строится от generated schema в `src/shared/api`.
6. Для новых server-first сценариев используется throw-based API bridge.
7. Для route-level branching используется `std-errors`, а не data-access слой.
8. Legacy result-first pattern может временно сосуществовать, но не является target pattern для новых RSC-страниц.

## Base URL And Routing Model

1. Browser runtime использует same-origin путь `/v1`.
2. В локальной разработке Next rewrites проксируют `/v1/*` на backend target.
3. В production same-origin `/v1` должен быть настроен внешней инфраструктурой.
4. Server-side код Next не должен напрямую полагаться на относительный `/v1`.
5. Server-side base URL должен строиться как absolute URL от текущего request origin.

## Target Server-Side Data Flow

Новый target flow для server-side страниц:

1. route нормализует input;
2. route вызывает route-private page-data loader;
3. page-data loader вызывает `module/server`;
4. `module/server` вызывает `module/api`;
5. `module/api` использует `shared/api` throw-based bridge;
6. runtime error нормализуется через `std-errors`;
7. route решает, рендерить ли success, inline failure, degradation или fatal boundary.

Схема:

```text
route
  -> app/_lib page-data loader
    -> entity/api or shared/generated client
      -> entity mapper
        -> widget model
```

## Frontend Contract Models

UI не должен напрямую зависеть от backend DTO, если DTO неудобен для отображения или backend contract еще догоняет frontend.

Правила:

1. DTO остается transport/API формой.
2. Frontend contract type живет в `entities/<entity>/model`.
3. Mapper переводит DTO в UI model.
4. Mapper нормализует пустые строки, `null`, отсутствующие поля и временные mock-значения.
5. UI-компоненты получают уже готовую UI model.

Пример:

```text
PlaceSummary
  -> mapPlaceSummaryToCardModel
    -> PlaceCardModel
      -> PlaceCard
```

## Frontend Ahead Of Backend

Если frontend делает UI раньше backend:

1. Сначала фиксируется желаемая frontend UI model.
2. Недостающие backend-поля временно mock-аются в mapper.
3. Mock должен быть детерминированным и явно помеченным как временный.
4. Не делать N+1 detail-запросы только ради list-card полей.
5. Когда backend добавляет поля, mapper переключается на реальные данные.
6. Generated schema обновляется отдельным коммитом.

## Throw-Based API Bridge

`src/shared/api` является runtime bridge между typed HTTP transport и route-level error normalization.

Он отвечает за:

1. unwrap success responses;
2. schema validation success payload;
3. distinction between:
   - transport/runtime failure;
   - HTTP error response;
   - success contract violation;
4. mapping runtime failures в shape, пригодный для `std-errors`.

Этот слой не должен:

1. хранить route policy;
2. рендерить UI;
3. решать `notFound()` / `redirect()` / `error.tsx`;
4. владеть пользовательскими текстами.

## Entity API Contract

Новые entity/api integrations постепенно должны двигаться к throw-based API.

Примерно:

- `entity/api` возвращает контролируемый результат или доменную модель;
- route-level loader не должен знать transport details больше необходимого;
- mapping DTO -> UI model не должен находиться в JSX.

Текущий result-first flow может временно сосуществовать, если он уже используется generated clients.

## Runtime Error Classes

Новый API bridge должен различать как минимум следующие категории:

1. transport/runtime failure;
2. error HTTP response;
3. success-payload contract failure;
4. unexpected adapter failure.

Эти категории не должны смешиваться в одном “универсальном remote failure”.

## Relationship With STD-001

`shared/api` не интерпретирует `STD-001` policy.
Он только передает в `std-errors` достаточно информации для классификации runtime failure.

`std-errors` отвечает за:

- expected vs fatal classification;
- policy application;
- interrupt behavior;
- inline failure model;
- non-critical degradation flow.

Подробный runtime contract `std-errors` описан в `docs/architecture/std-001-rsc-error-library.md`.

## Rules For New Entity Integrations

1. Новый entity slice должен иметь `model` слой для contract types и mappers.
2. API DTO не должен протекать в reusable UI.
3. Route может обращаться к entity/api или shared generated client через route-private loader.
4. Route не должен держать mapping logic внутри `page.tsx`.
5. UI copy принадлежит UI layer, а не API integration.

## Legacy Pattern Status

Исторический result-first flow, `src/views` и старые module-oriented документы могут оставаться до миграции.
Для новых пользовательских экранов целевой decomposition — `entities/features/widgets`.

## Message Ownership

UI copy не принадлежит API bridge.

API integration layer владеет:

- data shape;
- runtime diagnostics;
- failure classification input.

UI layer владеет:

- `catalogKey -> message`;
- inline/fatal section copy;
- presentation details для issues и requestId.
