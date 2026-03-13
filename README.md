# Amazing EKB Hub Frontend

Frontend для MVP "Гид по местам".

## Стек

- Next.js 16
- React 19
- TypeScript
- Chakra UI 3
- ESLint 9
- Prettier 3
- Husky 9
- GitHub Actions

## Быстрый старт

1. `pnpm install`
2. `cp .env.example .env.local`
3. Убедиться, что локальный backend из соседнего репозитория запущен на `http://127.0.0.1:3000`
4. `pnpm dev`
5. Открыть `http://localhost:3001`

## Локальная API-связка

1. Frontend в dev-режиме по умолчанию запускается на `http://localhost:3001`.
2. Backend локально остаётся на `http://127.0.0.1:3000`.
3. Browser и frontend-клиент обращаются к backend через same-origin путь `/v1`.
4. В локальной разработке Next rewrites проксируют `/v1/:path*` на `API_PROXY_TARGET`.
5. `API_PROXY_TARGET` — server-only переменная; backend origin не должен публиковаться через `NEXT_PUBLIC_*`.
6. В production со схемой “frontend и backend на одном домене” маршрут `/v1/:path*` должен проксироваться на backend внешней инфраструктурой.

## Основные команды

- `pnpm lint`
- `pnpm lint:strict`
- `pnpm typegen`
- `pnpm typecheck`
- `pnpm format`
- `pnpm format:check`
- `pnpm build`
- `pnpm start`

## Проверки качества

- Текущий обязательный frontend-набор перед push / PR:
  - `pnpm format:check`
  - `pnpm lint:strict`
  - `pnpm typecheck`
  - `pnpm build`
- `pre-commit` запускает `lint-staged` и форматирует только staged-файлы.
- `commit-msg` проверяет Conventional Commits.
- `pre-push` проверяет имя ветки, `format:check`, `lint:strict`, `typecheck` и `build`.
- CI в GitHub Actions воспроизводит обязательные проверки для PR в `stage` и `main`.

## Тестирование

- Сейчас отдельный frontend test tooling ещё не внедрён.
- Целевой объём автоматизации зафиксирован в `docs/testing/test-strategy.md`.
- Планируемые команды после внедрения test tooling:
  - `pnpm test:unit`
  - `pnpm test:e2e`
  - `pnpm test:coverage`
- До появления этих команд hooks и CI не должны считать их уже внедрёнными.

## Источники истины

- Product spec: `../amazing-ekb-hub-backend/docs/MVP_SPEC.md`
- API contract: `../amazing-ekb-hub-backend/docs/api/specification.yaml`
- Error standard: `../amazing-ekb-hub-backend/docs/api/error-response-standard.md`
- Design artifacts: `../amazing-ekb-hub-backend/docs/design/README.md`

## Документация

- `docs/GIT_WORKFLOW.md`
- `docs/architecture/frontend-architecture.md`
- `docs/architecture/api-integration.md`
- `docs/runbooks/local-setup.md`
- `docs/testing/test-strategy.md`
- `docs/process/definition-of-ready-done.md`
- `docs/security/security-baseline.md`
- `docs/adr/ADR-0001-next-app-router.md`
- `docs/adr/ADR-0002-chakra-ui-v3.md`
- `docs/architecture/tsdoc-guidelines.md`
