# Server-First Screen Pattern

## Goal

Этот документ описывает практический шаблон нового server-first экрана в текущей FSD-архитектуре проекта.

## Route Folder Shape

Новый route по умолчанию:

```text
src/app/<route>/
  page.tsx
  loading.tsx
  error.tsx
  _lib/
    get-<route>-page-data.ts
    normalize-<route>-search-params.ts
  _components/
    <route>-page-content.tsx
```

## FSD Slices Around Route

Если экран показывает доменную сущность или список сущностей, рядом создаются FSD-slices:

```text
src/entities/<entity>/
  api/
  model/
  lib/
  ui/
  index.ts

src/features/<feature>/
  model/
  lib/
  ui/
  index.ts

src/widgets/<widget>/
  model/
  ui/
  index.ts
```

Пример для каталога мест:

```text
src/entities/place
src/features/places-pagination
src/widgets/places-catalog
```

## Responsibilities By Layer

### `page.tsx`

Должен быть thin entrypoint:

1. получает `params`/`searchParams`;
2. вызывает route-private loader;
3. передает модель в route-private content component.

`page.tsx` не должен содержать разметку каталога, карточек, фильтров или error UI.

### `_lib`

Содержит route-only orchestration:

- query normalization;
- page-data loading;
- route-level model assembly;
- binding между API результатом и widget model.

### `_components`

Содержит route-only rendering:

- success/error switch;
- route-specific placeholders;
- composition, которая нужна только этому route.

### `entities`

Содержит reusable domain UI и model:

- frontend contract type;
- mapper/adapters;
- display helpers;
- entity card/section components.

### `features`

Содержит пользовательские действия:

- pagination;
- filtering;
- sorting;
- search controls.

### `widgets`

Содержит крупную композицию:

- catalog;
- feed;
- grid/list + controls + empty state.

## Runtime Flow

```text
page.tsx
  -> get-page-data
    -> entity/api or shared/generated API
    -> entity mapper
    -> widget model
  -> page-content
    -> widget
      -> features
      -> entities
```

## Query Normalization

Route normalization должна быть простой.

Правила:

1. Не валидировать query-параметры без необходимости.
2. Приводить типы и fallback-значения.
3. Не усложнять URL раньше, чем появился реальный UX.
4. Если pagination на первом этапе работает только с `page`, не сохранять все query-параметры “на будущее”.

## Frontend Ahead Of Backend

Если backend не отдает все поля для UI:

1. Создать frontend contract type в `entities/<entity>/model`.
2. Сделать mapper из API summary/detail в этот type.
3. Временный mock держать только в mapper.
4. Mock должен быть детерминированным.
5. UI-компоненты не должны знать, что данные временные.
6. После обновления backend менять mapper, а не UI.

Пример:

```text
PlaceSummary DTO
  -> mapPlaceSummaryToCardModel
    -> PlaceCardModel
      -> PlaceCard
```

## Material UI Pattern

User-facing UI строится через MUI.

Preferred components:

- `Container` для page width;
- `Grid` для сеток;
- `Card`, `CardActionArea`, `CardContent`, `CardMedia` для карточек;
- `Chip`, `Avatar`, `Badge` для metadata;
- `Pagination` для пагинации;
- `Alert` для ошибок;
- `CircularProgress`/`Skeleton` для loading;
- `Paper`/`Card` для empty state;
- `Typography` для текста;
- `Stack`/`Box` только как layout primitives.

Если MUI-компонент требует function component через `component={...}`, компонент должен быть client boundary.

## State Component Rules

1. Route-level content component может делать thin switch по `model.kind`.
2. Empty state принадлежит widget, если это состояние конкретной секции.
3. Error state принадлежит route/shared, если это route-level failure.
4. Leaf-компоненты не получают artificial `empty/error`, если они не владеют состоянием.
5. Optional fragments лучше оформлять через early return или отдельный state component.

## Checklist For New Screen

1. `page.tsx` тонкий.
2. Route input normalization живет в `_lib`.
3. Page-data loader живет в `_lib`.
4. Route switch живет в `_components`.
5. Domain UI живет в `entities`/`widgets`.
6. User action UI живет в `features`.
7. UI построен через MUI native components.
8. Frontend-ahead mock спрятан в mapper.
9. `pnpm lint:strict`, `pnpm typecheck`, `pnpm build` зелёные.
