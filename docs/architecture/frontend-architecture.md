# Frontend Architecture

## Стиль

Next.js App Router с Ant Design как основным UI toolkit.

## Правила

1. Server Components по умолчанию.
2. Client Components только для интерактива и browser-only API.
3. UI-компоненты строятся на Ant Design и обычной семантической HTML-разметке там, где это проще и надёжнее.
4. Внутренние импорты через `@/*`.
5. Для server-side data loading в Next.js сначала предпочтителен server-first подход через `app` page + `app/di`, а не client-side query cache.

## Структура

- `src/app` — routes, layouts, providers, route-level loading и app DI
- `src/features` — пользовательские сценарии и presentation/model слой для экранов
- `src/entities` — бизнес-сущности и их result-first data-access API
- `src/shared` — ui, api, failures, lib, config, types

## Текущий home-контур

Первая версия home-ленты мест собрана по server-first схеме:

- `src/app/page.tsx` — route-level server page, читает `searchParams`, нормализует `page/search/category` и вызывает app DI.
- `src/app/loading.tsx` — route-level loading для home.
- `src/app/di/place.ts` — server-side bridge между Next runtime и entity `place`.
- `src/entities/place` — типы списка мест и result-first API загрузки `GET /places`.
- `src/features/place-feed` — presentation/model слой home-ленты: `success`, `empty`, `error`, карточки и skeleton.
- `src/app/places/[placeId]/page.tsx` — временный route-заглушка для перехода с карточки.

Home пока не использует `TanStack Query`: для текущего сценария загрузка списка выполняется на сервере через Next App Router.

## Тестируемость

1. Pure logic в `src/shared`, `src/entities`, `src/features` должна быть пригодна для unit-тестов.
2. Route-level UI и пользовательские взаимодействия должны быть пригодны для component/integration тестов.
3. Сквозные пользовательские сценарии должны проверяться e2e-тестами на уровне приложения.
4. Source of truth для API shape и error semantics — backend contract и `docs/testing/test-strategy.md`.
5. Все remote-ошибки нормализуются в `src/shared/failures` с разделением на `api`, `contract` и `transport`.
6. Result-first утилиты из `src/shared/lib/result.ts` используются как базовый контракт data-access слоя.
