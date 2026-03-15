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
6. В browser runtime frontend по-прежнему использует same-origin base path `/v1`.
7. В server-side коде Next.js (`app` routes, server components, `src/app/di/*`) относительный base path `/v1` не должен использоваться напрямую, потому что Node runtime требует абсолютный URL.
8. Для server-side API-вызовов absolute base URL должен строиться от текущего request origin через server-only helper `src/shared/api/server.ts`.
9. Источник origin для server-side вызовов: `x-forwarded-proto` + `x-forwarded-host`, fallback на `host`.

## Next.js server-side note

В текущем frontend browser и server runtime используют один и тот же backend route `/v1`, но по-разному инициализируют base URL:

- browser-код может безопасно работать с относительным `/v1`;
- server-side код Next должен сначала восстановить absolute origin запроса, а затем строить URL вида `http://<host>/v1`.

Это правило нужно соблюдать для всех server-side data-access сценариев, чтобы не получать runtime-ошибку вида `Failed to parse URL from /v1/...`.
