# Backend-first OpenAPI JSON Sync Design

## Goal

Синхронизировать `frontend-codex` с новым code-first OpenAPI-контрактом
`backend-codex` после внешнего исправления backend issue
[#158](https://github.com/DenisChernykh/amazing-ekb-hub-backend/issues/158),
не редактируя backend из frontend-задачи, не добавляя frontend
compatibility-слой, не меняя deployment infrastructure и не сохраняя
параллельно старый YAML pipeline.

## Verified starting state

- Backend checkout: `/Users/denischernykh/projects/pet/amazing-ekb-hub/backend-codex`
  на `stage`, HEAD `0f6b09074973414a2a4a3ef156e1e911be9b81a6`.
- Frontend checkout:
  `/Users/denischernykh/projects/pet/amazing-ekb-hub/frontend-codex` на `stage`,
  HEAD `de1616681ebfeb7c919e43608bab70935e07a58d`.
- Backend source of truth: Nest decorators и DTO metadata.
- Backend generated artifact: `docs/api/openapi.json`.
- Backend runtime contract URL: `/openapi.json`.
- Frontend всё ещё хранит `openapi.yaml`, получает его с
  `/docs/openapi.yaml` и генерирует из него openapi-typescript, Orval fetch и
  Orval Zod outputs.

## Problems to solve

### Backend contract defects

1. В categories и places существуют два экспортированных класса с именем
   `PlaceCategoryResponseDto`. Swagger использует имя класса как component key,
   поэтому вложенная публичная категория place ссылается на административную
   schema с обязательными `status`, `createdAt` и `updatedAt`. Runtime place
   repository эти поля не возвращает.
2. `GET /v1/admin/import-runs/{runId}/events` объявляет
   `text/event-stream` со schema `$ref` на `ImportRunEventResponseDto`.
   Фактический wire format — строковый SSE stream. Orval поэтому читает response
   через `res.text()`, но присваивает строку DTO-типу, и generated client не
   проходит TypeScript.

### Frontend integration differences

1. Новый документ включает `/v1` непосредственно в product paths. Старый
   frontend snapshot держит `/v1` в `servers`, а generated paths начинаются с
   `/places`, `/categories` и других resource paths.
2. Текущий `API_BASE_URL` уже заканчивается на `/v1`. Прямая генерация из нового
   документа создаёт запросы вида `/v1/v1/...`.
3. Новая metadata изменила теги, `operationId` и DTO names. Generated modules,
   функции, response types и Zod exports поэтому меняются.

## Chosen architecture

Работа выполняется последовательно и атомарно:

```text
backend issue #158
  -> внешний исправленный canonical docs/api/openapi.json
    -> pinned backend commit and artifact hash
      -> frontend openapi.json snapshot
        -> openapi-typescript + Orval fetch + Orval Zod
          -> минимальная адаптация существующих frontend API consumers
```

Frontend не трансформирует backend paths, не переименовывает generated DTO и не
поддерживает YAML/JSON dual mode. Ошибки источника истины исправляются владельцем
backend в рамках issue #158, после чего frontend принимает полученный документ
целиком.

## External prerequisite: backend issue #158

Backend-код не изменяется в рамках этого design и будущего frontend
implementation plan. До начала frontend migration issue #158 должен обеспечить:

- уникальное имя вложенного DTO places, например
  `PlaceSummaryCategoryResponseDto`;
- корректный `$ref` из `PlaceSummaryResponseDto.category`;
- сохранение публичного runtime response только с `id`, `slug`, `title` и
  `coverImageUrl`;
- OpenAPI regression assertion:
  - component `PlaceSummaryCategoryResponseDto` существует;
  - его `required` содержит ровно четыре публичных поля;
  - `PublicPlaceSummaryResponseDto.category` ссылается именно на него;
  - административный `PlaceCategoryResponseDto` остаётся отдельным component.
- описание `GET /v1/admin/import-runs/{runId}/events` как
  `text/event-stream` со schema `{ type: 'string' }`.
- описание того, что `data` каждого SSE event содержит
  JSON-serialized import-run payload, но не выдавать payload DTO за HTTP body.
- regression assertion на content type и строковую schema.

### Required handoff evidence

Перед frontend migration нужно получить и проверить:

- ссылку на закрытый issue #158 и связанный merged backend PR или commit;
- backend commit SHA;
- свежий `docs/api/openapi.json`;
- SHA-256 итогового artifact;
- успешные результаты `api:check` и focused OpenAPI tests;
- отсутствие двух исходных дефектов при локальной инспекции artifact;
- успешную пробную Orval 8.8.1 generation без SSE `TS2322`.

Frontend migration не начинается, пока это evidence не подтверждено. Исправлять
backend при отсутствии evidence из frontend-задачи нельзя.

## Phase 2: atomically migrate the frontend

### Snapshot and sync pipeline

- Удалить `openapi.yaml`.
- Добавить `openapi.json` как точную копию проверенного backend artifact.
- Изменить default source в `scripts/api/sync-openapi.mjs` на
  `http://127.0.0.1:3000/openapi.json`.
- Изменить default output на `openapi.json`.
- Проверять, что полученный документ непустой и является JSON object с
  `openapi`, `info` и `paths`.
- Не форматировать snapshot через Prettier: frontend должен сохранять
  backend-owned canonical bytes.
- Переключить `openapi-typescript` и оба Orval inputs на `openapi.json`.

### Base URL contract

- Изменить смысл server-only `API_BASE_URL`: значение представляет backend
  origin без version path, например `http://127.0.0.1:3000`.
- Generated product paths уже содержат `/v1`.
- Обновить Next rewrite:
  - source остаётся `/v1/:path*`;
  - destination становится `${API_BASE_URL}/v1/:path*`.
- Обновить `.env.example`, unit tests и local documentation.
- Не добавлять fallback, который принимает одновременно origin и старое
  значение с `/v1`.

### Generated outputs and consumers

- Полностью регенерировать:
  - `src/shared/api/schema.generated.ts`;
  - `src/shared/api/generated/**`;
  - `src/shared/api/generated-zod/**`.
- Не редактировать generated files вручную.
- Обновить только необходимые frontend imports и вызовы:
  - categories operations переходят в generated categories module;
  - places operations используют новые `operationId`-based names;
  - entity API и mapper inputs используют новые DTO names;
  - contract tests используют новые Zod export names.
- Не выполнять отдельную перестройку entity/UI contracts в рамках этой
  миграции.

### Documentation

Обновить только документы, которые описывают текущую интеграцию:

- `README.md`;
- `docs/architecture/api-integration.md`;
- `docs/testing/test-strategy.md`;
- `docs/runbooks/local-setup.md`.

Исторические implementation plans не переписываются.

## Error handling

- `api:sync` завершает работу с ошибкой при HTTP non-2xx, пустом body,
  невалидном JSON или отсутствии обязательных top-level OpenAPI keys.
- Orval-generated HTTP errors продолжают нормализоваться существующим
  `isGeneratedApiError`.
- Изменившиеся Problem Details DTO не интерпретируются в UI напрямую; текущие
  status-based controlled branches сохраняются там, где backend contract
  объявляет соответствующий status.
- Если новый artifact снова генерирует TypeScript, который не компилируется,
  проблема возвращается в backend contract metadata либо фиксируется как
  подтверждённая несовместимость generator-а. Generated frontend code вручную
  не патчится.

## Verification

### Backend handoff verification

```bash
git rev-parse HEAD
shasum -a 256 docs/api/openapi.json
```

Эти команды только фиксируют проверяемый backend handoff. Backend
implementation и его test execution остаются в issue #158.

### Frontend

```bash
OPENAPI_SPEC_SOURCE=../backend-codex/docs/api/openapi.json pnpm run api:update
pnpm run api:generate
git diff --exit-code -- openapi.json src/shared/api/schema.generated.ts src/shared/api/generated src/shared/api/generated-zod
pnpm run typecheck
pnpm run test:unit
pnpm run lint:strict
pnpm run build
```

После статических gates выполнить локальный smoke публичных categories, places,
place detail и materials requests с `API_BASE_URL=http://127.0.0.1:3000`.

## Explicitly out of scope

- production deployment;
- backend code changes, backend branch и backend commit;
- deployment workflows;
- GitHub repository variables and secrets;
- Dokploy, VPS, reverse proxy и production environment files;
- admin frontend synchronization;
- общий refactor generated-contract boundaries;
- сохранение старого YAML pipeline;
- push, PR или merge.

До отдельного deployment follow-up обновлённый frontend не выкатывается в
production, потому что production `API_BASE_URL` должен быть приведён к новому
origin-only contract.

## Rollback

- Frontend cutover откатывается отдельным frontend commit revert, который
  возвращает YAML snapshot, старые generator inputs и старый `API_BASE_URL`
  contract.
- Частичный rollback отдельных generated файлов не допускается.
- Rollback backend issue #158 принадлежит владельцу backend и не выполняется из
  frontend-задачи.
