# ADR-0004: Material UI

## Status

Accepted

## Decision

Используем Material UI как основной UI toolkit frontend вместо Ant Design.

## Consequences

1. Frontend использует единый актуальный UI toolkit без параллельной поддержки Ant Design.
2. Интеграция с Next.js App Router строится через `@mui/material-nextjs`.
3. Styling engine Material UI — Emotion.
4. Текущий этап ориентирован на stock light Material UI look без отдельной кастомной дизайн-системы.
5. Если в будущем понадобятся бренд-токены, расширенная theme customization или отдельная визуальная система, это будет оформлено отдельным архитектурным решением.
