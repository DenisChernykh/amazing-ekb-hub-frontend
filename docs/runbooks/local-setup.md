# Local Setup

## Предусловия

1. Node.js 22+
2. pnpm 10+
3. Запущенный backend из соседнего репозитория

## Первый запуск

1. `pnpm install`
2. `pnpm dev`

## Проверка перед merge

1. `pnpm lint:strict`
2. `pnpm typecheck`
3. `pnpm build`

## Планируемый test workflow

1. После внедрения frontend test tooling локально должны появиться команды:
   - `pnpm test:unit`
   - `pnpm test:e2e`
   - `pnpm test:coverage`
2. `pnpm test:e2e` должен запускаться при поднятом backend с seed-данными.
3. До появления этих команд ориентиром служит `docs/testing/test-strategy.md`.
