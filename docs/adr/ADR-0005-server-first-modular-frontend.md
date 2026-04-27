# ADR-0005 Server-First FSD Frontend

## Status

Accepted

## Context

Frontend исторически развивался через смесь `app`, `views`, `entities`, result-first data access и экспериментальные module-oriented документы.

Практическая реализация каталога мест показала более подходящий для проекта формат:

1. Next App Router должен оставаться тонким framework layer.
2. Доменные UI-блоки удобнее раскладываются по FSD-слоям.
3. Material UI является основным UI toolkit, и проект должен учиться мыслить через его native components.
4. Frontend иногда идет впереди backend, поэтому нужен явный mapper/adapters слой.
5. Generated schema и UI feature изменения лучше коммитить отдельно.

## Decision

Для новых пользовательских экранов принимается целевой подход:

1. `src/app` — route/framework layer.
2. `src/entities` — доменные сущности, их model/mappers/display helpers/reusable UI.
3. `src/features` — пользовательские действия и интерактивные controls.
4. `src/widgets` — крупные композиции страницы.
5. `src/shared` — generic API/UI/lib/config.
6. Server-first loading остается default.
7. Route-specific orchestration живет в `app/_lib`.
8. Route-specific rendering switch живет в `app/_components`.
9. UI строится через native Material UI components.
10. Frontend-ahead mock/fallback живет в mapper, а не в JSX.

## Why FSD Instead Of `src/modules`

`src/modules` рассматривался как промежуточный target pattern, но для текущего проекта FSD лучше по нескольким причинам:

1. Пользовательские задачи формулируются через сущности, фичи и виджеты.
2. Каталог мест естественно делится на `entities/place`, `features/places-pagination`, `widgets/places-catalog`.
3. FSD делает ownership UI очевиднее.
4. Frontend-ahead mapper удобно держать в `entities/<entity>/model`.
5. `app` остается совместимым с Next App Router и не превращается в доменный слой.

## Material UI Decision

Новый UI должен использовать MUI-native building blocks:

- `Card`, `CardActionArea`, `CardContent`, `CardMedia`;
- `Pagination`;
- `Container`, `Grid`, `Stack`, `Box`;
- `Chip`, `Avatar`;
- `Alert`, `Paper`, `CircularProgress`, `Skeleton`;
- `Typography`.

`Box` и `Stack` допустимы как layout primitives, но не как замена готового MUI-компонента.

Если MUI component требует `component={SomeFunctionComponent}`, такой leaf-компонент должен быть client component.

## Consequences

### Positive

1. Новые экраны имеют понятный FSD ownership.
2. `page.tsx` остается тонким.
3. UI учит работать через MUI, а не через самодельные компоненты.
4. Frontend может идти впереди backend без загрязнения JSX mock-логикой.
5. Mapper становится единственным местом смены временных данных на реальные.

### Negative

1. Временно сосуществуют `views` и FSD-slices.
2. Часть MUI-компонентов требует client boundary.
3. Нужно следить, чтобы `use client` не расползался выше leaf-компонентов.
4. Старые module-oriented документы и код требуют поэтапной актуализации.

## Alternatives Considered

### 1. Оставить `src/modules` как target

Отклонено. Для текущего проекта FSD дает более понятную учебную модель и лучше совпадает с задачами.

### 2. Полностью держать UI в `app`

Отклонено. `app` быстро становится толстым и начинает смешивать route input, loading, domain UI и действия.

### 3. Делать mock прямо в компонентах

Отклонено. Это загрязняет UI временной backend-ahead логикой.

## Migration Notes

1. Новые экраны строить через `entities/features/widgets`.
2. Legacy `src/views` не расширять без необходимости.
3. `src/modules` не использовать для новых frontend UI-slices.
4. Existing code мигрировать постепенно, когда рядом появляется реальная задача.
5. Reference implementation:
   - `src/app/page.tsx`;
   - `src/entities/place`;
   - `src/features/places-pagination`;
   - `src/widgets/places-catalog`.
