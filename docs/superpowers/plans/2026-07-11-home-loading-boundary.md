# Home Loading Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the catalog-shaped loader only on `/` while retaining a generic fallback for every other route.

**Architecture:** Put the home route in the URL-neutral `(home)` route group and give that segment its own `loading.tsx`. Keep the root `loading.tsx` generic, so each loading surface matches the routes it owns.

**Tech Stack:** Next.js 16 App Router, React, TypeScript, Tailwind CSS, shadcn/ui Skeleton, Vitest.

## Global Constraints

- Do not change public URLs.
- Do not add MUI imports to migrated loading UI.
- Do not add a permanent loading delay.
- Keep the change limited to route placement, loading UI, tests, and migration documentation.
- Preserve desktop and mobile behavior.

---

### Task 1: Add the home loading regression test

**Files:**

- Create: `src/app/(home)/loading.test.ts`
- Create: `src/app/(home)/loading.tsx`

**Interfaces:**

- Consumes: `Skeleton` from `@/shared/ui`.
- Produces: default `HomeLoading` route fallback for `/`.

- [ ] **Step 1: Write the failing test**

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import HomeLoading from './loading';

describe('HomeLoading', () => {
  it('renders the catalog-shaped loading skeleton for the home route', () => {
    const html = renderToStaticMarkup(createElement(HomeLoading));

    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('aria-label="Загрузка каталога"');
    expect(html).toContain('data-slot="skeleton"');
    expect(html.match(/<article/g) ?? []).toHaveLength(6);
    expect(html).toContain('Загрузка...');
    expect(html).toContain('sr-only');
    expect(html).not.toContain('Mui');
  });
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `pnpm exec vitest run 'src/app/(home)/loading.test.ts'`

Expected: FAIL because `src/app/(home)/loading.tsx` does not exist.

- [ ] **Step 3: Restore the catalog-shaped fallback**

Create `src/app/(home)/loading.tsx` with the previously approved structure:

```tsx
import { Skeleton } from '@/shared/ui';

const categoryChipWidths = ['w-12', 'w-20', 'w-24', 'w-16', 'w-28', 'w-20'] as const;

const placeCardSkeletons = [
  { titleWidth: 'w-11/12', subtitleWidth: 'w-7/12', chips: ['w-12', 'w-16'] },
  { titleWidth: 'w-10/12', subtitleWidth: 'w-5/12', chips: ['w-16', 'w-12'] },
  { titleWidth: 'w-11/12', subtitleWidth: 'w-8/12', chips: ['w-14'] },
  { titleWidth: 'w-9/12', subtitleWidth: 'w-6/12', chips: ['w-12', 'w-14'] },
  { titleWidth: 'w-10/12', subtitleWidth: 'w-5/12', chips: ['w-16'] },
  { titleWidth: 'w-11/12', subtitleWidth: 'w-7/12', chips: ['w-14', 'w-12'] },
] as const;

export default function HomeLoading() {
  return (
    <main aria-busy="true" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <section aria-label="Загрузка каталога" aria-live="polite" className="w-full" role="status">
        <span className="sr-only">Загрузка...</span>

        <div aria-hidden="true" className="flex flex-col gap-7">
          <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-12 w-40 rounded-lg bg-muted/90 sm:h-14 sm:w-56" />
              <Skeleton className="h-4 w-28 rounded-sm" />
            </div>
            <Skeleton className="h-8 w-32 rounded-full bg-primary/10" />
          </header>

          <div className="rounded-lg border border-border/80 bg-card p-4 shadow-app-card sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Skeleton className="h-11 min-w-0 flex-1 rounded-md bg-muted/80" />
              <Skeleton className="h-11 w-full rounded-md bg-primary/15 sm:w-32" />
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <Skeleton className="h-4 w-24 rounded-sm" />
              <div className="flex flex-wrap gap-2">
                {categoryChipWidths.map((width, index) => (
                  <Skeleton
                    key={`${width}-${index}`}
                    className={`${width} h-7 rounded-full bg-muted/80`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {placeCardSkeletons.map((card, index) => (
              <article
                className="overflow-hidden rounded-lg border border-border/80 bg-card shadow-app-card"
                key={`${card.titleWidth}-${index}`}
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <Skeleton className="size-full rounded-none bg-muted/90" />
                  <Skeleton className="absolute top-3 left-3 h-7 w-24 rounded-full bg-card/75" />
                </div>

                <div className="flex flex-col gap-3 p-4">
                  <div className="flex flex-col gap-2">
                    <Skeleton className={`${card.titleWidth} h-4 rounded-sm bg-muted/90`} />
                    <Skeleton className={`${card.subtitleWidth} h-4 rounded-sm`} />
                  </div>

                  <div className="flex min-h-7 flex-wrap gap-2">
                    {card.chips.map((width, chipIndex) => (
                      <Skeleton
                        key={`${width}-${chipIndex}`}
                        className={`${width} h-6 rounded-full bg-primary/10`}
                      />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="flex justify-center gap-2 pt-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-9 rounded-md bg-primary/15" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Run the focused loading tests and verify GREEN**

Run: `pnpm exec vitest run 'src/app/(home)/loading.test.ts' src/app/loading.test.ts`

Expected: two test files pass; the home test proves catalog structure and the root test proves generic copy.

### Task 2: Scope the home route to its loading boundary

**Files:**

- Move: `src/app/page.tsx` to `src/app/(home)/page.tsx`
- Verify: `src/app/loading.tsx`

**Interfaces:**

- Consumes: existing `HomePageContent` and `getHomePageData` imports.
- Produces: the same `/` route under the `(home)` segment.

- [ ] **Step 1: Move the route entry without changing its implementation**

```bash
git mv src/app/page.tsx 'src/app/(home)/page.tsx'
```

The moved file keeps the imports, props contract, search parameter normalization, data loading, and rendered `HomePageContent` unchanged.

- [ ] **Step 2: Verify framework and source checks**

Run: `pnpm exec prettier --check 'src/app/(home)/page.tsx' 'src/app/(home)/loading.tsx' 'src/app/(home)/loading.test.ts' src/app/loading.tsx src/app/loading.test.ts`

Run: `pnpm exec tsc --noEmit --pretty false --incremental false`

Run: `pnpm run lint:strict`

Expected: all commands exit with code 0.

- [ ] **Step 3: Verify route output visually**

Start the local app with a temporary development-only delay, verify `/` at desktop and mobile widths shows the catalog skeleton, then verify `/login` and `/places/[placeId]` never show catalog placeholders. Remove the delay before committing.

- [ ] **Step 4: Run the full relevant test suite and build**

Run: `pnpm run test:unit`

Run: `pnpm run build`

Expected: all unit tests pass and Next.js lists `/` once with no route conflict.

- [ ] **Step 5: Commit and push the PR branch**

Run: `git add docs/superpowers src/app`

Run: `git commit -m "fix(ui): scope catalog loader to home"`

Run: `git push`

Expected: the branch updates the existing PR and GitHub validation starts for the new head commit.
