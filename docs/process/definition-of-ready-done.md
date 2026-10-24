# Definition of Ready / Definition of Done

## DoR

1. Понятен пользовательский сценарий.
2. Известны loading, empty и error states.
3. Понятно, какие backend endpoint используются.
4. Понятно, какой уровень тестирования нужен для изменения: `unit`, `component/integration`, `e2e` или пока только документирование gap.

## DoD

1. Реализованы success, loading, empty и error states.
2. Проверены mobile и desktop.
3. Изменение соотнесено с `docs/testing/test-strategy.md` и для него определён релевантный тестовый слой.
4. Если автоматизированный тест ещё не внедрён, gap явно зафиксирован в документации или описании задачи, а не остаётся неявным.
5. Пройдены `pnpm format:check`, `pnpm lint:strict`, `pnpm typecheck`, `pnpm build`.
6. Если задача явно посвящена TSDoc, выполнен `pnpm run lint:tsdoc` и замечания
   рассмотрены по `docs/architecture/tsdoc-guidelines.md`; это не часть обычного DoD.
7. Обновлены релевантные docs.
8. Новый или мигрированный UI построен через Tailwind CSS + shadcn/ui; MUI используется только в legacy-участках, которые ещё не мигрированы.
9. Если frontend идёт впереди backend, временный mock/fallback изолирован в mapper/adapters.
