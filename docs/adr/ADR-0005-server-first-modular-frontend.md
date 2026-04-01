# ADR-0005 Server-First Modular Frontend

## Status

Accepted

## Context

Текущий frontend исторически развивался через смесь `app`, `features`, `entities`, `app/di`, result-first data-access и route-specific branching. Эта схема позволила быстро собирать экраны, но со временем создала несколько проблем:

1. server-side загрузка данных, route-level orchestration и UI-композиция часто оказывались смешаны;
2. reusable domain UI и route-private UI были слабо разделены;
3. API integration и error handling не имели единого server-first паттерна;
4. новые RSC-экраны было трудно собирать по повторяемому шаблону;
5. существующая структура была частично совместима с FSD-мышлением, но не имела одной явной целевой модели.

Параллельно проект перешел к новому `STD-001` error flow и throw-based API bridge, что сделало возможным более чистый server-first контур для новых страниц.

## Decision

Для новых server-side сценариев принимается следующая целевая архитектура:

1. `src/app` остается route-centric слоем Next App Router.
2. `src/modules` становится основным слоем доменных вертикальных модулей.
3. `src/shared` остается generic cross-cutting слоем.
4. Новые серверные страницы строятся по server-first схеме:
   - route нормализует input;
   - route вызывает route-private page-data loader;
   - module/server использует throw-based API layer;
   - route обрабатывает результат через `std-errors`;
   - route рендерит screen composition через route-private `_components`.
5. В `app` допускаются только route-specific `_lib` и `_components`.
6. В `modules` допускаются `api`, `model`, `server`, `ui`.
7. `app` может импортировать `modules` и `shared`.
8. `modules` не должны импортировать `app`.
9. `std-errors` становится целевым error flow для новых RSC-страниц.
10. Полный переход на чистый FSD на данном этапе не выполняется.

Подробное описание layer model, route pattern и screen pattern вынесено в:

- `docs/architecture/frontend-architecture.md`
- `docs/architecture/server-first-screen-pattern.md`
- `docs/architecture/std-001-rsc-error-library.md`

## Why Not Full FSD

Полный переход на FSD сейчас не выбран по следующим причинам:

1. `app` в Next App Router уже является отдельным framework-driven слоем и плохо ложится на жесткую FSD-таксономию.
2. Текущие доменные модули уже дают большую часть пользы FSD без дополнительного дробления.
3. Основная проблема проекта была не в naming, а в смешивании server loading, route orchestration и UI.
4. Переименование всего дерева в `entities/features/widgets` сейчас дало бы больше механического шума, чем пользы.

## Consequences

### Positive

1. Новые RSC-экраны получают повторяемую структуру.
2. Server-side data loading и UI rendering разделяются явно.
3. Route-private логика не протекает в доменные модули.
4. Error handling становится единым и предсказуемым.
5. Модульные UI-блоки можно переиспользовать между разными экранами.
6. Архитектура остается совместимой с постепенным движением в сторону FSD.

### Negative

1. В проекте временно сосуществуют legacy и новый контуры.
2. Часть route-level компонентов может выглядеть более дробно, чем минимально необходимо.
3. Требуется дисциплина вокруг public API модулей и route-private boundaries.
4. Не все старые `features/entities/app/di` будут мигрированы сразу.

## Alternatives Considered

### 1. Оставить legacy architecture без нового target pattern

Отклонено, потому что не решает проблему смешивания слоев.

### 2. Немедленно перевести проект на чистый FSD

Отклонено, потому что это слишком большой structural rewrite без достаточной локальной пользы для текущего этапа.

### 3. Перейти на client-side fetching как default

Отклонено, потому что основной target для новых экранов — server-first Next App Router flow.

## Migration Notes

1. Новый паттерн применяется к новым маршрутам и новым модулям.
2. Legacy `features/entities/app/di` могут продолжать существовать до поэтапной миграции.
3. Reference implementations:
   - `src/app/draft/home`
   - `src/app/draft/places/[placeId]`
4. При появлении устойчивого набора повторяемых feature-slices внутри `modules` допускается дальнейшее движение к FSD-style decomposition внутри модулей.
