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

Текущий frontend-подход: Next.js App Router + FSD + Tailwind CSS + shadcn/ui.

Миграция с Material UI завершена. Не добавлять MUI, Emotion или MUI provider/theme
infrastructure обратно без отдельного ADR.

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

## Tailwind и shadcn/ui rules

1. shadcn/ui добавлять через CLI, не копировать registry-файлы вручную.
2. Не выполнять массовый `shadcn add --all`; добавлять только компоненты текущей задачи.
3. Project-owned shadcn components держать в `src/shared/ui`, generic helpers — в `src/shared/lib`.
4. Tailwind tokens в `src/app/globals.css` должны сохранять текущие app-level цвета, радиусы, тени и типографику, пока отдельно не принято решение о redesign.
5. UI не импортирует MUI или Emotion. Их повторное добавление требует отдельного архитектурного решения.
6. Повторяемые состояния loading, empty, error, disabled, focus и confirmation оформлять через shared UI contracts, а не локальными ad-hoc решениями.
7. Для каждого заметного UI-изменения сохранять desktop/mobile visual check для затронутых состояний.
8. Tailwind preflight включён глобально; порядок cascade layers `theme, base, components, utilities` не менять без отдельной визуальной проверки.

## Component structure

1. Для написанных вручную UI-компонентов целиться в 100-120 строк на файл.
2. Если компонент или UI-файл превысил 150 строк, его нужно разбить, кроме generated, non-UI или явно обоснованных исключений.
3. Диапазон 100-150 строк — зона ревью: проверить, не смешаны ли layout, data mapping, actions и повторяемые UI-фрагменты.
4. Разбивать компоненты внутри текущего FSD slice; не расширять public API (`index.ts`) без необходимости.
5. Для JSX с пустой false-веткой использовать `{condition && <Component />}` вместо `{condition ? <Component /> : null}`.
6. Для числовых условий писать явное сравнение: `{items.length > 0 && <Component />}`, а не `{items.length && <Component />}`.

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

1. Feature-ветки попадают в `stage` через обычный merge PR без squash.
2. `main` продвигается из `stage` только fast-forward, без release merge-коммита.
3. Conventional Commits: `type(scope): subject`.
4. Feature-ветки: `<type>/<short-name>`, старт от актуального `stage`.
5. При невозможности fast-forward операция должна завершиться ошибкой; дополнительный merge для исправления истории не создаётся.
6. Исторические merge-коммиты не переписываются.

Коммиты делать логическими группами:

- feature отдельно;
- generated/schema отдельно;
- docs отдельно;
- refactor отдельно.
