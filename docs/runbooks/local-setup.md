# Local Setup

## Предусловия

1. Node.js 22+
2. pnpm 10+
3. Запущенный backend из соседнего репозитория

## Первый запуск

1. `pnpm install`
2. `pnpm dev`

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

## Планируемый test workflow

1. После внедрения frontend test tooling локально должны появиться команды:
   - `pnpm test:unit`
   - `pnpm test:e2e`
   - `pnpm test:coverage`
2. `pnpm test:e2e` должен запускаться при поднятом backend с seed-данными.
3. До появления этих команд ориентиром служит `docs/testing/test-strategy.md`.
