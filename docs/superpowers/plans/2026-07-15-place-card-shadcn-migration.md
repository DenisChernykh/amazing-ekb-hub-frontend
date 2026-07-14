# Place Card shadcn Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the complete reusable place-card entity slice from MUI to the existing shadcn/Tailwind foundation without changing catalog behavior or visual design.

**Architecture:** Keep the entity contract and URL helpers unchanged, compose `PlaceCard` from the existing shared `Card`, `CardContent`, and `Badge`, and render the media through `next/image` inside a positioned 4:3 frame. The card, image, title, and platform links remain server-renderable and independent, while Tailwind reproduces the current card shadows, lift, focus treatment, and reduced-motion behavior.

**Tech Stack:** Next.js 16.2.6 App Router, React 19.2.3, TypeScript 5, Tailwind CSS 4.3.2, project-owned shadcn/ui components, Base UI render composition, Vitest 4.1.6.

## Global Constraints

- Preserve visual parity; this pull request is not a redesign.
- Do not modify `PlacesCatalog`, `CatalogControls`, `PlacesPagination`, catalog URL-state work from issue `#76`, forms, login UI, route layouts, providers, the MUI bridge, Emotion, dependencies, or `components.json`.
- Do not change place DTOs, `PlaceCardModel`, mappers, href builders, public APIs, or `src/entities/place/index.ts`.
- Do not add `PlacePlatformBadge` and do not run the shadcn CLI; the required shared `Card` and `Badge` already exist.
- Keep image and title links separate from platform links; nested anchors are forbidden.
- Keep the three card UI files server-renderable with no `'use client'`, MUI, or legacy theme imports.
- Keep runtime handling of a non-empty image URL that later fails to load unchanged; do not add an event-handler fallback or a client boundary.
- Preserve unrelated user changes and do not commit temporary screenshots or browser artifacts.
- Use test-driven development. The badge test's red phase was already recorded before its current working-tree implementation; all new card/image behavior must still start with a failing test.

## File Map

- Modify `src/entities/place/ui/place-card-badges.tsx`: retain the accepted server-rendered shared `Badge` implementation.
- Create `src/entities/place/ui/place-card-badges.test.ts`: retain the accepted static-render regression coverage already present in the working tree.
- Modify `src/entities/place/ui/place-card.tsx`: replace MUI card composition with shared `Card`/`CardContent` and Tailwind states.
- Modify `src/entities/place/ui/place-card-image.tsx`: replace MUI media primitives with `next/image` and a Tailwind frame.
- Create `src/entities/place/ui/place-card.test.ts`: cover the complete card's server-rendered structure, links, image branches, and absence of MUI.
- Modify `docs/architecture/mui-to-shadcn-migration-plan.md`: record the complete place-card entity slice in Phase 2 and remove place cards from remaining Phase 4 work.
- Do not modify `src/shared/ui/card.tsx`, `src/shared/ui/badge.tsx`, any public `index.ts`, or `src/widgets/places-catalog/ui/places-catalog.tsx`.

## Current Working-Tree Precondition

At plan creation, the branch already contains an uncommitted badge implementation, its test, and a partial migration-plan update. Task 1 owns the two badge files. Task 3 owns the migration-plan file. Stage only the files listed by each task so the logical commits remain separate.

---

### Task 1: Finish and Commit the Platform Badge Slice

**Files:**

- Modify: `src/entities/place/ui/place-card-badges.tsx`
- Create: `src/entities/place/ui/place-card-badges.test.ts`

**Interfaces:**

- Consumes: `PlaceCardModel`, `getVisiblePlatformCounters()`, `getPlatformDisplay()`, `buildPlaceMaterialsHref()`, and shared `Badge` with its `render` prop.
- Produces: `PlaceCardBadges({ place }: Readonly<{ place: PlaceCardModel }>)`, a server-renderable semantic group containing one link badge per positive platform counter.

- [ ] **Step 1: Complete the accepted test file with the full server-render contract**

Make `src/entities/place/ui/place-card-badges.test.ts` match this complete content:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PlaceCardModel } from '../model/types';
import { PlaceCardBadges } from './place-card-badges';

const PLACE: PlaceCardModel = {
  id: 'place ekb/001',
  title: 'Баден-Баден Уктус',
  category: {
    id: 'category_spa',
    slug: 'spa',
    title: 'SPA',
    badgeBackgroundColor: '#faf0ed',
  },
  coverImageUrl: null,
  platformCounters: {
    dzen: 12,
    telegram: 7,
    instagram: 0,
  },
};

describe('PlaceCardBadges', () => {
  it('renders positive platform counters as semantic shadcn link badges', () => {
    const html = renderToStaticMarkup(createElement(PlaceCardBadges, { place: PLACE }));

    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Категория и материалы"');
    expect(html).toContain('class="flex min-h-7 flex-wrap gap-1.5"');
    expect(html.match(/data-slot="badge"/g)).toHaveLength(2);
    expect(html).toContain('href="/places/place%20ekb%2F001#materials-dzen"');
    expect(html).toContain('href="/places/place%20ekb%2F001#materials-telegram"');
    expect(html.indexOf('materials-dzen')).toBeLessThan(html.indexOf('materials-telegram'));
    expect(html).not.toContain('materials-instagram');
    expect(html).toContain('>12<');
    expect(html).toContain('>Дзен<');
    expect(html).toContain('>7<');
    expect(html).toContain('>Telegram<');
    expect(html).toContain('h-6');
    expect(html).toContain('size-[18px]');
    expect(html).toContain('bg-white/72');
    expect(html).toContain('background-color:#e5e7eb');
    expect(html).toContain('background-color:#dff3ff');
    expect(html).toContain('hover:brightness-95');
    expect(html).toContain('focus-visible:ring-[3px]');
    expect(html).not.toContain('MuiChip');
    expect(html).not.toContain('MuiAvatar');
  });

  it('keeps an empty fixed-height group when every counter is zero', () => {
    const html = renderToStaticMarkup(
      createElement(PlaceCardBadges, {
        place: {
          ...PLACE,
          platformCounters: {
            dzen: 0,
            telegram: 0,
            instagram: 0,
          },
        },
      }),
    );

    expect(html).toContain('role="group"');
    expect(html).toContain('aria-label="Категория и материалы"');
    expect(html).toContain('min-h-7');
    expect(html).not.toContain('<a ');
    expect(html).not.toContain('data-slot="badge"');
  });
});
```

- [ ] **Step 2: Confirm the badge implementation matches the accepted minimal implementation**

Keep `src/entities/place/ui/place-card-badges.tsx` with this complete content:

```tsx
import { Badge } from '@/shared/ui';
import Link from 'next/link';
import { buildPlaceMaterialsHref } from '../lib/build-place-materials-href';
import { getPlatformDisplay, getVisiblePlatformCounters } from '../model/place-display';
import type { PlaceCardModel } from '../model/types';

interface PlaceCardBadgesProps {
  place: PlaceCardModel;
}

/**
 * Рендерит platform/count бейджи карточки.
 *
 * @param props - Данные карточки места.
 */
export function PlaceCardBadges({ place }: Readonly<PlaceCardBadgesProps>) {
  const platformCounters = getVisiblePlatformCounters(place.platformCounters);

  return (
    <div role="group" aria-label="Категория и материалы" className="flex min-h-7 flex-wrap gap-1.5">
      {platformCounters.map(({ platform, count }) => {
        const platformDisplay = getPlatformDisplay(platform);

        return (
          <Badge
            render={<Link href={buildPlaceMaterialsHref(place.id, platform)} />}
            key={platform}
            className="h-6 gap-1 rounded-full border-transparent py-0 pr-2 pl-1 text-[0.8125rem] leading-6 font-bold no-underline transition-[filter,box-shadow] hover:brightness-95"
            style={{
              backgroundColor: platformDisplay.backgroundColor,
              color: platformDisplay.color,
            }}
          >
            <span className="flex size-[18px] shrink-0 items-center justify-center rounded-full bg-white/72 text-[0.72rem] leading-none font-extrabold">
              {count}
            </span>
            <span>{platformDisplay.label}</span>
          </Badge>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Run the focused badge test**

Run:

```bash
pnpm exec vitest run src/entities/place/ui/place-card-badges.test.ts
```

Expected: one test file passes with two passing tests.

- [ ] **Step 4: Verify the badge leaf has no client or MUI dependency**

Run:

```bash
rg -n "'use client'|@mui/material|shared/ui/theme|MuiChip|MuiAvatar" src/entities/place/ui/place-card-badges.tsx
```

Expected: no output and exit code 1, meaning none of the forbidden strings remain.

- [ ] **Step 5: Commit only the badge slice**

```bash
git add src/entities/place/ui/place-card-badges.tsx src/entities/place/ui/place-card-badges.test.ts
git diff --cached --check
git commit -m "refactor(place-card): migrate platform badges to shadcn"
```

Expected: the commit contains exactly the two badge files. The migration-plan edit remains unstaged.

---

### Task 2: Migrate the Card Surface and Image with TDD

**Files:**

- Create: `src/entities/place/ui/place-card.test.ts`
- Modify: `src/entities/place/ui/place-card.tsx`
- Modify: `src/entities/place/ui/place-card-image.tsx`

**Interfaces:**

- Consumes: `PlaceCardModel`, `buildPlaceHref(placeId: string): string`, `PlaceCardBadges`, `PlaceCategoryBadge`, shared `Card`/`CardContent`, `next/link`, and `next/image`.
- Produces: `PlaceCard({ place }: Readonly<{ place: PlaceCardModel }>)` and `PlaceCardImage({ category, src, title })`, both server-renderable and free of MUI.

- [ ] **Step 1: Capture the MUI card baseline before editing the two remaining UI files**

Run the development server in a separate terminal:

```bash
pnpm dev
```

Expected: Next.js reports ready on `http://127.0.0.1:3001`.

Using the Playwright/browser workflow, capture the current `/` route at `1440x1000` and `390x844` to `/tmp/place-card-before-desktop.png` and `/tmp/place-card-before-mobile.png`. The baseline intentionally contains the current MUI card surface/image plus the accepted shadcn platform badges. Do not add these files to Git.

- [ ] **Step 2: Add the failing static-render test**

Create `src/entities/place/ui/place-card.test.ts` with this complete content:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { PlaceCardModel } from '../model/types';
import { PlaceCard } from './place-card';

const PLACE: PlaceCardModel = {
  id: 'place ekb/001',
  title: 'Баден-Баден Уктус',
  category: {
    id: 'category_spa',
    slug: 'spa',
    title: 'SPA',
    badgeBackgroundColor: '#faf0ed',
  },
  coverImageUrl: '/images/places/baden.webp',
  platformCounters: {
    dzen: 12,
    telegram: 7,
    instagram: 0,
  },
};

describe('PlaceCard', () => {
  it('server-renders the complete card with separate semantic links and no MUI markup', () => {
    const html = renderToStaticMarkup(createElement(PlaceCard, { place: PLACE }));
    const anchorFragments = html.match(/<a\b[^>]*>.*?<\/a>/gs) ?? [];

    expect(html).toContain('data-slot="card"');
    expect(html).toContain('data-slot="card-content"');
    expect(html.match(/href="\/places\/place%20ekb%2F001"/g)).toHaveLength(2);
    expect(html).toContain('href="/places/place%20ekb%2F001#materials-dzen"');
    expect(html).toContain('href="/places/place%20ekb%2F001#materials-telegram"');
    expect(html).toContain('Баден-Баден Уктус');
    expect(html).toContain('alt="Фото места Баден-Баден Уктус"');
    expect(html).toContain('/images/places/baden.webp');
    expect(html).toContain('loading="lazy"');
    expect(html).toContain('>SPA<');
    expect(html.match(/data-slot="badge"/g)).toHaveLength(3);
    expect(anchorFragments).toHaveLength(4);
    expect(anchorFragments.every((anchor) => (anchor.match(/<a\b/g) ?? []).length === 1)).toBe(
      true,
    );
    expect(html).not.toContain('Mui');
  });

  it('uses the deterministic local image when the cover URL is blank', () => {
    const html = renderToStaticMarkup(
      createElement(PlaceCard, {
        place: {
          ...PLACE,
          coverImageUrl: '   ',
        },
      }),
    );

    expect(html).toContain('/images/places/place-placeholder.webp');
    expect(html).toContain('alt="Фото места Баден-Баден Уктус"');
  });
});
```

- [ ] **Step 3: Run the new test and verify the red phase**

Run:

```bash
pnpm exec vitest run src/entities/place/ui/place-card.test.ts
```

Expected: the first test fails because the current MUI card does not emit `data-slot="card"` and still emits `Mui*` markup. The failure must be an assertion failure, not an import or environment failure.

- [ ] **Step 4: Replace the MUI card composition**

Replace `src/entities/place/ui/place-card.tsx` with:

```tsx
import { Card, CardContent } from '@/shared/ui';
import Link from 'next/link';
import { buildPlaceHref } from '../lib/build-place-href';
import type { PlaceCardModel } from '../model/types';
import { PlaceCardBadges } from './place-card-badges';
import { PlaceCardImage } from './place-card-image';

interface PlaceCardProps {
  place: PlaceCardModel;
}

/**
 * Рендерит кликабельную карточку места.
 *
 * @param props - Данные карточки места.
 */
export function PlaceCard({ place }: Readonly<PlaceCardProps>) {
  const placeHref = buildPlaceHref(place.id);

  return (
    <Card className="h-full gap-0 py-0 shadow-app-card hover:ring-primary/35 hover:shadow-app-card-hover focus-within:ring-primary/35 focus-within:shadow-app-card-focus motion-safe:transition-[transform,box-shadow] motion-safe:duration-[180ms] motion-safe:ease-out motion-safe:hover:-translate-y-1 motion-safe:focus-within:-translate-y-1">
      <Link
        href={placeHref}
        className="block focus-visible:z-[1] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-inset"
      >
        <PlaceCardImage category={place.category} src={place.coverImageUrl} title={place.title} />
      </Link>

      <CardContent className="flex min-h-28 w-full flex-col gap-2.5 p-3.5">
        <p className="line-clamp-2 text-[clamp(1.05rem,0.9rem+0.45vw,1.28rem)] leading-[1.18] font-bold text-card-foreground">
          <Link
            href={placeHref}
            className="rounded-sm text-inherit no-underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            {place.title}
          </Link>
        </p>
        <PlaceCardBadges place={place} />
      </CardContent>
    </Card>
  );
}
```

The shared `Card` already provides `group/card`, `overflow-hidden`, `rounded-lg`, `ring-1`, and the card colors. The local classes override only spacing and the app-specific interaction contract.

- [ ] **Step 5: Replace the MUI image composition**

Replace `src/entities/place/ui/place-card-image.tsx` with:

```tsx
import Image from 'next/image';
import type { PlaceCardModel } from '../model/types';
import { PlaceCategoryBadge } from './place-category-badge';

const PLACE_PLACEHOLDER_IMAGE_SRC = '/images/places/place-placeholder.webp';

interface PlaceCardImageProps {
  category: PlaceCardModel['category'];
  src: string | null;
  title: string;
}

/**
 * Рендерит фото карточки места с локальной заглушкой.
 *
 * @param props - Данные изображения карточки.
 */
export function PlaceCardImage({ category, src, title }: Readonly<PlaceCardImageProps>) {
  const imageSrc = src?.trim() ? src : PLACE_PLACEHOLDER_IMAGE_SRC;

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
      <Image
        fill
        unoptimized
        src={imageSrc}
        alt={`Фото места ${title}`}
        loading="lazy"
        sizes="(max-width: 899px) calc(100vw - 32px), (max-width: 1199px) calc((100vw - 64px) / 2), 384px"
        className="object-cover motion-safe:transition-transform motion-safe:duration-[260ms] motion-safe:ease-out motion-safe:group-hover/card:scale-[1.035] motion-safe:group-focus-within/card:scale-[1.035]"
      />

      <PlaceCategoryBadge
        category={category}
        className="absolute top-3 left-3 z-[1] shadow-[0_8px_20px_rgb(15_23_42/14%)]"
      />
    </div>
  );
}
```

Next.js 16 documentation requires the `fill` image parent to be positioned; `relative` supplies that containing block. `unoptimized` keeps the raw same-origin URL and omits optimizer-generated `srcSet`; `sizes` documents the current one/two/three-column layout and keeps the component ready if optimization is enabled later.

- [ ] **Step 6: Format the three task files**

Run:

```bash
pnpm exec prettier --write src/entities/place/ui/place-card.tsx src/entities/place/ui/place-card-image.tsx src/entities/place/ui/place-card.test.ts
```

Expected: Prettier completes successfully and does not touch files outside this task.

- [ ] **Step 7: Run the focused place-card tests and verify the green phase**

Run:

```bash
pnpm exec vitest run src/entities/place/ui/place-card.test.ts src/entities/place/ui/place-card-badges.test.ts
```

Expected: two test files pass with four passing tests.

- [ ] **Step 8: Run focused static checks**

Run:

```bash
pnpm exec eslint src/entities/place/ui/place-card.tsx src/entities/place/ui/place-card-image.tsx src/entities/place/ui/place-card-badges.tsx src/entities/place/ui/place-card.test.ts src/entities/place/ui/place-card-badges.test.ts --max-warnings=0
pnpm exec tsc --noEmit --pretty false
rg -n "'use client'|@mui/material|shared/ui/theme|Mui" src/entities/place/ui/place-card.tsx src/entities/place/ui/place-card-image.tsx src/entities/place/ui/place-card-badges.tsx
```

Expected: ESLint and TypeScript exit 0. The final `rg` prints nothing and exits 1 because the three migrated UI files contain none of the forbidden strings.

- [ ] **Step 9: Compare the migrated card with the baseline**

With the development server running, use the same browser workflow and viewports to capture `/tmp/place-card-after-desktop.png` and `/tmp/place-card-after-mobile.png`. Verify:

- 4:3 media frame, category badge position, card radius, border, base shadow, content padding, and card heights match the baseline;
- short and two-line titles clamp correctly;
- real covers and `/images/places/place-placeholder.webp` both render;
- hover lifts the card by 4px and scales the image to `1.035`;
- image, title, and platform links each expose a visible keyboard focus state;
- emulated `prefers-reduced-motion: reduce` removes lift, image scale, and motion transitions while preserving immediate shadow/focus feedback;
- the browser console has no errors.

If the computed values differ from the design contract, invoke `superpowers:systematic-debugging` before changing classes. Delete the four `/tmp/place-card-*.png` artifacts after comparison.

- [ ] **Step 10: Commit the card and image migration**

```bash
git add src/entities/place/ui/place-card.tsx src/entities/place/ui/place-card-image.tsx src/entities/place/ui/place-card.test.ts
git diff --cached --check
git commit -m "refactor(place-card): migrate card surface to shadcn"
```

Expected: the commit contains exactly the new card test and the two migrated UI files.

---

### Task 3: Record the Expanded Phase 2 Slice

**Files:**

- Modify: `docs/architecture/mui-to-shadcn-migration-plan.md:58-77`
- Modify: `docs/architecture/mui-to-shadcn-migration-plan.md:98-105`

**Interfaces:**

- Consumes: the completed `PlaceCard`, `PlaceCardImage`, and `PlaceCardBadges` implementation from Tasks 1-2.
- Produces: migration roadmap text that treats the complete entity card as Phase 2 work and leaves page-level catalog composition in Phase 4.

- [ ] **Step 1: Replace the Phase 2 heading, fourth item, and completed-slice entry**

Make the Phase 2 block read:

```markdown
### Phase 2: Display Primitives and Entity Cards

Status: in progress.

Migrate reusable display components:

1. Category badges/chips.
2. Material metadata badges.
3. Platform counters.
4. Reusable entity cards built on stable shared primitives.

Completed slice:

- The complete place-card entity slice (`PlaceCard`, `PlaceCardImage`, and `PlaceCardBadges`) now uses the shared shadcn `Card` and `Badge` contracts, keeps its image, title, and platform links server-rendered, and no longer imports MUI or requires a client boundary.

Exit criteria:

- New `Badge`, `Card`, and related shared components cover the repeated display patterns.
- Domain components import shared UI through public APIs.
- No domain slice owns duplicated badge/card styling that should be shared.
```

- [ ] **Step 2: Remove place cards from the remaining Phase 4 list**

Make the Phase 4 list read:

```markdown
Migrate the most visible page-level surfaces last:

1. Places catalog layout.
2. Place detail hero.
3. Pinned material and materials-by-platform sections.
```

Do not alter the existing completed place-detail notes below the list.

- [ ] **Step 3: Check and commit the documentation update**

```bash
pnpm exec prettier --check docs/architecture/mui-to-shadcn-migration-plan.md
git diff --check -- docs/architecture/mui-to-shadcn-migration-plan.md
git add docs/architecture/mui-to-shadcn-migration-plan.md
git diff --cached --check
git commit -m "docs(ui): complete place card migration slice"
```

Expected: the commit contains only the migration-plan update.

---

### Task 4: Run Full Verification and Legacy Smoke Tests

**Files:**

- Verify only; no planned source changes.

**Interfaces:**

- Consumes: all implementation and documentation commits from Tasks 1-3.
- Produces: reproducible test, build, browser, and Git evidence that the expanded pull request is ready for review.

- [ ] **Step 1: Invoke the completion-verification discipline**

Read and apply `superpowers:verification-before-completion`. Do not claim success from earlier runs; every command below must run against the final branch state.

- [ ] **Step 2: Run targeted and full unit tests**

```bash
pnpm exec vitest run src/entities/place/ui/place-card.test.ts src/entities/place/ui/place-card-badges.test.ts
pnpm run test:unit
```

Expected: the focused two files pass with four tests, then the full suite exits 0 with no failed tests.

- [ ] **Step 3: Run repository quality gates**

```bash
pnpm run lint:strict
pnpm run format:check
pnpm run typecheck
git diff --check origin/stage...HEAD
```

Expected: every command exits 0. `typecheck` may update generated `.next` cache data but must not create tracked changes.

- [ ] **Step 4: Run the production build**

```bash
pnpm run build
```

Expected: Next.js production compilation and route generation complete successfully. If sandbox DNS alone blocks Google Fonts, rerun the identical build with the environment's approved escalation and record the first failure as environmental rather than changing application code.

- [ ] **Step 5: Run final catalog browser checks**

Start `pnpm dev` if it is not already running. Check `/` at `1440x1000` and `390x844`, including hover, keyboard focus, real image, local fallback, multi-badge wrapping, all-zero badge height, and reduced motion. Expected: parity with the baseline, no layout shift, and no browser-console errors.

- [ ] **Step 6: Smoke-test the representative legacy MUI route**

Check `/login` at `1440x1000` and `390x844`. Expected: the existing MUI login layout, inputs, focus states, and responsive behavior remain unchanged, with no console errors. This proves the root MUI/Emotion bridge still works.

- [ ] **Step 7: Verify scope and clean Git state**

```bash
git status --short --branch
git diff --name-only origin/stage...HEAD
git log --oneline origin/stage..HEAD
```

Expected tracked PR files:

```text
docs/architecture/mui-to-shadcn-migration-plan.md
docs/superpowers/plans/2026-07-15-place-card-shadcn-migration.md
docs/superpowers/specs/2026-07-15-place-card-shadcn-migration-design.md
src/entities/place/ui/place-card-badges.test.ts
src/entities/place/ui/place-card-badges.tsx
src/entities/place/ui/place-card-image.tsx
src/entities/place/ui/place-card.test.ts
src/entities/place/ui/place-card.tsx
```

The working tree must be clean. No catalog widget, control, pagination, issue `#76`, dependency, generated API, screenshot, or temporary browser file may appear in the diff.

- [ ] **Step 8: Prepare the review handoff**

Use `superpowers:requesting-code-review` for the final implementation diff. Report the exact commands run, browser viewports checked, commit list, any environment-only build retry, and the remaining Phase 3/Phase 4 MUI scope. Do not push or create a pull request unless the user explicitly requests publishing.
