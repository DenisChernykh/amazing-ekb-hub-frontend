# Place Detail Archive Focus Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the MUI place-detail route with the approved Archive Spine × Focus Mode shadcn/Tailwind redesign while preserving SSR content, safe redirect links, accessibility, and mobile one-tap navigation.

**Architecture:** Keep API loading and material normalization in server/entity code. Build a widget-owned archive view model, render the complete index as Server Component children, and wrap it in one small client interaction boundary for delegated focus preview plus one scrollspy navigation island. Apply Literata/Manrope only from the place route.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui Base UI, Motion for React, next/font, Vitest.

## Global Constraints

- Public visitors only view the owner's materials; add no submission or user-generated-content UI.
- Render no place summary, tags, material thumbnails, excerpts, reactions, or author fields.
- Keep same-origin backend `redirectUrl` as the only actionable material URL.
- Keep the MUI/Emotion root bridge while other routes still import MUI.
- Add no MUI import to the migrated detail widget or migrated category badge.
- Keep all material rows and platform anchors in the initial server response.
- Focus Stage is decorative; a material row is the only action.
- Use Literata only for display typography and Manrope for the working interface.
- Respect reduced motion and preserve a one-tap mobile link flow.

---

### Task 1: Normalize and deterministically order detail materials

**Files:**

- Modify: `src/entities/place/model/map-place-detail-to-model.test.ts`
- Modify: `src/entities/place/model/map-place-detail-to-model.ts`

**Interfaces:**

- Consumes: `PublicMaterial[]` grouped by platform plus `place.pinnedMaterial`.
- Produces: `PlaceDetailModel.materialsByPlatform` with unique ids, pinned injection, `publishedAt DESC`, and `id ASC` tie-breaking.

- [ ] **Step 1: Add failing mapper tests**

Add cases proving that duplicated ids collapse, pinned material is injected when absent, and date/id ordering is deterministic:

```ts
it('deduplicates, injects pinned material, and sorts each platform deterministically', () => {
  const model = mapPlaceDetailToModel(
    {
      ...PLACE_DETAIL,
      pinnedMaterial: {
        id: 'material_pinned',
        placeId: PLACE_DETAIL.id,
        platform: 'telegram',
        type: 'post',
        title: 'Pinned',
        publishedAt: '2026-03-22',
        durationSec: null,
        redirectUrl: '/v1/materials/material_pinned/go',
      },
    },
    {
      telegram: [
        createMaterial({ id: 'material_b', publishedAt: '2026-03-20' }),
        createMaterial({ id: 'material_a', publishedAt: '2026-03-20' }),
        createMaterial({ id: 'material_a', publishedAt: '2026-03-20' }),
      ],
    },
  );

  expect(model.materialsByPlatform.telegram.map(({ id }) => id)).toEqual([
    'material_pinned',
    'material_a',
    'material_b',
  ]);
});
```

- [ ] **Step 2: Run the mapper test and verify RED**

Run: `pnpm exec vitest run src/entities/place/model/map-place-detail-to-model.test.ts`

Expected: FAIL because the mapper currently preserves response order and does not inject pinned material.

- [ ] **Step 3: Implement normalization**

Add small pure helpers in the mapper module:

```ts
function compareMaterials(left: PublicMaterial, right: PublicMaterial): number {
  const dateComparison = right.publishedAt.localeCompare(left.publishedAt);
  return dateComparison || left.id.localeCompare(right.id);
}

function normalizePlatformMaterials(
  materials: PublicMaterial[],
  pinnedMaterial: PublicMaterial | null,
  platform: PlaceMaterialModel['platform'],
): PlaceMaterialModel[] {
  const uniqueMaterials = new Map(materials.map((material) => [material.id, material]));

  if (pinnedMaterial?.platform === platform) {
    uniqueMaterials.set(pinnedMaterial.id, pinnedMaterial);
  }

  return [...uniqueMaterials.values()].sort(compareMaterials).map(mapMaterialToModel);
}
```

Use the helper for every `PLACE_PLATFORMS` entry and pass `place.pinnedMaterial` into normalization.

- [ ] **Step 4: Verify mapper GREEN**

Run: `pnpm exec vitest run src/entities/place/model/map-place-detail-to-model.test.ts src/entities/place/model/place-display.test.ts`

Expected: both files pass.

- [ ] **Step 5: Commit the data contract**

```bash
git add src/entities/place/model
git commit -m "refactor(place-detail): normalize archive materials"
```

### Task 2: Add the shared badge and route-scoped typography foundation

**Files:**

- Create via CLI: `src/shared/ui/badge.tsx`
- Modify: `src/shared/ui/index.ts`
- Modify: `src/entities/place/ui/place-category-badge.test.ts`
- Modify: `src/entities/place/ui/place-category-badge.tsx`
- Modify: `src/entities/place/ui/place-card-image.tsx`
- Create: `src/app/places/[placeId]/_lib/place-detail-fonts.ts`
- Modify: `src/app/places/[placeId]/page.tsx`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Produces: `Badge` public shared UI primitive.
- Changes: `PlaceCategoryBadgeProps` becomes `{ category; className?; style? }` with no MUI prop types.
- Produces: `placeDetailFontVariables` class string for the ready route only.

- [ ] **Step 1: Add dependencies and generated primitive**

Run:

```bash
pnpm add motion
pnpm exec shadcn add badge
```

Export `Badge` and `badgeVariants` from `src/shared/ui/index.ts`.

- [ ] **Step 2: Update the failing category badge test**

Extend the existing test to require the shadcn slot and a caller class:

```ts
const html = renderToStaticMarkup(
  createElement(PlaceCategoryBadge, {
    category: CATEGORY,
    className: 'absolute left-3 top-3',
  }),
);

expect(html).toContain('data-slot="badge"');
expect(html).toContain('absolute left-3 top-3');
expect(html).not.toContain('MuiChip');
```

Run: `pnpm exec vitest run src/entities/place/ui/place-category-badge.test.ts`

Expected: FAIL because the component still renders MUI Chip and accepts `sx`.

- [ ] **Step 3: Migrate `PlaceCategoryBadge`**

Use the project Badge with dynamic category colors:

```tsx
import { Badge } from '@/shared/ui';
import { cn } from '@/shared/lib/utils';
import type { CSSProperties } from 'react';

interface PlaceCategoryBadgeProps {
  category: PlaceCategory;
  className?: string;
  style?: CSSProperties;
}

export function PlaceCategoryBadge({
  category,
  className,
  style,
}: Readonly<PlaceCategoryBadgeProps>) {
  const display = getPlaceCategoryDisplay(category);

  return (
    <Badge
      className={cn('border-transparent font-bold', className)}
      style={{ backgroundColor: display.backgroundColor, color: display.color, ...style }}
    >
      {display.label}
    </Badge>
  );
}
```

Replace the catalog image consumer's `sx` with Tailwind positioning and the existing overlay shadow value.

- [ ] **Step 4: Add route-scoped fonts**

Create a server-only font module:

```ts
import { Literata, Manrope } from 'next/font/google';

const literata = Literata({
  subsets: ['cyrillic', 'latin'],
  weight: ['500', '600'],
  variable: '--font-place-display',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-place-ui',
  display: 'swap',
});

export const placeDetailFontVariables = `${literata.variable} ${manrope.variable}`;
```

Apply the class only around the ready `PlaceDetail` result in `page.tsx`; not-found and error behavior stays unchanged.

- [ ] **Step 5: Verify foundation**

Run:

```bash
pnpm exec vitest run src/entities/place/ui/place-category-badge.test.ts
pnpm exec tsc --noEmit --pretty false --incremental false
pnpm exec prettier --check src/shared/ui src/entities/place/ui/place-category-badge.tsx src/entities/place/ui/place-card-image.tsx 'src/app/places/[placeId]'
```

- [ ] **Step 6: Commit the foundation**

```bash
git add package.json pnpm-lock.yaml src/shared/ui src/entities/place/ui src/app/places
git commit -m "feat(ui): add archive detail foundation"
```

### Task 3: Build the server-owned archive view model and static UI

**Files:**

- Create: `src/widgets/place-detail/model/types.ts`
- Create: `src/widgets/place-detail/model/build-place-detail-view-model.test.ts`
- Create: `src/widgets/place-detail/model/build-place-detail-view-model.ts`
- Create: `src/widgets/place-detail/ui/place-detail-material-row.tsx`
- Create: `src/widgets/place-detail/ui/place-detail-material-index.tsx`
- Create: `src/widgets/place-detail/ui/place-detail-spine.tsx`
- Modify: `src/widgets/place-detail/ui/place-detail.test.ts`
- Modify: `src/widgets/place-detail/ui/place-detail.tsx`

**Interfaces:**

```ts
export type PlaceDetailPreview = {
  id: string;
  platform: Platform;
  platformLabel: string;
  typeLabel: string;
  title: string;
  publishedAtLabel: string;
  durationLabel: string | null;
  redirectUrl: string | null;
};

export type PlaceDetailPlatformSection = {
  platform: Platform;
  anchor: string;
  label: string;
  count: number;
  materials: PlaceDetailPreview[];
};

export type PlaceDetailViewModel = {
  title: string;
  category: PlaceCategory;
  coverImageUrl: string;
  totalCount: number;
  pinned: PlaceDetailPreview | null;
  initialPreview: PlaceDetailPreview | null;
  previewsById: Record<string, PlaceDetailPreview>;
  platforms: PlaceDetailPlatformSection[];
};
```

- [ ] **Step 1: Write failing view-model tests**

Cover:

- empty platforms are omitted;
- total count comes from normalized arrays;
- pinned is rendered once outside regular rows;
- no pinned uses first platform material as `initialPreview`;
- unavailable redirect remains `null`;
- fallback cover is deterministic.

Example assertion:

```ts
expect(model.platforms[0]).toMatchObject({
  platform: 'dzen',
  anchor: 'materials-dzen',
  count: 2,
});
expect(model.pinned?.id).toBe('material_pinned');
expect(model.platforms[0].materials.map(({ id }) => id)).not.toContain('material_pinned');
expect(model.initialPreview?.id).toBe('material_pinned');
```

Run: `pnpm exec vitest run src/widgets/place-detail/model/build-place-detail-view-model.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 2: Implement the pure view-model builder**

Map raw material fields through existing display helpers, use `buildPlaceMaterialsAnchor`, omit zero-count platforms, move pinned out of its regular section, and create `previewsById` with `Object.fromEntries`.

- [ ] **Step 3: Add semantic static UI**

Implement:

- `PlaceDetailSpine`: semantic horizontal `h1`, decorative vertical duplicate, category badge, total count, and platform navigation slot.
- `PlaceDetailMaterialIndex`: optional pinned row `00`, then `section`/`h2` per platform.
- `PlaceDetailMaterialRow`: full-row safe anchor or non-interactive unavailable row, `data-material-id`, two-line title, metadata, and visible focus classes.

Use a desktop grid contract equivalent to:

```txt
lg:grid-cols-[7.5rem_minmax(22rem,0.9fr)_minmax(25rem,1.1fr)]
```

Below `lg`, render a normal page header, sticky horizontal navigation, full-width index, and no stage column.

- [ ] **Step 4: Rewrite server-rendered regression tests**

Keep existing redirect safety assertions and add:

```ts
expect(html).toContain('<main');
expect(html).toContain('<h1');
expect(html).toContain('href="#materials-telegram"');
expect(html).toContain('data-material-id="material_dzen_001"');
expect(html).toContain('target="_blank"');
expect(html).not.toContain('Mui');
expect(html).not.toContain('Thermal complex with spa zone.');
expect(html).not.toContain('aria-label="Теги места"');
```

- [ ] **Step 5: Run focused server tests**

Run:

```bash
pnpm exec vitest run src/widgets/place-detail/model/build-place-detail-view-model.test.ts src/widgets/place-detail/ui/place-detail.test.ts
pnpm exec tsc --noEmit --pretty false --incremental false
```

Expected: model and static UI tests pass.

- [ ] **Step 6: Commit the static archive**

```bash
git add src/widgets/place-detail
git commit -m "feat(place-detail): render archive index"
```

### Task 4: Add Focus Stage and platform scrollspy enhancement

**Files:**

- Create: `src/widgets/place-detail/lib/get-preview-id-from-target.test.ts`
- Create: `src/widgets/place-detail/lib/get-preview-id-from-target.ts`
- Create: `src/widgets/place-detail/ui/place-detail-focus-stage.tsx`
- Create: `src/widgets/place-detail/ui/place-detail-platform-navigation.tsx`
- Create: `src/widgets/place-detail/ui/place-detail-experience.tsx`
- Modify: `src/widgets/place-detail/ui/place-detail.tsx`

**Interfaces:**

- `PlaceDetailExperience` consumes server-rendered `spine` and `index` slots plus serializable preview data.
- `PlaceDetailPlatformNavigation` consumes `{ platform; anchor; label; count }[]`.
- `getPreviewIdFromTarget(target: EventTarget | null): string | null` duck-types a `closest()`-capable target and reads only `data-material-id` from the closest row, so the pure helper stays testable in the Node Vitest environment without adding jsdom.

- [ ] **Step 1: Test the target helper**

Write tests for non-element targets, nested elements, missing data attributes, and a valid material row. Run the test and verify RED before creating the helper.

- [ ] **Step 2: Implement the interaction boundary**

Use delegated `onPointerOver`, `onPointerLeave`, `onFocusCapture`, and `onBlurCapture` handlers. Store only the active material id; reset to `initialPreview.id` after pointer/focus leaves the index.

Render Server Component slots inside the client boundary:

```tsx
<div className="lg:grid lg:grid-cols-[7.5rem_minmax(22rem,0.9fr)_minmax(25rem,1.1fr)]">
  {spine}
  <div onPointerOver={handlePointerOver} onFocusCapture={handleFocus}>
    {index}
  </div>
  <PlaceDetailFocusStage coverImageUrl={coverImageUrl} preview={activePreview} />
</div>
```

- [ ] **Step 3: Implement the decorative Motion stage**

Use `motion/react` only in the client file. The stage has `aria-hidden="true"`, no link/button, a constant cover image, and `AnimatePresence` keyed by preview id. Configure reduced motion with `MotionConfig reducedMotion="user"`.

- [ ] **Step 4: Implement scrollspy navigation**

Render real anchors first. In `useEffect`, observe each platform section, select the highest visible intersecting section, and update the active marker plus `aria-current="location"`. Disconnect the observer on cleanup.

- [ ] **Step 5: Verify focused behavior**

Run:

```bash
pnpm exec vitest run src/widgets/place-detail/lib/get-preview-id-from-target.test.ts src/widgets/place-detail/ui/place-detail.test.ts
pnpm exec tsc --noEmit --pretty false --incremental false
pnpm run lint:strict
```

Then verify in a real browser:

- anchors work before interaction;
- hover and Tab update the stage;
- leaving resets to pinned/default;
- active platform follows scroll;
- reduced motion removes transform animation;
- at `390px`, one tap opens a row and stage is absent.

- [ ] **Step 6: Commit the enhancement**

```bash
git add src/widgets/place-detail
git commit -m "feat(place-detail): add archive focus interactions"
```

### Task 5: Remove the legacy detail composition and close edge states

**Files:**

- Delete: `src/widgets/place-detail/ui/material-summary.tsx`
- Delete: `src/widgets/place-detail/ui/pinned-material.tsx`
- Delete: `src/widgets/place-detail/ui/place-cover-image.tsx`
- Delete: `src/widgets/place-detail/ui/place-detail-hero.tsx`
- Delete: `src/widgets/place-detail/ui/place-materials-by-platform.tsx`
- Delete: `src/widgets/place-detail/ui/platform-counters.tsx`
- Delete: `src/widgets/place-detail/ui/platform-material-list.tsx`
- Modify: `src/widgets/place-detail/ui/place-detail.test.ts`

**Interfaces:**

- Public widget API stays `PlaceDetail({ place }: { place: PlaceDetailModel })`.
- No file under `src/widgets/place-detail` imports MUI or the legacy theme.

- [ ] **Step 1: Add edge-state assertions**

Cover:

- pinned without URL is visible but not an anchor;
- no pinned selects the first available material;
- no materials renders one empty state and no nav/stage;
- empty platform is absent;
- placeholder cover is present when `coverImageUrl` is null;
- long titles retain complete accessible text.

- [ ] **Step 2: Remove superseded MUI files**

Delete the seven old composition files only after the new imports and tests are green. Keep `src/widgets/place-detail/index.ts` exporting only `PlaceDetail`.

- [ ] **Step 3: Verify the MUI boundary**

Run:

```bash
rg -n '@mui|appStyleTokens|shared/ui/theme' src/widgets/place-detail src/entities/place/ui/place-category-badge.tsx
```

Expected: no matches. MUI matches may remain in catalog card files and root providers.

- [ ] **Step 4: Commit cleanup**

```bash
git add src/widgets/place-detail src/entities/place/ui
git commit -m "refactor(place-detail): remove legacy MUI composition"
```

### Task 6: Record the migration slice and run full verification

**Files:**

- Modify: `docs/architecture/mui-to-shadcn-migration-plan.md`

**Interfaces:**

- Documents the approved visual-redesign exception and the completed place-detail slice.

- [ ] **Step 1: Update migration documentation**

Record:

- Archive Spine × Focus Mode is an explicitly approved redesign, not visual parity.
- Place detail no longer imports MUI.
- MUI providers remain because catalog/auth surfaces still depend on them.
- Literata/Manrope are route-scoped.

- [ ] **Step 2: Run formatting and static checks**

```bash
pnpm exec prettier --check docs/architecture/mui-to-shadcn-migration-plan.md src/app/places src/entities/place src/shared/ui src/widgets/place-detail
pnpm exec tsc --noEmit --pretty false --incremental false
pnpm run lint:strict
git diff --check
```

- [ ] **Step 3: Run full tests and build**

```bash
pnpm run test:unit
pnpm run build
```

Expected: all commands exit with code 0.

- [ ] **Step 4: Complete visual checks**

Verify `1440px`, `1024px`, and `390px` for pinned/no-pinned, cover/placeholder, unavailable link, long title, empty platform, and no materials. Smoke-check the legacy home catalog at desktop/mobile widths.

- [ ] **Step 5: Commit documentation**

```bash
git add docs/architecture/mui-to-shadcn-migration-plan.md
git commit -m "docs(ui): record archive focus migration slice"
```

- [ ] **Step 6: Final branch audit**

```bash
git status --short --branch
git log --oneline origin/stage..HEAD
git diff --stat origin/stage...HEAD
```

Expected: clean worktree; only the design/plan docs, archive-detail implementation, targeted shared badge bridge, dependency lockfile, tests, and migration-plan update differ from `origin/stage`.
