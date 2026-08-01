# OpenAPI JSON Sync Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Атомарно переключить `frontend-codex` со старого YAML snapshot на исправленный canonical `backend-codex/docs/api/openapi.json`, регенерировать contracts и адаптировать публичные API consumers без deployment-изменений и compatibility-слоя.

**Architecture:** Backend Nest decorators и DTO metadata остаются единственным источником истины; frontend хранит точную побайтовую копию generated JSON и строит из неё `openapi-typescript`, Orval fetch и Orval Zod outputs. Поскольку новые paths уже содержат `/v1`, server-only `API_BASE_URL` становится origin-only, а Next rewrite добавляет `/v1` ровно один раз. Переход выполняется одним code commit, чтобы история не содержала промежуточного состояния, в котором generated contracts и handwritten consumers несовместимы.

**Tech Stack:** Next.js 16.2.6 App Router, React 19.2.3, TypeScript 5.9.3, Vitest 4.1.6, openapi-typescript 7.13.0, Orval 8.8.1, Zod 4.3.6, Node.js 24.18.0, pnpm 11.7.0.

## Global Constraints

- Менять только `/Users/denischernykh/projects/pet/amazing-ekb-hub/frontend-codex`; backend-код и backend history не редактировать.
- Не трогать deployment workflows, GitHub variables/secrets, Dokploy, VPS, reverse proxy, production environment files и admin frontend.
- Не выполнять push, PR, merge или deployment.
- Не сохранять YAML/JSON dual mode и не добавлять aliases для старых operation names.
- Удалить `openapi.yaml`; `openapi.json` должен быть точной копией backend artifact с SHA-256 `f922d7a030b3af37fd1594fdcd59f3ba831e69c7ba49055853f93e8dc3850e18`.
- Не форматировать `openapi.json` через Prettier, lint-staged или вручную.
- Generated файлы в `src/shared/api/schema.generated.ts`, `src/shared/api/generated/**` и `src/shared/api/generated-zod/**` не редактировать вручную.
- `API_BASE_URL` после cutover содержит только origin, например `http://127.0.0.1:3000`, без `/v1`.
- Сохранять FSD import rules и существующие entity/UI models; не выполнять сопутствующий UI refactor.
- Не добавлять MUI, Emotion или новую UI/theme infrastructure.
- Не изменять исторические design/implementation plans.
- Не изменять и не удалять pre-existing untracked `.pnpm-store/` и `.superpowers/`.
- Запускать `typecheck` и `build` последовательно, потому что обе команды используют `.next`.

## Verified Backend Handoff

- Closed issue: [backend #158](https://github.com/DenisChernykh/amazing-ekb-hub-backend/issues/158).
- Backend branch: `stage`.
- Backend HEAD: `664304d19002aef542e9cef07e202e99e5693725`.
- Merge commit: `664304d Merge pull request #161 from DenisChernykh/fix/generated-openapi-contracts`.
- Fix commits:
  - `3bea8cb fix(openapi): disambiguate place category schemas`;
  - `51583d9 fix(openapi): describe import run SSE wire format`.
- Canonical artifact: `/Users/denischernykh/projects/pet/amazing-ekb-hub/backend-codex/docs/api/openapi.json`.
- Artifact SHA-256: `f922d7a030b3af37fd1594fdcd59f3ba831e69c7ba49055853f93e8dc3850e18`.
- `api:check`: PASS (`OpenAPI artifact: current`, Redocly valid).
- Focused backend OpenAPI e2e: PASS, 6 suites / 36 tests.
- Scratch Orval 8.8.1 generation: PASS; прежний SSE `TS2322` не воспроизводится.
- Scratch frontend check with the planned entity type boundary and 422 branch: `tsc --noEmit` PASS; sync/rewrite tests 2 files / 8 tests PASS; public consumer tests 24 files / 86 tests PASS.

## File Responsibility Map

- `scripts/api/sync-openapi.mjs` — CLI, который читает local/HTTP JSON, валидирует обязательную OpenAPI envelope и сохраняет исходные байты.
- `src/openapi-sync-contract.test.ts` — black-box regression tests CLI: exact bytes, invalid JSON и missing keys.
- `.prettierignore` — защита backend-owned snapshot от `format:check` и pre-commit `lint-staged`.
- `package.json`, `orval.config.ts` — единственный JSON generation pipeline.
- `openapi.json` — canonical backend snapshot; `openapi.yaml` удаляется.
- `next.config.ts`, `.env.example`, `src/next-config-rewrites.test.ts` — origin-only `API_BASE_URL` contract.
- `src/shared/api/schema.generated.ts`, `src/shared/api/generated/**`, `src/shared/api/generated-zod/**` — полностью производные outputs.
- `src/entities/category/**`, `src/entities/place/**` — transport imports, operation calls и DTO-to-model mappers.
- `src/app/places/[placeSlug]/_lib/get-place-page-data.ts`, `src/widgets/place-detail/**` — потребители локальных place model types.
- `src/shared/api/category-photo-contract.test.ts`, `src/shared/api/place-maps-url-contract.test.ts` — Zod/DTO contract assertions.
- `README.md`, `docs/architecture/api-integration.md`, `docs/testing/test-strategy.md`, `docs/runbooks/local-setup.md` — текущая интеграционная документация.

## Supervised Delegation Protocol

Исполнять через `superpowers:subagent-driven-development` в одном изолированном frontend worktree. Controller остаётся на более сильной модели, выдаёт implementer-у только один work package, проверяет его diff и evidence, затем либо разрешает следующий пакет, либо возвращает точечные замечания тому же implementer-у.

Использовать модели так:

- `gpt-5.6-terra` medium — механические path-bounded пакеты с точной replacement map и focused tests;
- `gpt-5.6-terra` high — regeneration/integration пакеты с generated outputs либо несколькими FSD slices;
- текущая более сильная controller-модель — решения при `BLOCKED`, проверка scope/architecture и final whole-branch review.

Не использовать `gpt-5.6-luna` для этой миграции. Не запускать implementers параллельно: packages меняют один generated-contract cutover и должны видеть результат предыдущего пакета.

| Package | Implementer  | Граница работы                                                          | Разрешённый результат                               | Commit           |
| ------- | ------------ | ----------------------------------------------------------------------- | --------------------------------------------------- | ---------------- |
| `P0`    | Controller   | Worktree setup и pinned preflight                                       | `PASS` или `BLOCKED`                                | Нет              |
| `P1`    | Terra medium | Sync CLI tests, validation, formatting guard, generator/base URL config | `PASS`: 8 focused tests                             | Нет              |
| `P2`    | Terra high   | Canonical JSON snapshot и полная regeneration                           | `EXPECTED_RED`: только перечисленный consumer drift | Нет              |
| `P3`    | Terra medium | Только category consumers и их tests                                    | `PASS`: category-focused tests                      | Нет              |
| `P4`    | Terra medium | Stable place entity type boundary                                       | `PASS`: type-boundary focused tests                 | Нет              |
| `P5`    | Terra high   | Place operations, mappers, 422 и Zod consumers                          | `PASS`: focused consumers + typecheck               | Нет              |
| `P6`    | Terra medium | Compatibility/scope checks, determinism и atomic code commit            | `PASS`: clean generated diff                        | Один code commit |
| `P7`    | Terra medium | Только четыре текущих integration docs                                  | `PASS`: docs scan                                   | Нет              |
| `P8`    | Terra high   | Aggregate gates, local smoke и docs commit                              | `PASS` или environment `BLOCKED` для smoke          | Один docs commit |

Packages `P1`–`P6` являются одной атомарной миграцией Task 1. До `P6` controller хранит progress и review evidence в plan-specific `.superpowers/sdd` workspace, но не разрешает промежуточные commits. Это осознанная адаптация subagent workflow: commit после `P1`, `P2`, `P3`, `P4` или `P5` зафиксировал бы YAML/JSON dual state либо некомпилируемый generated/consumer state.

Перед каждым package controller создаёт короткий brief только с:

- соответствующим package heading и его Steps из этого plan;
- Global Constraints;
- текущим `git status --short`;
- interfaces, произведёнными предыдущим package;
- путём report-файла в plan-specific `.superpowers/sdd` workspace.

Implementer возвращает только:

- package и статус: `DONE`, `DONE_WITH_CONCERNS`, `EXPECTED_RED` или `BLOCKED`;
- изменённые tracked-файлы;
- выполненные команды, exit codes и test counts;
- concerns и конкретное решение, которое требуется от controller.

После каждого package controller самостоятельно проверяет `git diff`, scope и заявленные команды. При ошибке:

1. контекстная или механическая проблема — вернуть точные замечания тому же Terra implementer-у;
2. недостаток reasoning — повторить пакет на Terra high;
3. ошибка plan/backend contract — остановить dispatch, исправить plan либо вернуть работу владельцу backend;
4. новая архитектурная развилка — запросить решение пользователя.

Stop conditions, при которых implementer не импровизирует:

- backend HEAD/hash/schema assertions отличаются от pinned handoff;
- Orval или TypeScript падает внутри generated файлов;
- после `P5` остаются TypeScript errors;
- `openapi.json` меняет pinned SHA-256;
- для продолжения требуется backend fix, новый compatibility layer, deployment, push, PR или merge.

---

### Task 1: Atomic JSON contract cutover

**Files:**

- Create: `.prettierignore`
- Create: `openapi.json`
- Create: `src/openapi-sync-contract.test.ts`
- Delete: `openapi.yaml`
- Modify: `scripts/api/sync-openapi.mjs:1-43`
- Modify: `package.json:6-25`
- Modify: `orval.config.ts:14-45`
- Modify: `.env.example:1-3`
- Modify: `next.config.ts:8-28`
- Modify: `src/next-config-rewrites.test.ts:1-43`
- Regenerate: `src/shared/api/schema.generated.ts`
- Regenerate: `src/shared/api/generated/**`
- Regenerate: `src/shared/api/generated-zod/**`
- Modify: `src/entities/category/api/fetch-public-categories.ts:1-13`
- Modify: `src/entities/category/api/fetch-public-categories.test.ts`
- Modify: `src/entities/category/api/fetch-public-category.ts:1-19`
- Modify: `src/entities/category/api/fetch-public-category.test.ts`
- Modify: `src/entities/category/model/map-category-to-card-model.ts:1-19`
- Modify: `src/entities/place/api/fetch-all-public-place-slugs.ts:1-31`
- Modify: `src/entities/place/api/fetch-all-public-place-slugs.test.ts`
- Modify: `src/entities/place/api/fetch-public-category-place-page.ts:1-31`
- Modify: `src/entities/place/api/fetch-public-category-place-page.test.ts`
- Modify: `src/entities/place/api/fetch-public-place-detail.ts:1-54`
- Modify: `src/entities/place/api/fetch-public-place-detail.test.ts`
- Modify: `src/entities/place/api/fetch-public-place-materials.ts:1-71`
- Modify: `src/entities/place/api/fetch-public-place-materials.test.ts`
- Modify: `src/entities/place/index.ts:18-27`
- Modify: `src/entities/place/lib/build-place-materials-anchor.ts`
- Modify: `src/entities/place/model/map-place-detail-to-model.ts:1-119`
- Modify: `src/entities/place/model/map-place-detail-to-model.test.ts`
- Modify: `src/entities/place/model/map-place-summary-to-card.ts:1-18`
- Modify: `src/entities/place/model/place-display.ts`
- Modify: `src/entities/place/model/types.ts:1-76`
- Modify: `src/app/places/[placeSlug]/_lib/get-place-page-data.ts:1-84`
- Modify: `src/widgets/place-detail/lib/use-place-detail-platform-scrollspy.ts`
- Modify: `src/widgets/place-detail/model/types.ts`
- Modify: `src/shared/api/category-photo-contract.test.ts`
- Modify: `src/shared/api/place-maps-url-contract.test.ts`

**Interfaces:**

- Consumes: backend artifact at commit `664304d19002aef542e9cef07e202e99e5693725`, SHA-256 `f922d7a030b3af37fd1594fdcd59f3ba831e69c7ba49055853f93e8dc3850e18`.
- Produces: `api:sync` defaults to `http://127.0.0.1:3000/openapi.json` and writes exact bytes to `openapi.json`.
- Produces: `api:generate` derives all three generated output groups only from `openapi.json`.
- Produces: `API_BASE_URL=<backend-origin>` plus rewrite `/v1/:path* -> <backend-origin>/v1/:path*`.
- Produces: public generated operations `categoriesList`, `categoriesGet`, `placesList`, `placesGet`, `placeMaterialsList`.
- Produces: stable entity types `Platform`, `MaterialType`, `PlaceCategory` from the new generated DTO unions.

#### Work Package P0: Verify the immutable handoff

**Checkpoint:** все команды и schema assertions проходят. Любое отличие — `BLOCKED`; Task 1 не начинается.

- [ ] **Step 1: Re-verify the pinned handoff before copying any contract**

Run:

```bash
git merge-base --is-ancestor d45a604 HEAD
git status --porcelain=v1
git -C /Users/denischernykh/projects/pet/amazing-ekb-hub/backend-codex status --short --branch
git -C /Users/denischernykh/projects/pet/amazing-ekb-hub/backend-codex rev-parse HEAD
shasum -a 256 /Users/denischernykh/projects/pet/amazing-ekb-hub/backend-codex/docs/api/openapi.json
```

Assert the two corrected schema boundaries:

```bash
node --input-type=module <<'NODE'
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const document = JSON.parse(
  await readFile(
    '/Users/denischernykh/projects/pet/amazing-ekb-hub/backend-codex/docs/api/openapi.json',
    'utf8',
  ),
);
const schemas = document.components.schemas;

assert.deepEqual(schemas.PlaceSummaryCategoryResponseDto.required, [
  'id',
  'slug',
  'title',
  'coverImageUrl',
]);
assert.equal(
  schemas.PublicPlaceSummaryResponseDto.properties.category.$ref,
  '#/components/schemas/PlaceSummaryCategoryResponseDto',
);
assert.equal(
  schemas.PlaceDetailResponseDto.properties.category.$ref,
  '#/components/schemas/PlaceSummaryCategoryResponseDto',
);
assert.deepEqual(schemas.PlaceCategoryResponseDto.required, [
  'id',
  'slug',
  'title',
  'coverImageUrl',
  'status',
  'createdAt',
  'updatedAt',
]);
assert.equal(
  document.paths['/v1/admin/import-runs/{runId}/events'].get.responses['200'].content[
    'text/event-stream'
  ].schema.type,
  'string',
);

console.log('backend OpenAPI handoff: valid');
NODE
```

Expected:

```text
git merge-base exits 0
git status reports no tracked changes; optional untracked entries are limited to .pnpm-store/ and .superpowers/
## stage...origin/stage
664304d19002aef542e9cef07e202e99e5693725
f922d7a030b3af37fd1594fdcd59f3ba831e69c7ba49055853f93e8dc3850e18  /Users/denischernykh/projects/pet/amazing-ekb-hub/backend-codex/docs/api/openapi.json
backend OpenAPI handoff: valid
```

If backend HEAD or artifact hash differs, stop and inspect the new backend diff before continuing. Do not silently pin a different document.

#### Work Package P1: Make sync and routing behavior explicit

**Checkpoint:** Steps 2–8 завершены, 2 focused files / 8 tests проходят. Не запускать regeneration и не создавать commit на этом stage.

- [ ] **Step 2: Add failing black-box tests for JSON sync and origin-only rewrites**

Create `src/openapi-sync-contract.test.ts`:

```ts
import { spawnSync } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

const syncScriptPath = fileURLToPath(new URL('../scripts/api/sync-openapi.mjs', import.meta.url));
const testRoots: string[] = [];

async function createTestRoot(): Promise<string> {
  const testRoot = await mkdtemp(join(tmpdir(), 'frontend-openapi-sync-'));
  testRoots.push(testRoot);
  return testRoot;
}

function runSync(testRoot: string, sourcePath: string) {
  return spawnSync(process.execPath, [syncScriptPath], {
    cwd: testRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      OPENAPI_SPEC_OUTPUT: 'openapi.json',
      OPENAPI_SPEC_SOURCE: sourcePath,
    },
  });
}

afterEach(async () => {
  await Promise.all(
    testRoots.splice(0).map((testRoot) => rm(testRoot, { force: true, recursive: true })),
  );
});

describe('OpenAPI JSON sync CLI', () => {
  it('preserves the canonical JSON bytes exactly', async () => {
    const testRoot = await createTestRoot();
    const sourcePath = join(testRoot, 'backend-openapi.json');
    const canonicalJson = '{"openapi":"3.0.3","info":{},"paths":{}}';
    await writeFile(sourcePath, canonicalJson);

    const result = runSync(testRoot, sourcePath);

    expect(result.status).toBe(0);
    await expect(readFile(join(testRoot, 'openapi.json'), 'utf8')).resolves.toBe(canonicalJson);
  });

  it('rejects invalid JSON without overwriting the current snapshot', async () => {
    const testRoot = await createTestRoot();
    const sourcePath = join(testRoot, 'backend-openapi.json');
    const outputPath = join(testRoot, 'openapi.json');
    await writeFile(sourcePath, '{invalid');
    await writeFile(outputPath, 'existing snapshot');

    const result = runSync(testRoot, sourcePath);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('OpenAPI source is not valid JSON');
    await expect(readFile(outputPath, 'utf8')).resolves.toBe('existing snapshot');
  });

  it.each([
    ['openapi', { info: {}, paths: {} }],
    ['info', { openapi: '3.0.3', paths: {} }],
    ['paths', { openapi: '3.0.3', info: {} }],
  ])('rejects a document without %s', async (missingKey, document) => {
    const testRoot = await createTestRoot();
    const sourcePath = join(testRoot, 'backend-openapi.json');
    await writeFile(sourcePath, JSON.stringify(document));

    const result = runSync(testRoot, sourcePath);

    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('OpenAPI source must contain openapi, info and paths');
    expect(missingKey).toBeTypeOf('string');
  });
});
```

Update the first two cases in `src/next-config-rewrites.test.ts` to pass an origin without `/v1` while keeping the expected proxy destination versioned:

```ts
vi.stubEnv('API_BASE_URL', 'http://127.0.0.1:3000');
// ...
destination: 'http://127.0.0.1:3000/v1/:path*',
```

```ts
vi.stubEnv('API_BASE_URL', 'http://127.0.0.1:3000///');
// ...
destination: 'http://127.0.0.1:3000/v1/:path*',
```

- [ ] **Step 3: Run the new tests and verify the old implementation fails**

Run:

```bash
pnpm exec vitest run src/openapi-sync-contract.test.ts src/next-config-rewrites.test.ts
```

Expected: FAIL because the old sync script accepts malformed/non-OpenAPI text and appends a newline, while the old rewrite omits `/v1` when given an origin-only base URL.

- [ ] **Step 4: Implement strict JSON validation with exact-byte persistence**

Replace `scripts/api/sync-openapi.mjs` with:

```js
#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_SPEC_SOURCE = 'http://127.0.0.1:3000/openapi.json';
const DEFAULT_SPEC_OUTPUT = 'openapi.json';

const source = process.env.OPENAPI_SPEC_SOURCE ?? DEFAULT_SPEC_SOURCE;
const output = process.env.OPENAPI_SPEC_OUTPUT ?? DEFAULT_SPEC_OUTPUT;
const outputPath = resolve(process.cwd(), output);
const isHttpSource = source.startsWith('http://') || source.startsWith('https://');

async function readOpenApiSource() {
  if (isHttpSource) {
    const response = await fetch(source);

    if (!response.ok) {
      throw new Error(`OpenAPI request failed: ${response.status} ${response.statusText}`);
    }

    return response.text();
  }

  const filePath = source.startsWith('file:')
    ? fileURLToPath(source)
    : resolve(process.cwd(), source);

  return readFile(filePath, 'utf8');
}

function isRecord(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertOpenApiDocument(openApiSpec) {
  if (!openApiSpec.trim()) {
    throw new Error('OpenAPI source is empty');
  }

  let document;

  try {
    document = JSON.parse(openApiSpec);
  } catch {
    throw new Error('OpenAPI source is not valid JSON');
  }

  if (
    !isRecord(document) ||
    typeof document.openapi !== 'string' ||
    !isRecord(document.info) ||
    !isRecord(document.paths)
  ) {
    throw new Error('OpenAPI source must contain openapi, info and paths');
  }
}

const openApiSpec = await readOpenApiSource();
assertOpenApiDocument(openApiSpec);

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, openApiSpec);

console.log(`Synced OpenAPI spec: ${source} -> ${output}`);
```

This validates before writing, so a bad source cannot overwrite the last valid snapshot. Do not append or normalize a trailing newline.

- [ ] **Step 5: Protect the canonical JSON from formatting**

Create `.prettierignore`:

```text
# Backend-owned canonical OpenAPI bytes; update only through pnpm run api:sync.
openapi.json
```

Keep `openapi.json` in the existing `lint-staged` JSON glob: Prettier reads `.prettierignore` and skips this one backend-owned file while continuing to format other staged JSON.

- [ ] **Step 6: Switch the generator pipeline to JSON**

Change `package.json` scripts to:

```json
"api:sync": "node ./scripts/api/sync-openapi.mjs",
"api:generate": "openapi-typescript ./openapi.json -o src/shared/api/schema.generated.ts && orval --config orval.config.ts && prettier --write src/shared/api/schema.generated.ts src/shared/api/generated src/shared/api/generated-zod",
"api:update": "pnpm run api:sync && pnpm run api:generate"
```

Change both `orval.config.ts` inputs:

```ts
input: {
  target: './openapi.json',
},
```

Do not add fallback to `openapi.yaml` and do not run Prettier against the snapshot.

- [ ] **Step 7: Adopt the origin-only base URL contract**

Change `next.config.ts`:

```ts
return [
  {
    source: '/v1/:path*',
    destination: `${normalizeApiBaseUrl(apiBaseUrl)}/v1/:path*`,
  },
];
```

Change `.env.example`:

```dotenv
# Local backend origin for Next.js rewrites during full-stack development.
# Keep this value server-only: it is read in next.config.ts and must not be exposed via NEXT_PUBLIC_*.
API_BASE_URL=http://127.0.0.1:3000
```

There must be no compatibility normalization that strips an existing `/v1`; an old value is invalid after this cutover.

- [ ] **Step 8: Re-run the sync/rewrite tests**

Run:

```bash
pnpm exec vitest run src/openapi-sync-contract.test.ts src/next-config-rewrites.test.ts
```

Expected: PASS, 2 test files / 8 tests.

#### Work Package P2: Regenerate from the canonical JSON

**Checkpoint:** Orval завершился без generated errors; hash совпал; Step 10 дал только документированный handwritten consumer drift. Это единственный разрешённый `EXPECTED_RED` во всём плане.

- [ ] **Step 9: Replace YAML with the pinned backend JSON and regenerate everything**

Run:

```bash
git rm openapi.yaml
OPENAPI_SPEC_SOURCE=/Users/denischernykh/projects/pet/amazing-ekb-hub/backend-codex/docs/api/openapi.json pnpm run api:update
shasum -a 256 openapi.json
```

Expected hash:

```text
f922d7a030b3af37fd1594fdcd59f3ba831e69c7ba49055853f93e8dc3850e18  openapi.json
```

Expected generated topology includes:

```text
src/shared/api/generated/categories/categories.ts
src/shared/api/generated/places/places.ts
src/shared/api/generated/model/placeCategoryPublicResponseDto.ts
src/shared/api/generated/model/placeSummaryCategoryResponseDto.ts
src/shared/api/generated/model/placeDetailResponseDto.ts
src/shared/api/generated/model/publicMaterialResponseDto.ts
src/shared/api/generated/operation/placeMaterialsListParams.ts
src/shared/api/generated-zod/categories/categories.zod.ts
src/shared/api/generated-zod/places/places.zod.ts
```

Orval must finish both `amazingEkbHub` and `amazingEkbHubZod` without `TS2322`. Do not patch any generated output if generation fails.

- [ ] **Step 10: Run typecheck to expose only handwritten consumer drift**

Run:

```bash
pnpm run typecheck
```

Expected: FAIL only on removed old operation/type/Zod names such as `listPlaces`, `getPlaceDetail`, `PlaceDetail`, `PublicMaterial`, `GetPlaceDetail200Response`; there must be no error inside `src/shared/api/generated/**`.

#### Work Package P3: Adapt only category consumers

**Checkpoint:** Step 11 и category-focused tests завершены. Category consumers используют новый generated module. Не создавать commit и не менять place files — они принадлежат `P4` и `P5`.

- [ ] **Step 11: Adapt category consumers to the new generated tag and DTO names**

Use these exact replacements in category source and matching mocks/tests:

| Old                                    | New                                            |
| -------------------------------------- | ---------------------------------------------- |
| `@/shared/api/generated/places/places` | `@/shared/api/generated/categories/categories` |
| `listPlaceCategories`                  | `categoriesList`                               |
| `getPlaceCategory`                     | `categoriesGet`                                |
| `PlaceCategory`                        | `PlaceCategoryPublicResponseDto`               |
| `GetPlaceCategory200Response`          | `CategoriesGet200Response`                     |
| `generated-zod/places/places.zod`      | `generated-zod/categories/categories.zod`      |

The final production imports are:

```ts
import type { PlaceCategoryPublicResponseDto } from '@/shared/api/generated/model/placeCategoryPublicResponseDto';
import { categoriesList } from '@/shared/api/generated/categories/categories';
```

```ts
import type { PlaceCategoryPublicResponseDto } from '@/shared/api/generated/model/placeCategoryPublicResponseDto';
import { categoriesGet } from '@/shared/api/generated/categories/categories';
```

Keep the existing `404 -> null` behavior in `fetchPublicCategory`; the new contract still declares 404.

- [ ] **Step 11a: Verify the bounded P3 package**

Run:

```bash
pnpm exec vitest run src/entities/category
git diff --check
git diff -- src/entities/category
```

Expected: all category tests pass, `git diff --check` exits 0, and the path-scoped diff contains only the exact generated module/function/DTO replacements from Step 11.

#### Work Package P4: Stabilize place entity types

**Checkpoint:** Step 12 и P4 focused tests завершены. Entity helpers/widgets получают `Platform` через entity-owned type boundary. Не создавать commit и не исправлять place operation drift — он принадлежит `P5`.

- [ ] **Step 12: Establish stable place entity types over the new generated DTO unions**

Replace the generated imports at the top of `src/entities/place/model/types.ts` and expose stable entity names:

```ts
import type { PlaceSummaryCategoryResponseDto } from '@/shared/api/generated/model/placeSummaryCategoryResponseDto';
import type { PublicMaterialResponseDtoPlatform } from '@/shared/api/generated/model/publicMaterialResponseDtoPlatform';
import type { PublicMaterialResponseDtoType } from '@/shared/api/generated/model/publicMaterialResponseDtoType';

export type MaterialType = PublicMaterialResponseDtoType;
export type PlaceCategory = PlaceSummaryCategoryResponseDto;
export type Platform = PublicMaterialResponseDtoPlatform;
```

Add `MaterialType` and `Platform` to `src/entities/place/index.ts`:

```ts
export {
  PLACE_PLATFORMS,
  type MaterialType,
  type PlaceCardModel,
  type PlaceCardVariant,
  type PlaceCategory,
  type PlaceDetailModel,
  type PlaceMaterialModel,
  type PlaceMaterialsByPlatform,
  type Platform,
  type PlatformCounters,
} from './model/types';
```

Inside `src/entities/place/lib/build-place-materials-anchor.ts` and `src/entities/place/model/place-display.ts`, import these types from the local `./model/types` or `./types` file as appropriate. In widgets, import `Platform` through `@/entities/place`; widgets must no longer reach into removed generated `model/platform`.

- [ ] **Step 12a: Verify the bounded P3 package**

Run:

```bash
pnpm exec vitest run \
  src/entities/category \
  src/entities/place/lib/build-place-materials-anchor.test.ts \
  src/entities/place/model/place-display.test.ts
git diff --check
git diff -- \
  src/entities/category \
  src/entities/place/index.ts \
  src/entities/place/lib/build-place-materials-anchor.ts \
  src/entities/place/model/place-display.ts \
  src/entities/place/model/types.ts \
  src/widgets/place-detail/lib/use-place-detail-platform-scrollspy.ts \
  src/widgets/place-detail/model/types.ts
```

Expected: selected tests pass, `git diff --check` exits 0, and the path-scoped diff contains only the P4 type-boundary adaptations described in Step 12. Do not run or claim full typecheck yet; old place operation names are intentionally closed in `P5`.

#### Work Package P5: Adapt place operations, mappers and contract tests

**Checkpoint:** Steps 13–16 завершены; all focused consumer tests and `pnpm run typecheck` pass. Не создавать commit до compatibility/scope checks в `P6`.

- [ ] **Step 13: Adapt place operations, response types and raw mapper DTOs**

Use this exact operation map in source and matching mocks/tests:

| Old                                 | New                                 |
| ----------------------------------- | ----------------------------------- |
| `listPlaces`                        | `placesList`                        |
| `getPlaceDetail`                    | `placesGet`                         |
| `getPlaceDetailResponseSuccess`     | `placesGetResponseSuccess`          |
| `getPlaceDetailResponseError`       | `placesGetResponseError`            |
| `listPlaceMaterials`                | `placeMaterialsList`                |
| `listPlaceMaterialsResponseSuccess` | `placeMaterialsListResponseSuccess` |
| `listPlaceMaterialsResponseError`   | `placeMaterialsListResponseError`   |
| `ListPlaceMaterialsParams`          | `PlaceMaterialsListParams`          |
| `PublicPlaceSummary`                | `PublicPlaceSummaryResponseDto`     |
| `PlaceDetail`                       | `PlaceDetailResponseDto`            |
| `PublicMaterial`                    | `PublicMaterialResponseDto`         |
| `GetPlaceDetail200Response`         | `PlacesGet200Response`              |

Final detail API imports:

```ts
import {
  placesGet,
  type placesGetResponseError,
  type placesGetResponseSuccess,
} from '@/shared/api/generated/places/places';
```

Final materials API imports:

```ts
import type { PlaceMaterialsListParams } from '@/shared/api/generated/operation/placeMaterialsListParams';
import {
  placeMaterialsList,
  type placeMaterialsListResponseError,
  type placeMaterialsListResponseSuccess,
} from '@/shared/api/generated/places/places';
import type { Platform } from '../model/types';
```

Final material call:

```ts
const query: PlaceMaterialsListParams = { platform };
const response = await placeMaterialsList({ placeSlug }, query);
```

Final mapper inputs:

```ts
import type { PlaceDetailResponseDto } from '@/shared/api/generated/model/placeDetailResponseDto';
import type { PublicMaterialResponseDto } from '@/shared/api/generated/model/publicMaterialResponseDto';

type PlaceMaterialsByPlatformInput = Partial<
  Record<PlaceMaterialModel['platform'], PublicMaterialResponseDto[]>
>;
```

```ts
import type { PublicPlaceSummaryResponseDto } from '@/shared/api/generated/model/publicPlaceSummaryResponseDto';

export function mapPlaceSummaryToCardModel(place: PublicPlaceSummaryResponseDto): PlaceCardModel {
  return {
    id: place.id,
    slug: place.slug,
    title: place.title,
    coverImageUrl: normalizeCoverImageUrl(place.coverImageUrl),
  };
}
```

In `src/app/places/[placeSlug]/_lib/get-place-page-data.ts`, import `Platform` from `@/entities/place` and keep only the raw response item import from generated code:

```ts
import {
  mapPlaceDetailToModel,
  PLACE_PLATFORMS,
  type PlaceDetailModel,
  type Platform,
} from '@/entities/place';
import type { PublicMaterialResponseDto } from '@/shared/api/generated/model/publicMaterialResponseDto';

const materialsByPlatform = materialResults.reduce<
  Partial<Record<Platform, PublicMaterialResponseDto[]>>
>(
  (result, { platform, result: materialResult }) => ({
    ...result,
    [platform]: materialResult.kind === 'success' ? materialResult.data.items : [],
  }),
  {},
);
```

- [ ] **Step 14: Align the materials validation branch with the declared 422 response**

Add this case to `src/entities/place/api/fetch-public-place-materials.test.ts`:

```ts
it('maps a declared 422 response to validation_error', async () => {
  placeMaterialsListMock.mockRejectedValueOnce(
    Object.assign(new Error('validation failed'), {
      status: 422,
      info: {
        code: 'VALIDATION_FAILED',
        message: 'Validation failed',
      },
    }),
  );

  await expect(fetchPublicPlaceMaterials('baden-baden-uktus', 'telegram')).resolves.toEqual({
    kind: 'validation_error',
    data: {
      code: 'VALIDATION_FAILED',
      message: 'Validation failed',
    },
  });
});
```

Change the union and branch in `fetch-public-place-materials.ts`:

```ts
export type FetchPublicPlaceMaterialsResult =
  | { kind: 'success'; data: placeMaterialsListResponseSuccess['data'] }
  | { kind: 'validation_error'; data: placeMaterialsListResponseError['data'] }
  | { kind: 'not_found'; data: placeMaterialsListResponseError['data'] }
  | { kind: 'unexpected_error'; message: string };
```

```ts
if (isGeneratedApiError(error) && error.status === 422) {
  return {
    kind: 'validation_error',
    data: error.info as placeMaterialsListResponseError['data'],
  };
}
```

Do not keep the old `400 -> bad_request` branch: the corrected canonical contract declares 422, not 400.

- [ ] **Step 15: Update Zod contract tests to the generated public modules**

Use:

```ts
import { CategoriesGet200Response } from '@/shared/api/generated-zod/categories/categories.zod';
import type { PlaceCategoryPublicResponseDto } from '@/shared/api/generated/model/placeCategoryPublicResponseDto';
```

```ts
import { PlacesGet200Response } from '@/shared/api/generated-zod/places/places.zod';
import type { PlaceDetailResponseDto } from '@/shared/api/generated/model/placeDetailResponseDto';
```

Rename fixture annotations to these DTO names; keep the existing nullable `coverImageUrl` and required nullable `mapsUrl` assertions unchanged.

- [ ] **Step 16: Verify focused consumers and static typing**

Run:

```bash
pnpm exec vitest run \
  src/openapi-sync-contract.test.ts \
  src/next-config-rewrites.test.ts \
  src/entities/category \
  src/entities/place \
  src/shared/api/category-photo-contract.test.ts \
  src/shared/api/place-maps-url-contract.test.ts \
  'src/app/places/[placeSlug]/_lib/get-place-page-data.test.ts'
pnpm run typecheck
```

Expected:

```text
Test Files  26 passed
TypeScript exits 0 with no generated or handwritten errors.
```

The exact test count may increase by the new 422 case, but every selected file must pass.

#### Work Package P6: Prove atomicity and commit the code migration

**Checkpoint:** old names отсутствуют в current source/config, snapshot hash сохранён, regeneration детерминирована, создан ровно один code commit.

- [ ] **Step 17: Prove there is no source/config compatibility layer**

Run:

```bash
rg -n \
  "openapi\\.yaml|docs/openapi\\.yaml|listPlaceCategories|getPlaceCategory|listPlaces|getPlaceDetail|listPlaceMaterials|generated/model/(platform|materialType|placeCategory|placeDetail|publicMaterial|publicPlaceSummary)" \
  package.json orval.config.ts scripts src .env.example
```

Expected: no matches. Historical documents are deliberately excluded from this source/config check.

- [ ] **Step 18: Check scope, canonical hash and patch integrity**

Run:

```bash
shasum -a 256 openapi.json
git diff --check
git status --short
```

Expected:

- hash remains `f922d7a030b3af37fd1594fdcd59f3ba831e69c7ba49055853f93e8dc3850e18`;
- no whitespace errors;
- only the files listed in Task 1 are modified, apart from preserved `.pnpm-store/` and `.superpowers/`.

- [ ] **Step 19: Commit the atomic code migration**

Stage the entire inseparable cutover explicitly:

```bash
git add -u -- openapi.yaml
git add \
  .env.example \
  .prettierignore \
  next.config.ts \
  openapi.json \
  orval.config.ts \
  package.json \
  scripts/api/sync-openapi.mjs \
  src/openapi-sync-contract.test.ts \
  src/next-config-rewrites.test.ts \
  src/shared/api/schema.generated.ts \
  src/shared/api/generated \
  src/shared/api/generated-zod \
  src/entities/category \
  src/entities/place \
  'src/app/places/[placeSlug]/_lib/get-place-page-data.ts' \
  src/widgets/place-detail/lib/use-place-detail-platform-scrollspy.ts \
  src/widgets/place-detail/model/types.ts \
  src/shared/api/category-photo-contract.test.ts \
  src/shared/api/place-maps-url-contract.test.ts
git commit -m "chore(api): migrate generated contract to JSON"
```

This code commit intentionally contains snapshot, generated outputs and their direct consumers together: splitting them would create a non-compiling intermediate commit, which violates the atomic cutover requirement.

After the commit, prove regeneration is deterministic:

```bash
pnpm run api:generate
git diff --exit-code -- \
  openapi.json \
  src/shared/api/schema.generated.ts \
  src/shared/api/generated \
  src/shared/api/generated-zod
shasum -a 256 openapi.json
```

Expected: no diff and the pinned SHA-256 remains unchanged. If a hook or generator changes `openapi.json`, restore it only by rerunning `api:sync` from the pinned backend artifact, then fix the formatting exclusion and amend the commit.

---

### Task 2: Document and accept the new integration contract

**Files:**

- Modify: `README.md:17-32,67-72`
- Modify: `docs/architecture/api-integration.md:1-38`
- Modify: `docs/testing/test-strategy.md:19-42`
- Modify: `docs/runbooks/local-setup.md:3-26,46-51`

**Interfaces:**

- Consumes: Task 1 `openapi.json`, JSON-only generation commands and origin-only `API_BASE_URL`.
- Produces: operator/developer documentation that names `/openapi.json`, `openapi.json`, exact sync overrides and the `/v1` rewrite boundary.
- Produces: verified local-only acceptance evidence; no hosted/deployment claim.

#### Work Package P7: Update only current integration documentation

**Checkpoint:** Steps 1–4 завершены; четыре документа отформатированы, stale YAML/base URL matches отсутствуют. Commit пока не создавать.

- [ ] **Step 1: Update the README happy path and source-of-truth section**

Use these exact facts in `README.md`:

```markdown
3. Убедиться, что в `.env.local` указан backend origin без version path; по умолчанию используется локальный `http://127.0.0.1:3000`
```

```markdown
2. Backend origin задаётся server-only переменной `API_BASE_URL`; по умолчанию это локальный `http://127.0.0.1:3000`.
3. Browser и frontend-клиент обращаются к backend через same-origin путь `/v1`.
4. В локальной разработке Next rewrites проксируют `/v1/:path*` на `${API_BASE_URL}/v1/:path*`.
5. `API_BASE_URL` не содержит `/v1` и не должен публиковаться через `NEXT_PUBLIC_*`.
```

```markdown
- API contract snapshot: `openapi.json`
- API contract update command: `pnpm run api:update`
```

Do not fix unrelated stale stack/ADR wording in this migration.

- [ ] **Step 2: Rewrite the API integration source and routing contract**

Replace the opening source-of-truth/sync text in `docs/architecture/api-integration.md` with:

````markdown
## Source of Truth

1. Backend code-first OpenAPI document served from `/openapi.json`.
2. Backend canonical artifact: `backend-codex/docs/api/openapi.json`.
3. Local frontend snapshot: `openapi.json`.

Frontend не определяет и не трансформирует backend contract. Snapshot сохраняется
побайтово и не форматируется через Prettier; `openapi-typescript` и оба Orval output
генерируются только из этого JSON.

Локальный snapshot обновляется командой `pnpm run api:update`. По умолчанию она читает
`http://127.0.0.1:3000/openapi.json`. Для синхронизации из соседнего checkout:

```bash
OPENAPI_SPEC_SOURCE=../backend-codex/docs/api/openapi.json pnpm run api:update
```

Для другого runtime source:

```bash
OPENAPI_SPEC_SOURCE=https://example.test/openapi.json pnpm run api:update
```
````

Update `Base URL And Routing Model` with:

```markdown
1. Browser runtime использует same-origin путь `/v1`.
2. `API_BASE_URL` — server-only backend origin без `/v1`.
3. Generated product paths уже содержат `/v1`.
4. В локальной разработке Next rewrites проксируют `/v1/*` на `${API_BASE_URL}/v1/*`.
5. В production same-origin `/v1` должен быть настроен внешней инфраструктурой.
6. Server-side код Next не должен напрямую полагаться на относительный `/v1`.
```

- [ ] **Step 3: Update testing and local runbook facts**

In `docs/testing/test-strategy.md`, set the API source of truth to:

```markdown
1. Source of truth для frontend API-поведения:
   - backend code-first `docs/api/openapi.json`;
   - frontend snapshot `openapi.json`;
   - backend API error standard.
2. Frontend не форматирует и не исправляет generated contract вручную.
3. Повторный `pnpm run api:generate` не должен создавать diff.
```

In `docs/runbooks/local-setup.md`, use:

```markdown
3. Доступный локальный backend на `http://127.0.0.1:3000`
```

```markdown
3. Проверить, что в `.env.local` указано `API_BASE_URL=http://127.0.0.1:3000`
```

```markdown
2. Frontend проксирует `/v1/*` на backend `http://127.0.0.1:3000/v1/*`.
3. `API_BASE_URL` содержит только origin; `/v1` добавляет `next.config.ts`.
4. Если `API_BASE_URL` не задан, frontend ожидает, что `/v1` уже настроен внешней инфраструктурой.
5. Для удалённого backend указывать origin вида `https://api.example.test`, без `/v1`.
```

Add the contract refresh command before the proxy smoke:

```bash
OPENAPI_SPEC_SOURCE=../backend-codex/docs/api/openapi.json pnpm run api:update
```

- [ ] **Step 4: Format only handwritten files and scan current docs for stale YAML semantics**

Run:

```bash
pnpm exec prettier --write \
  README.md \
  docs/architecture/api-integration.md \
  docs/testing/test-strategy.md \
  docs/runbooks/local-setup.md
rg -n \
  "openapi\\.yaml|docs/openapi\\.yaml|API_BASE_URL=http://127\\.0\\.0\\.1:3000/v1" \
  README.md docs/architecture/api-integration.md docs/testing/test-strategy.md docs/runbooks/local-setup.md
```

Expected: no matches. Do not include historical `docs/superpowers/specs/**` or `docs/superpowers/plans/**` in this scan.

#### Work Package P8: Run acceptance, local smoke and commit docs

**Checkpoint:** aggregate gates прошли; local smoke либо прошёл, либо отдельно зафиксирован как environment `BLOCKED`; создан docs commit. Никаких hosted/deployment выводов.

- [ ] **Step 5: Run the one final aggregate frontend gate sequence**

Run sequentially:

```bash
pnpm run api:generate
git diff --exit-code -- \
  openapi.json \
  src/shared/api/schema.generated.ts \
  src/shared/api/generated \
  src/shared/api/generated-zod
shasum -a 256 openapi.json
pnpm run format:check
pnpm run lint:strict
pnpm run test:unit
pnpm run typecheck
pnpm run build
```

Expected:

- second generation produces no diff;
- snapshot hash remains `f922d7a030b3af37fd1594fdcd59f3ba831e69c7ba49055853f93e8dc3850e18`;
- format, lint, all unit tests, typecheck and production build exit 0;
- `typecheck` completes before `build`.

- [ ] **Step 6: Run a local proxy/API smoke without deployment**

If backend is not already running, start it in the backend checkout:

```bash
cd /Users/denischernykh/projects/pet/amazing-ekb-hub/backend-codex
PATH=/Users/denischernykh/.nvm/versions/node/v24.18.0/bin:$PATH corepack pnpm@11.15.1 run dev:local
```

From the active frontend checkout/worktree root where `P0` ran, start frontend in a second terminal with the new origin-only contract:

```bash
API_BASE_URL=http://127.0.0.1:3000 pnpm dev
```

Then run:

```bash
curl -fsS http://127.0.0.1:3000/openapi.json >/dev/null
curl -fsS http://localhost:3001/v1/categories >/dev/null
curl -fsS 'http://localhost:3001/v1/places?page=1&pageSize=1' >/tmp/amazing-ekb-places-smoke.json
PLACE_SLUG=$(node -p "JSON.parse(require('fs').readFileSync('/tmp/amazing-ekb-places-smoke.json','utf8')).items[0].slug")
curl -fsS "http://localhost:3001/v1/places/$PLACE_SLUG" >/dev/null
curl -fsS "http://localhost:3001/v1/places/$PLACE_SLUG/materials?platform=telegram" >/dev/null
```

Expected: all commands exit 0; requests pass through the Next `/v1` rewrite without `/v1/v1`. This is local runtime evidence only and must not be described as production deployment evidence.

- [ ] **Step 7: Review scope and commit documentation**

Run:

```bash
git diff --check
git status --short
git diff -- README.md docs/architecture/api-integration.md docs/testing/test-strategy.md docs/runbooks/local-setup.md
```

Expected: only the four current integration documents are uncommitted, plus preserved untracked `.pnpm-store/` and `.superpowers/`.

Commit:

```bash
git add \
  README.md \
  docs/architecture/api-integration.md \
  docs/testing/test-strategy.md \
  docs/runbooks/local-setup.md
git commit -m "docs(api): document canonical JSON sync"
```

- [ ] **Step 8: Record final local-only state**

Run:

```bash
git status --short --branch
git log --oneline -5
```

Expected:

- branch is ahead only by the local design, plan, code and docs commits;
- no tracked changes remain;
- `.pnpm-store/` and `.superpowers/` remain untracked and untouched;
- nothing has been pushed, merged or deployed.

## Deferred Follow-up

After a separate deployment authorization, update the real hosted frontend `API_BASE_URL` to the backend origin without `/v1`, verify the external proxy boundary and deploy the already-tested frontend commit. That work is deliberately absent from this plan.
