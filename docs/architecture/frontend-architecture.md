# Frontend Architecture

## Стиль

Next.js App Router с Material UI как основным UI toolkit.

## Правила

1. Server Components по умолчанию.
2. Client Components только для интерактива и browser-only API.
3. UI-компоненты строятся на Material UI и обычной семантической HTML-разметке там, где это проще и надёжнее.
4. Визуальный слой по умолчанию опирается на stock Material UI look; кастомная верстка и кастомные theme overrides должны оставаться минимальными.
5. Внутренние импорты через `@/*`.
6. Для server-side data loading в Next.js сначала предпочтителен server-first подход через `app` page + `app/di`, а не client-side query cache.

## Структура

- `src/app` — routes, layouts, providers, route-level loading и app DI
- `src/features` — пользовательские сценарии и presentation/model слой для экранов
- `src/entities` — бизнес-сущности и их result-first data-access API
- `src/shared` — ui, api, failures, lib, config, types

## Текущий home-контур

Текущая версия home-ленты мест собрана по server-first схеме с тонким route entrypoint и page-specific feature-слоем:

- `src/app/page.tsx` — thin route-level server page: получает `searchParams`, делегирует их нормализацию в `features/home-page`, загружает данные через `app/di/place` и рендерит `HomePageContent`.
- `src/app/loading.tsx` — route-level loading для home.
- `src/app/di/place.ts` — server-side bridge между Next runtime и entity `place`; создает bound API и загружает список мест без home-specific defaults.
- `src/entities/place` — доменные типы списка мест, runtime helpers категорий (`PLACE_CATEGORIES`, `isPlaceCategory`) и result-first API загрузки `GET /places`.
- `src/features/home-page` — page-specific feature для главной: нормализация query params и page-level композиция home-экрана.
- `src/features/place-feed` — presentation/model слой home-ленты: `PlaceFeedViewModel`, builder состояний `success/empty/error`, mapper `PlaceSummary -> PlaceCardViewModel`, компоненты `PlaceFeed`, `PlaceCard` и `PlaceFeedSkeleton`.
- `src/app/places/[placeId]/page.tsx` — временный route-заглушка для перехода с карточки.

Home пока не использует `TanStack Query`: для текущего сценария загрузка списка выполняется на сервере через Next App Router.

## Тестируемость

1. Pure logic в `src/shared`, `src/entities`, `src/features` должна быть пригодна для unit-тестов.
2. Query-param resolver главной страницы, feed builder и card mapper должны оставаться pure-функциями без зависимости от Next runtime и UI toolkit.
3. Route-level UI и пользовательские взаимодействия должны быть пригодны для component/integration тестов.
4. Сквозные пользовательские сценарии должны проверяться e2e-тестами на уровне приложения.
5. Source of truth для API shape и error semantics — backend contract и `docs/testing/test-strategy.md`.
6. Все remote-ошибки нормализуются в `src/shared/failures` с разделением на `api`, `contract` и `transport`.
7. Result-first утилиты из `src/shared/lib/result.ts` используются как базовый контракт data-access слоя.
