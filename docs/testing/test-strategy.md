# Test Strategy

## Цель

Зафиксировать для frontend единый объём тестирования MVP-сценариев и убрать разрыв с backend-документацией, постепенно синхронизируя frontend quality gates с локальным tooling и CI.

## Текущее состояние

1. Сейчас обязательные frontend quality gates: `pnpm format:check`, `pnpm lint:strict`, `pnpm typecheck`, `pnpm build`.
2. Эти проверки воспроизводятся локально через Husky и в GitHub Actions CI для PR в `stage` и `main`.
3. Этот документ фиксирует целевой объём тестирования заранее, чтобы дальнейшее внедрение шло по согласованной стратегии, а не точечно.

## Почему backend сейчас описан подробнее

1. Backend уже опирается на реальные `unit`, `integration` и `e2e` тесты, coverage policy и CI-проверки.
2. Frontend пока находится на более ранней стадии: есть каркас приложения и базовая документация, но нет внедрённого test tooling.
3. Цель frontend-стратегии — заранее зафиксировать обязательные сценарии и будущую пирамиду тестов, чтобы при росте продукта фронтенд развивался с тем же production-подходом.

## Текущие quality gates

1. `pnpm format:check`
2. `pnpm lint:strict`
3. `pnpm typecheck`
4. `pnpm build`
5. Conventional Commit validation
6. Branch naming validation

## Целевая пирамида тестов

1. Unit — pure functions, formatters, mappers, query-param helpers, state helpers, auth/favorites client logic.
2. Component / integration — Vitest + React Testing Library + MSW для route-level UI, взаимодействий пользователя и интеграции с API-контрактом на уровне компонента.
3. E2E — Playwright для сквозных пользовательских сценариев против реального backend seed environment.

## API-testing policy

1. Source of truth для frontend API-поведения:
   - `openapi.yaml`
   - backend API error standard
2. Frontend не заводит собственный API-контракт, расходящийся с backend.
3. Unit и component/integration тесты используют MSW и fixtures, совместимые с backend OpenAPI и error format.
4. Ключевые e2e-сценарии должны прогоняться против реального backend с seed-данными.
5. UI-проверки ориентируются на пользовательское поведение и корректную обработку `error.type`, `error.code`, `error.message`.

## Обязательные MVP-сценарии

1. Лента мест:
   - initial load списка;
   - поиск по названию и ключевым словам;
   - фильтры по категориям;
   - сортировка;
   - пагинация;
   - состояния `loading`, `empty`, `error`, `success`.
2. Детальная страница места:
   - отображение place hero и кратких характеристик;
   - блок pinned material “Начни отсюда”;
   - счётчики материалов по платформам;
   - пустое состояние платформы без материалов;
   - список материалов;
   - кнопка “Показать ещё”.
3. Избранное:
   - добавление места в избранное;
   - удаление места из избранного;
   - экран списка избранного;
   - корректная реакция UI на неавторизованный сценарий;
   - синхронизация состояния после toggle.
4. Auth:
   - login success;
   - login с невалидными данными или неверными credentials;
   - восстановление сессии через `/auth/me`;
   - refresh / logout flow;
   - реакция guarded UI на отсутствие или потерю сессии.

## Responsive и visual-state policy

1. Для каждого MVP-сценария обязательны проверки desktop и mobile.
2. Для каждого пользовательского сценария должны быть определены `success`, `loading`, `empty`, `error`.
3. Приоритет тестов — проверка поведения, которое видит пользователь, а не внутренних деталей реализации.

## План внедрения tooling

1. Текущая итерация фиксирует стратегию только в документации.
2. Следующая итерация добавляет unit/component tooling и первые smoke-тесты.
3. После этого подключаются e2e smoke flows.
4. Только после реального внедрения tooling в репозиторий обязательными становятся команды:
   - `pnpm test:unit`
   - `pnpm test:e2e`
   - `pnpm test:coverage`
