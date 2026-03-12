# API Integration

## Source of truth
1. `../amazing-ekb-hub-backend/docs/api/specification.yaml`
2. `../amazing-ekb-hub-backend/docs/api/error-response-standard.md`

## Правила
1. Frontend не заводит свой source of truth для API.
2. Любое изменение API сначала фиксируется в backend.
3. UI ориентируется на `error.type`, `error.code`, `error.message`.
