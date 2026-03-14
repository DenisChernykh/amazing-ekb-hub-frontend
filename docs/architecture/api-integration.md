# API Integration

## Source of truth

1. `../amazing-ekb-hub-backend/docs/api/specification.yaml`
2. `../amazing-ekb-hub-backend/docs/api/error-response-standard.md`

## Правила

1. Frontend не заводит свой source of truth для API.
2. Любое изменение API сначала фиксируется в backend.
3. UI ориентируется на `error.type`, `error.code`, `error.message`.
4. Канонический frontend base path для backend API — `/v1`.
5. Typed frontend client строится от `src/shared/api/schema.generated.ts`, сгенерированной из backend OpenAPI.
6. Raw HTTP-ответы `openapi-fetch` сначала приводятся к `HttpResult`, затем нормализуются через `src/shared/failures/to-remote-result.ts`.
7. UI и data-access слой ветвят поведение по `RemoteFailure`, `error.type` и `error.code`, а не по raw backend `message`.

## Routing model

1. Browser и frontend-клиент всегда работают с same-origin путём `/v1`.
2. В локальной разработке Next rewrites проксируют `/v1/:path*` на `${API_PROXY_TARGET}/v1/:path*`.
3. `API_PROXY_TARGET` — server-only переменная и не должна публиковаться через `NEXT_PUBLIC_*`.
4. В production со схемой “frontend и backend на одном домене” маршрут `/v1/*` должен проксироваться на backend внешней инфраструктурой.
5. Если `API_PROXY_TARGET` не задан, приложение считает, что same-origin routing для `/v1` уже настроен вне frontend runtime.
