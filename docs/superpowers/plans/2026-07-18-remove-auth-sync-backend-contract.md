# Remove Auth And Sync Backend Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement GitHub issue #88 and synchronize the frontend with the canonical OpenAPI contract from backend `stage` after slug, sorting, popularity, and category-color changes.

**Architecture:** Remove the unused handwritten auth/session vertical completely while preserving auth endpoints in generated API artifacts. Then regenerate every API artifact from `../backend-codex/docs/api/specification.yaml` and keep backend DTO changes behind the existing `entities/place` mapper boundary; public navigation and data loading switch from internal place IDs to public place slugs, while category badges use project-owned static styling.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Vitest, Tailwind CSS, shadcn/ui, openapi-typescript, Orval.

## Global Constraints

- Do not reintroduce MUI, Emotion, or a replacement auth architecture.
- Do not hand-edit files under `src/shared/api/generated`, `src/shared/api/generated-zod`, or `src/shared/api/schema.generated.ts`.
- Keep backend auth endpoints in `openapi.yaml` and generated artifacts.
- Preserve `searchParams` and public `cache: 'no-store'` behavior; issue #88 does not promise fully static routes.
- Keep generated/schema changes logically separate from handwritten refactoring.
- Use a public place slug for detail, photo, and materials paths; internal IDs remain model keys and backend administrative identifiers.

---

### Task 1: Remove the handwritten auth/session vertical

**Files:**

- Create: `src/app/auth-session-removal.test.ts`
- Modify: `src/app/layout.tsx`
- Delete: `src/app/providers.tsx`
- Delete: `src/app/login/**`
- Delete: `src/features/auth-login/**`
- Delete: `src/entities/session/**`

**Interfaces:**

- Consumes: Next.js root layout contract.
- Produces: A synchronous `RootLayout` that renders `children` directly and has no session/auth runtime dependency.

- [ ] **Step 1: Write the failing architecture test**

```ts
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('completed auth/session removal', () => {
  it('has no handwritten auth/session runtime or login route', () => {
    for (const path of [
      'src/app/providers.tsx',
      'src/app/login',
      'src/features/auth-login',
      'src/entities/session',
    ]) {
      expect(existsSync(resolve(process.cwd(), path))).toBe(false);
    }

    const layout = readFileSync(resolve(process.cwd(), 'src/app/layout.tsx'), 'utf8');
    expect(layout).not.toMatch(/getCurrentSession|SessionProvider|<Providers/);
  });
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `pnpm exec vitest run src/app/auth-session-removal.test.ts`

Expected: FAIL because the route, providers, and handwritten slices still exist.

- [ ] **Step 3: Remove the runtime vertical**

Make `RootLayout` synchronous, remove its auth imports and render `{children}` directly in `<body>`. Delete only the handwritten files listed above; preserve generated auth clients, Zod schemas, and OpenAPI paths.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `pnpm exec vitest run src/app/auth-session-removal.test.ts`

Expected: PASS.

### Task 2: Regenerate the frontend API contract from backend stage

**Files:**

- Modify: `openapi.yaml`
- Regenerate: `src/shared/api/schema.generated.ts`
- Regenerate: `src/shared/api/generated/**`
- Regenerate: `src/shared/api/generated-zod/**`

**Interfaces:**

- Consumes: `../backend-codex/docs/api/specification.yaml` at backend commit `994c62d`.
- Produces: Generated types and clients for slug-based public place/category routes without `sort`, `popularityWeight`, or `badgeBackgroundColor`.

- [ ] **Step 1: Run reproducible synchronization and generation**

Run:

```bash
OPENAPI_SPEC_SOURCE=../backend-codex/docs/api/specification.yaml pnpm run api:update
```

Expected: `openapi.yaml` matches the canonical backend document and all generated artifacts are rebuilt by project scripts.

- [ ] **Step 2: Verify the contract delta exposes handwritten incompatibilities**

Run: `pnpm run typecheck`

Expected: FAIL in handwritten catalog/detail code and fixtures that still use removed sort/color/popularity fields or old `placeId` public path parameters.

- [ ] **Step 3: Verify generated artifacts were not manually patched**

Run:

```bash
OPENAPI_SPEC_SOURCE=../backend-codex/docs/api/specification.yaml pnpm run api:update
git diff --exit-code -- openapi.yaml src/shared/api/schema.generated.ts src/shared/api/generated src/shared/api/generated-zod
```

Expected: the second generation is idempotent and adds no new diff.

### Task 3: Adapt the place entity and public routes to the new contract

**Files:**

- Modify: `src/entities/place/model/types.ts`
- Modify: `src/entities/place/model/map-place-summary-to-card.ts`
- Modify: `src/entities/place/model/map-place-summary-to-card.test.ts`
- Modify: `src/entities/place/model/map-place-detail-to-model.ts`
- Modify: `src/entities/place/model/map-place-detail-to-model.test.ts`
- Modify: `src/entities/place/model/place-display.ts`
- Modify: `src/entities/place/model/place-display.test.ts`
- Rename: `src/entities/place/model/normalize-place-id.ts` to `src/entities/place/model/normalize-place-slug.ts`
- Create: `src/entities/place/model/normalize-place-slug.test.ts`
- Modify: `src/entities/place/lib/build-place-href.ts`
- Create: `src/entities/place/lib/build-place-href.test.ts`
- Modify: `src/entities/place/lib/build-place-materials-href.ts`
- Modify: `src/entities/place/lib/build-place-materials-href.test.ts`
- Modify: `src/entities/place/api/fetch-public-place-detail.ts`
- Modify: `src/entities/place/api/fetch-public-place-materials.ts`
- Modify: `src/entities/place/ui/place-category-badge.tsx`
- Modify: `src/entities/place/ui/place-category-badge.test.ts`
- Modify: `src/entities/place/ui/place-card.tsx`
- Modify: `src/entities/place/ui/place-card-badges.tsx`
- Rename: `src/app/places/[placeId]/**` to `src/app/places/[placeSlug]/**`

**Interfaces:**

- Consumes: generated `PublicPlaceSummary`, `PlaceDetail`, `PlaceCategory`, `getPlaceDetail({ placeSlug })`, and `listPlaceMaterials({ placeSlug })`.
- Produces: `PlaceCardModel.slug`, `PlaceDetailModel.slug`, slug-based internal links, validated slug route input, and static project-owned category badge styling.

- [ ] **Step 1: Change tests to describe the new public contract**

Use fixtures shaped like:

```ts
const place = {
  id: 'place_ekb_001',
  slug: 'baden-baden-uktus',
  category: { id: 'category_spa', slug: 'spa', title: 'SPA' },
};
```

Assert that card/detail mappers retain `slug`, `buildPlaceHref('baden-baden-uktus')` returns `/places/baden-baden-uktus`, malformed slugs are rejected, material links use the slug, and category display no longer depends on backend color values.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
pnpm exec vitest run src/entities/place src/app/places
```

Expected: FAIL until production mappers, href builders, route params, and fetch client arguments use `slug`/`placeSlug`.

- [ ] **Step 3: Implement the minimal entity and route adaptation**

Add `slug: string` to card/detail models, map it from generated DTOs, pass it through card links, validate route slugs with `^[a-z0-9]+(?:-[a-z0-9]+)*$`, rename route params to `placeSlug`, and call generated public clients with `{ placeSlug }`. Replace dynamic inline category colors with a stable `secondary` badge style.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```bash
pnpm exec vitest run src/entities/place src/app/places
```

Expected: PASS.

### Task 4: Remove the retired sort and color contract from catalog state

**Files:**

- Modify: `src/app/_lib/normalize-home-search-params.ts`
- Modify: `src/app/_lib/normalize-home-search-params.test.ts`
- Modify: `src/app/_lib/serialize-home-search-params.ts`
- Modify: `src/app/_lib/serialize-home-search-params.test.ts`
- Modify: `src/app/_lib/to-list-places-params.ts`
- Modify: `src/app/_lib/to-list-places-params.test.ts`
- Modify: catalog/detail/card test fixtures under `src/app`, `src/entities`, `src/features`, and `src/widgets`
- Modify: `src/features/catalog-controls/lib/build-catalog-controls-href.ts`
- Modify: `src/features/catalog-controls/ui/catalog-category-filters.tsx`

**Interfaces:**

- Consumes: generated `ListPlacesParams` without `sort` and `PlaceCategory` without a color field.
- Produces: canonical catalog URLs containing only `search`, `category`, `pageSize`, and `page`; unknown legacy `sort` values are dropped.

- [ ] **Step 1: Update catalog tests first**

Remove `sort` and `badgeBackgroundColor` from typed fixtures and expectations. Add an assertion that an incoming legacy `sort=popular` is absent from normalized/serialized state and catalog-control links.

- [ ] **Step 2: Run focused tests and verify RED**

Run:

```bash
pnpm exec vitest run src/app/_lib src/features/catalog-controls src/widgets/places-catalog
```

Expected: FAIL while production state still emits `sort` and category controls still derive inline color styles.

- [ ] **Step 3: Implement the minimal catalog adaptation**

Remove `sort` from `CatalogUrlState`, normalization, serialization, generated list parameters, and canonical link ordering. Render active category filters with existing project-owned badge variants instead of backend color fields.

- [ ] **Step 4: Run focused tests and verify GREEN**

Run:

```bash
pnpm exec vitest run src/app/_lib src/features/catalog-controls src/widgets/places-catalog
```

Expected: PASS.

### Task 5: Verify issue #88 and full frontend integration

**Files:**

- Modify only if a verification failure reveals a scoped defect.

**Interfaces:**

- Consumes: all changes from Tasks 1-4.
- Produces: evidence for every issue #88 quality gate and the synchronized backend contract.

- [ ] **Step 1: Check retired runtime and DTO names**

Run:

```bash
rg -n "getCurrentSession|SessionProvider|useSession|loginByCredentialsAction|badgeBackgroundColor|backgroundBadgeColor|popularityWeight|listPlacesQuerySort|placeId" src --glob '!shared/api/generated/**' --glob '!shared/api/generated-zod/**' --glob '!shared/api/schema.generated.ts'
```

Expected: no runtime auth/session, retired DTO fields, or old public path parameter usages; test descriptions may mention intentionally rejected legacy query input only.

- [ ] **Step 2: Run all acceptance gates**

Run in order:

```bash
pnpm run format:check
pnpm run lint:strict
pnpm run test:unit
pnpm run typecheck
pnpm run build
```

Expected: every command exits `0`.

- [ ] **Step 3: Review the final diff**

Run:

```bash
git status --short
git diff --check
git diff --stat
git diff -- src/app/layout.tsx openapi.yaml src/entities/place src/app/places src/app/_lib src/features/catalog-controls
```

Expected: no whitespace errors, no changes inside the pre-existing untracked `.superpowers/`, auth endpoints remain in OpenAPI/generated files, and only scoped handwritten/generated/docs files changed.
