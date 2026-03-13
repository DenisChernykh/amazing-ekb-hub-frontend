# Local Setup

## Предусловия

1. Node.js 22+
2. pnpm 10+
3. Запущенный backend из соседнего репозитория на `http://127.0.0.1:3000`

## Первый запуск

1. `pnpm install`
2. `cp .env.example .env.local`
3. Проверить, что в `.env.local` указано `API_PROXY_TARGET=http://127.0.0.1:3000`
4. `pnpm dev`
5. Открыть `http://localhost:3001`

## Локальная связка frontend -> backend

1. Frontend dev server по умолчанию запускается на `3001`.
2. Backend локально использует `3000`.
3. Browser и frontend-клиент работают с same-origin путём `/v1`.
4. В локальной разработке `next.config.ts` проксирует `/v1/:path*` на `API_PROXY_TARGET`.
5. Если `API_PROXY_TARGET` не задан, frontend ожидает, что маршрут `/v1` уже настроен внешней инфраструктурой.
6. В production со схемой “frontend и backend на одном домене” проксирование `/v1/:path*` должно настраиваться на уровне reverse proxy / ingress.

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

1. Убедиться, что backend запущен на `3000`.
2. Запустить frontend: `pnpm dev`
3. Проверить проксируемый endpoint: `curl "http://localhost:3001/v1/places?page=1&pageSize=1&sort=popular"`
4. Ожидать JSON-ответ backend без CORS-ошибок.

## Планируемый test workflow

1. После внедрения frontend test tooling локально должны появиться команды:
   - `pnpm test:unit`
   - `pnpm test:e2e`
   - `pnpm test:coverage`
2. `pnpm test:e2e` должен запускаться при поднятом backend с seed-данными.
3. До появления этих команд ориентиром служит `docs/testing/test-strategy.md`.
