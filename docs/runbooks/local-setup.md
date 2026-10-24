# Local Setup

## Предусловия

1. Node.js 24.x
2. pnpm 11.15.1
3. Доступный локальный backend на `http://127.0.0.1:3000`
4. Для full-stack локальной отладки можно вместо remote backend поднять соседний backend на `http://127.0.0.1:3000`

## Первый запуск

1. `pnpm install`
2. `cp .env.example .env.local`
3. Проверить, что в `.env.local` указаны `API_BASE_URL=http://127.0.0.1:3000` и `PUBLIC_BASE_URL=http://localhost:3001`
4. `pnpm dev`
5. Открыть `http://localhost:3001`

## Локальная связка frontend -> backend

1. Frontend dev server по умолчанию запускается на `3001`.
2. По умолчанию frontend проксирует `/v1/*` на локальный backend `http://127.0.0.1:3000/v1/*`.
3. Browser и frontend-клиент работают с same-origin путём `/v1`.
4. `API_BASE_URL` содержит только backend origin; Next добавляет `/v1` и в локальной разработке `next.config.ts` проксирует `/v1/:path*` на `${API_BASE_URL}/v1/:path*`.
5. `PUBLIC_BASE_URL` содержит только public frontend origin и используется server-only для metadata URL resolution.
6. Оба origin обязаны быть абсолютными `http`/`https` URL без пути, credentials, query и fragment; в production отсутствие или невалидность `PUBLIC_BASE_URL` останавливает build/runtime с безопасной configuration error.
7. `API_BASE_URL` обязателен для build/runtime вызовов из Next server-side кода, даже если внешняя инфраструктура обслуживает browser-facing same-origin `/v1`.
8. Если нужно временно работать с удаленным backend, поменять `.env.local` на origin без `/v1`, например `https://api.example.test`, и перезапустить `pnpm dev`; `PUBLIC_BASE_URL` при этом остаётся origin frontend.
9. В production со схемой “frontend и backend на одном домене” reverse proxy / ingress отвечает только за browser-facing `/v1/:path*`; server-side вызовы продолжают использовать `API_BASE_URL`.

## Tooling setup

1. После `pnpm install` автоматически инициализируется Husky через `prepare`.
2. Если hooks не появились локально, можно повторно выполнить `pnpm run prepare`.
3. Для стабильного typecheck проект использует `next typegen` перед `tsc --noEmit`.

## Проверка перед merge

1. `pnpm format:check`
2. `pnpm lint:strict`
3. `pnpm typecheck`
4. `pnpm build`

Дополнительно:

1. Проверить, что commit message соответствует Conventional Commits.
2. Проверить, что рабочая ветка соответствует шаблону `<type>/<short-name>`.

## Smoke check API proxy

1. Обновить snapshot перед проверкой proxy: `OPENAPI_SPEC_SOURCE=../backend-codex/docs/api/openapi.json pnpm run api:update`
2. Проверить backend: `curl -fsS http://127.0.0.1:3000/v1/categories >/dev/null`
3. Запустить frontend: `pnpm dev`
4. Проверить проксируемый endpoint: `curl -fsS http://localhost:3001/v1/categories >/dev/null`
5. Ожидать JSON-ответ backend без CORS-ошибок.

## Планируемый test workflow

1. После внедрения frontend test tooling локально должны появиться команды:
   - `pnpm test:unit`
   - `pnpm test:e2e`
   - `pnpm test:coverage`
2. `pnpm test:e2e` должен запускаться при поднятом backend с seed-данными.
3. До появления этих команд ориентиром служит `docs/testing/test-strategy.md`.
