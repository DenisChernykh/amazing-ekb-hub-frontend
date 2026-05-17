# AGENTS.md

## Цель

Проект учебный. Ассистент должен не только менять код, но и объяснять, почему выбран именно такой путь. Язык по умолчанию — русский.

## Как отвечать

1. Объяснять подробно, если пользователь явно не попросил кратко.
2. При изменениях в коде разбирать:
   - какую проблему решали;
   - как было до изменений;
   - что стало после изменений;
   - какие файлы и участки важны;
   - почему выбран подход;
   - какие есть ограничения;
   - как проверить локально.
3. Git-команды объяснять по шагам:
   - назначение;
   - флаги и аргументы;
   - предусловия;
   - что изменится;
   - как проверить;
   - как безопасно откатить.

## Архитектурный стиль

Целевой frontend-подход: Next.js App Router + FSD + Material UI.

`src/app` — только framework/route слой:

- `page.tsx`, `loading.tsx`, `error.tsx`;
- route-private `_lib`;
- route-private `_components`;
- работа с `params`, `searchParams`, route-level orchestration.

`src/entities` — сущности и их reusable UI:

- доменные типы;
- mapper/adapters от API-формы к UI-форме;
- display helpers;
- карточки и другие reusable entity-компоненты.

`src/features` — пользовательские действия и интерактивные сценарии:

- pagination;
- filters;
- search;
- controls, которые меняют состояние или URL.

`src/widgets` — крупные композиционные блоки страницы:

- catalog;
- feed;
- page sections, которые собирают entities/features.

`src/shared` — generic слой:

- API/generated clients;
- generic UI;
- общие helpers;
- config.

## Import rules

1. `app` может импортировать `widgets`, `features`, `entities`, `shared`.
2. `widgets` могут импортировать `features`, `entities`, `shared`.
3. `features` могут импортировать `entities`, `shared`.
4. `entities` могут импортировать `shared`.
5. `shared` не импортирует вышележащие слои.
6. Слои импортируются через public API (`index.ts`), если компонент/тип предназначен для внешнего использования.
7. Внутри одного slice допустимы локальные relative imports.

## Material UI rules

1. По умолчанию использовать нативные MUI-компоненты, а не собирать аналоги вручную.
2. Для карточек использовать `Card`, `CardActionArea`, `CardContent`, `CardMedia`.
3. Для пагинации использовать `Pagination`.
4. Для сеток использовать `Container` и `Grid`.
5. Для состояний использовать `Alert`, `Paper`, `CircularProgress`, `Skeleton`, `Typography`.
6. Для метаданных использовать `Chip`, `Avatar`, `Badge` по смыслу.
7. `Box` и `Stack` использовать как layout primitives, а не как замену готовым компонентам.
8. Если MUI-компоненту нужно передать function component через `component={...}`, этот leaf-компонент должен быть client component (`'use client'`).
9. Не передавать функции в Client Components из Server Components.
10. CSS Modules не использовать для нового UI без отдельной причины.

## Frontend ahead of backend

Если frontend идёт впереди backend:

1. UI не должен напрямую зависеть от неполного DTO.
2. В `entities/<name>/model` заводится frontend contract type.
3. API-ответ преобразуется mapper-ом в UI-модель.
4. Временный mock/fallback держится только в mapper/adapters, не в JSX.
5. Mock должен быть детерминированным.
6. Когда backend догоняет контракт, меняется mapper, а UI остаётся почти без изменений.
7. Не делать N+1 detail-запросы только ради полей карточки, если эти поля должны стать частью list endpoint.

## Helpers

Если пользователь просит помечать helpers, добавлять в JSDoc или комментарий фразу `Это хелпер`.

Helpers должны быть маленькими, pure и жить рядом со слоем, которому принадлежат:

- route helpers — `src/app/<route>/_lib`;
- entity helpers — `src/entities/<name>/model` или `lib`;
- feature helpers — `src/features/<name>/lib`;
- generic helpers — `src/shared/lib`.

## Git

Целевая история:

1. `linear + squash`.
2. Conventional Commits: `type(scope): subject`.
3. Feature-ветки: `<type>/<short-name>`, старт от `stage`.
4. В `stage` — только squash merge через PR.
5. В `main` — fast-forward от `stage`.
6. Не переписывать исторические merge-коммиты.

Коммиты делать логическими группами:

- feature отдельно;
- generated/schema отдельно;
- docs отдельно;
- refactor отдельно.
