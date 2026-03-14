# ADR-0003: Ant Design

## Status

Accepted

## Decision

Используем Ant Design как основной UI toolkit frontend вместо Chakra UI.

## Consequences

1. Frontend использует единый актуальный UI toolkit без параллельной поддержки Chakra UI.
2. Интеграция с Next.js App Router строится через `@ant-design/nextjs-registry`.
3. Текущий этап миграции ориентирован только на светлую тему без слоя `next-themes`.
4. Если в будущем понадобится light/dark switching или бренд-токены, это будет оформлено отдельным архитектурным решением.
