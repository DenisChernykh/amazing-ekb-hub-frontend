# API Integration

## Source of Truth

1. `../amazing-ekb-hub-backend/docs/api/specification.yaml`
2. `../amazing-ekb-hub-backend/docs/api/error-response-standard.md`

Frontend не определяет собственный backend contract.
Frontend только генерирует client schema, валидирует runtime payload и адаптирует backend responses под свой runtime flow.

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
  -> module/server
    -> module/api
      -> shared/api
        -> typed HTTP client
```

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

## Module API Contract

Новые модули используют throw-based module API.

Примерно:

- `module/api` возвращает доменную модель на success;
- `module/api` бросает typed runtime error на failure.

Это означает, что `module/server` и route-level loaders работают с обычным `async/await` success flow, а ветвление по ошибкам делегируется `std-errors`.

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

## Rules For New Modules

1. Новый модуль должен иметь собственный `api` слой.
2. Новый `api` слой должен возвращать доменные модели, а не transport DTO.
3. Новый `api` слой должен использовать throw-based bridge.
4. Новый `server` слой должен быть server-only entrypoint для route loaders.
5. Route не должен обращаться к transport или DTO напрямую.
6. Route не должен повторно валидировать API payload, уже провалидированный в `module/api`.

## Legacy Pattern Status

Исторический result-first flow и legacy failure normalization могут оставаться в существующем коде, но не считаются preferred pattern для новых RSC routes.

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
