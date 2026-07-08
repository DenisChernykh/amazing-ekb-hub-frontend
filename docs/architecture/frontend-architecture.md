# Frontend Architecture

## Architectural Style

Frontend построен на Next.js App Router и FSD-слоях. Текущий UI всё ещё в основном MUI, но целевой stack для нового и мигрированного UI — Tailwind CSS + shadcn/ui.

Целевой стиль для новых экранов:

- server-first data loading;
- thin `app` routes;
- FSD decomposition через `entities`, `features`, `widgets`, `shared`;
- Tailwind CSS + shadcn/ui как целевой UI toolkit;
- mapper/adapters между backend DTO и frontend UI model;
- route-private orchestration в `app/_lib`;
- route-private rendering switch в `app/_components`.

## Layer Model

### `src/app`

`app` — framework integration layer Next.js.

Он отвечает за:

- route entrypoints: `page.tsx`, `loading.tsx`, `error.tsx`;
- `params` и `searchParams`;
- route-private loaders в `_lib`;
- route-private components в `_components`;
- route-level composition and error branching.

`app` не должен содержать reusable domain UI, display helpers или entity mapping.

### `src/entities`

`entities` — слой доменных сущностей.

Типичная структура:

```text
src/entities/<entity>/
  api/
  model/
  lib/
  ui/
  index.ts
```

Слой содержит:

- frontend contract types для сущности;
- mapper/adapters из API DTO в UI model;
- display helpers;
- reusable entity UI, например карточки;
- entity-specific API integration, если она уже существует в проекте.

### `src/features`

`features` — пользовательские действия и интерактивные сценарии.

Типичная структура:

```text
src/features/<feature>/
  model/
  lib/
  ui/
  index.ts
```

Примеры:

- pagination;
- filters;
- search;
- favorite toggle;
- sorting controls.

Feature может знать про entity model, если действие работает с конкретной сущностью.

### `src/widgets`

`widgets` — крупные композиционные блоки страницы.

Типичная структура:

```text
src/widgets/<widget>/
  model/
  ui/
  index.ts
```

Widget собирает entities и features в законченный блок: catalog, feed, sidebar, dashboard section.

### `src/shared`

`shared` — generic cross-cutting layer.

Содержит:

- generated API clients and schemas;
- generic UI;
- generic lib/helpers;
- config;
- reusable error/loading primitives.

`shared` не должен знать про `app`, `widgets`, `features`, `entities`.

## Import Rules

1. `app` может импортировать `widgets`, `features`, `entities`, `shared`.
2. `widgets` могут импортировать `features`, `entities`, `shared`.
3. `features` могут импортировать `entities`, `shared`.
4. `entities` могут импортировать `shared`.
5. `shared` не импортирует вышележащие слои.
6. Между sibling slices одного слоя не должно быть скрытой связности без явной причины.
7. Наружу slice отдаёт public API через `index.ts`.
8. Deep imports допустимы внутри одного slice.

## Route Pattern

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

Правила:

1. `page.tsx` остается thin entrypoint.
2. Data loading и query normalization живут в `_lib`.
3. Success/error switch живет в `_components`.
4. Domain rendering уходит в `widgets`/`entities`, а не в `page.tsx`.

## UI Ownership

### UI in `app`

Route-private UI:

- page content switch;
- route-only wrappers;
- temporary route placeholders;
- loading/error boundaries.

### UI in `entities`

Reusable UI конкретной сущности:

- place card;
- material badge;
- entity display sections.

### UI in `features`

UI пользовательского действия:

- pagination;
- search input;
- filter controls.

### UI in `widgets`

Page-level reusable composition:

- places catalog;
- list + controls + empty state;
- domain page sections.

## UI Toolkit Rules

Tailwind CSS + shadcn/ui — целевой UI toolkit для нового и мигрированного UI.

Material UI остаётся legacy bridge для ещё не мигрированных участков.

### New and Migrated UI

Правила:

1. shadcn/ui компоненты добавляются через CLI и живут в `src/shared/ui`.
2. Tailwind tokens в `src/app/globals.css` сохраняют текущий visual language до отдельного redesign-решения.
3. Новый UI не импортирует MUI.
4. Повторяемые состояния loading, empty, error, disabled, focus и confirmation оформляются через shared UI contracts.
5. Для каждого migration slice нужны desktop/mobile visual checks.

### Legacy MUI UI

Эти правила действуют только для ещё не мигрированных MUI-участков.

Правила:

1. Сначала искать подходящий MUI-компонент.
2. `Box` и `Stack` использовать как layout primitives.
3. Не заменять готовые MUI-компоненты ручной сборкой без причины.
4. Для карточек использовать `Card`, `CardActionArea`, `CardContent`, `CardMedia`.
5. Для пагинации использовать `Pagination`.
6. Для списков использовать `List`, `ListItem`, `ListItemText`.
7. Для ошибок использовать `Alert`.
8. Для loading использовать `CircularProgress` или `Skeleton`.
9. Для пустых состояний использовать `Paper`/`Card` + `Typography`.
10. CSS Modules не использовать в новом UI, если нет конкретного ограничения.

### Server/Client Boundary

По умолчанию компоненты остаются Server Components.

Client Component нужен, если:

- используется hook (`useRouter`, `useState`, `useEffect`);
- MUI-компоненту передается function component через `component={...}`;
- есть интерактивное клиентское состояние.

Client boundary должен быть минимальным leaf-компонентом.

## Frontend Ahead Of Backend

Если backend contract еще не готов, frontend может идти вперед при соблюдении правил:

1. UI работает с frontend contract type, а не напрямую с неполным DTO.
2. Mapper/adapters живут в `entities/<entity>/model`.
3. Temporary mock/fallback не должен попадать в JSX.
4. Mock должен быть детерминированным.
5. UI-компоненты не должны знать, что backend чего-то пока не отдает.
6. После появления backend-поля меняется mapper, а не вся UI-композиция.
7. Не делать N+1 detail-запросы ради полей, которые должны быть в list endpoint.

## Data Loading Model

Новые страницы используют server-first flow:

```text
app/page.tsx
  -> app/_lib/get-page-data
    -> entity/api or shared/generated client
      -> mapper in entity/model
        -> widget model
```

На текущем этапе result-first API integration допустим для существующих generated clients.
Throw-based bridge и `std-errors` остаются target direction для новых сложных сценариев.

## Legacy Status

`src/views` и старые result-first экраны считаются legacy.

Новые пользовательские экраны строятся через:

- `app`;
- `entities`;
- `features`;
- `widgets`;
- `shared`.

`src/modules` не является целевым слоем для новых frontend-экранов. Если старые документы или код упоминают modules, это исторический след, а не новый стандарт.

## Reference Implementation

Актуальный reference:

- `src/app/page.tsx`;
- `src/app/_lib/get-home-page-data.ts`;
- `src/app/_components/home-page-content.tsx`;
- `src/entities/place`;
- `src/features/places-pagination`;
- `src/widgets/places-catalog`.

## Related Documents

- `docs/adr/ADR-0006-tailwind-shadcn-ui-migration.md`
- `docs/architecture/mui-to-shadcn-migration-plan.md`

- `docs/architecture/server-first-screen-pattern.md`
- `docs/architecture/api-integration.md`
- `docs/architecture/std-001-rsc-error-library.md`
- `docs/adr/ADR-0004-material-ui.md`
- `docs/adr/ADR-0005-server-first-modular-frontend.md`
