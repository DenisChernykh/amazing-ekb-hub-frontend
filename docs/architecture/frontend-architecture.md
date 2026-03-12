# Frontend Architecture

## Стиль

Next.js App Router с Chakra UI как основным UI toolkit.

## Правила

1. Server Components по умолчанию.
2. Client Components только для интерактива и browser-only API.
3. UI-компоненты строятся на Chakra UI.
4. Внутренние импорты через `@/*`.

## Структура

- `src/app` — routes, layouts, providers
- `src/features` — пользовательские сценарии
- `src/entities` — place, material, favorite, user
- `src/shared` — ui, api, lib, config, types
