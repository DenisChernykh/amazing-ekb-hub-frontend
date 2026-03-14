# Frontend Architecture

## Стиль

Next.js App Router с Ant Design как основным UI toolkit.

## Правила

1. Server Components по умолчанию.
2. Client Components только для интерактива и browser-only API.
3. UI-компоненты строятся на Ant Design и обычной семантической HTML-разметке там, где это проще и надёжнее.
4. Внутренние импорты через `@/*`.

## Структура

- `src/app` — routes, layouts, providers
- `src/features` — пользовательские сценарии
- `src/entities` — place, material, favorite, user
- `src/shared` — ui, api, failures, lib, config, types

## Тестируемость

1. Pure logic в `src/shared`, `src/entities`, `src/features` должна быть пригодна для unit-тестов.
2. Route-level UI и пользовательские взаимодействия должны быть пригодны для component/integration тестов.
3. Сквозные пользовательские сценарии должны проверяться e2e-тестами на уровне приложения.
4. Source of truth для API shape и error semantics — backend contract и `docs/testing/test-strategy.md`.
5. Все remote-ошибки нормализуются в `src/shared/failures` с разделением на `api`, `contract` и `transport`.
6. Result-first утилиты из `src/shared/lib/result.ts` используются как базовый контракт data-access слоя.
