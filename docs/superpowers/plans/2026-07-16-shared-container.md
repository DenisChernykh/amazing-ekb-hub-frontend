# Shared Container Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a server-compatible shared `Container` built on Tailwind CSS v4's standard `container` utility and adopt it in the catalog and loading page shells.

**Architecture:** `src/shared/ui/container.tsx` owns the common responsive width, centering, and horizontal gutters. Consumers select `div`, `main`, or `section` through `as` and keep vertical spacing and page-specific layout in their own `className`. The first adoption covers the catalog plus global/home loading shells; the intentionally narrow `ErrorState` and legacy MUI auth routes stay unchanged.

**Tech Stack:** React 19, TypeScript 5, Next.js 16 App Router, Tailwind CSS 4, Vitest 4, `react-dom/server`, existing shared `cn` helper.

## Global Constraints

- Use the standard Tailwind layout contract exactly: `container mx-auto px-4 sm:px-6 lg:px-8`.
- MUI is not a sizing or visual reference for the new component.
- Keep the component server-compatible: no `'use client'`, hooks, effects, or browser APIs.
- Support only `div`, `main`, and `section` through `as`; render `div` by default.
- Keep vertical spacing, background, grid/flex behavior, and page-specific presentation in consumer `className` values.
- Do not add width variants, MUI-compatible props, `w-full`, a global `@utility container` override, or new dependencies.
- Do not migrate `ErrorState` or legacy MUI auth routes in this slice.
- Use tests before implementation and commit each independently reviewable task.

---

## File Map

- Create `src/shared/ui/container.tsx`: shared polymorphic layout primitive.
- Create `src/shared/ui/container.test.tsx`: server-rendered contract tests for semantics, classes, and native prop forwarding.
- Modify `src/shared/ui/index.ts`: expose `Container` through the shared UI public API.
- Modify `src/widgets/places-catalog/ui/places-catalog.tsx`: replace the manual page shell with `Container`.
- Modify `src/widgets/places-catalog/ui/places-catalog.test.ts`: assert shared-container adoption without coupling to generated CSS.
- Modify `src/app/loading.tsx`: adopt `Container` while keeping flex and vertical spacing local.
- Modify `src/app/loading.test.ts`: assert shared-container adoption.
- Modify `src/app/(home)/loading.tsx`: adopt `Container` while keeping loading composition and vertical spacing local.
- Modify `src/app/(home)/loading.test.ts`: assert shared-container adoption.

### Task 1: Add the shared Container contract

**Files:**

- Create: `src/shared/ui/container.test.tsx`
- Create: `src/shared/ui/container.tsx`
- Modify: `src/shared/ui/index.ts`

**Interfaces:**

- Consumes: `cn(...inputs: ClassValue[]): string` from `@/shared/lib/utils`.
- Produces: `Container<T extends 'div' | 'main' | 'section' = 'div'>(props: ContainerProps<T>): ReactElement` through `@/shared/ui`.
- `ContainerProps<T>` combines `{ as?: T }` with native, ref-free props for `T`.

- [ ] **Step 1: Write the failing server-rendered contract test**

Create `src/shared/ui/container.test.tsx`:

```tsx
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Container } from './index';

describe('Container', () => {
  it('renders a centered responsive div and forwards native props', () => {
    const html = renderToStaticMarkup(
      createElement(
        Container,
        {
          'aria-label': 'Основное содержимое',
          className: 'py-8',
          id: 'page-shell',
        },
        'Содержимое',
      ),
    );

    expect(html).toContain('<div');
    expect(html).toContain('data-slot="container"');
    expect(html).toContain('class="container mx-auto px-4 sm:px-6 lg:px-8 py-8"');
    expect(html).toContain('id="page-shell"');
    expect(html).toContain('aria-label="Основное содержимое"');
    expect(html).toContain('>Содержимое</div>');
  });

  it('supports the approved main and section semantics', () => {
    const mainHtml = renderToStaticMarkup(
      createElement(Container, { as: 'main', 'aria-busy': true }, 'Main'),
    );
    const sectionHtml = renderToStaticMarkup(
      createElement(Container, { as: 'section', 'aria-label': 'Каталог' }, 'Section'),
    );

    expect(mainHtml).toContain('<main');
    expect(mainHtml).toContain('aria-busy="true"');
    expect(mainHtml).toContain('>Main</main>');
    expect(sectionHtml).toContain('<section');
    expect(sectionHtml).toContain('aria-label="Каталог"');
    expect(sectionHtml).toContain('>Section</section>');
  });
});
```

- [ ] **Step 2: Run the test and verify the missing public contract**

Run:

```bash
pnpm exec vitest run src/shared/ui/container.test.tsx
```

Expected: FAIL because `./index` does not export `Container`.

- [ ] **Step 3: Implement the minimal server-compatible component**

Create `src/shared/ui/container.tsx`:

```tsx
import type { ComponentPropsWithoutRef } from 'react';

import { cn } from '@/shared/lib/utils';

type ContainerElement = 'div' | 'main' | 'section';

type ContainerProps<T extends ContainerElement = 'div'> = {
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, 'as'>;

/**
 * Рендерит общий page-width контейнер на стандартной responsive-сетке Tailwind.
 */
function Container<T extends ContainerElement = 'div'>({
  as,
  className,
  ...props
}: Readonly<ContainerProps<T>>) {
  const Component = as ?? 'div';

  return (
    <Component
      data-slot="container"
      className={cn('container mx-auto px-4 sm:px-6 lg:px-8', className)}
      {...props}
    />
  );
}

export { Container };
```

Add the public export to `src/shared/ui/index.ts` after the card exports:

```ts
export { Container } from './container';
```

- [ ] **Step 4: Run the focused test and TypeScript check**

Run:

```bash
pnpm exec vitest run src/shared/ui/container.test.tsx
pnpm exec tsc --noEmit --pretty false --incremental false
```

Expected: the two `Container` tests PASS and TypeScript exits with code `0`.

- [ ] **Step 5: Commit the shared primitive**

```bash
git add src/shared/ui/container.tsx src/shared/ui/container.test.tsx src/shared/ui/index.ts
git commit -m "feat(ui): add shared container"
```

### Task 2: Adopt Container in PlacesCatalog

**Files:**

- Modify: `src/widgets/places-catalog/ui/places-catalog.test.ts`
- Modify: `src/widgets/places-catalog/ui/places-catalog.tsx`

**Interfaces:**

- Consumes: `Container` from `@/shared/ui` with `as="main"` and consumer-owned `className`.
- Produces: the same `PlacesCatalog({ model }: Readonly<PlacesCatalogProps>)` public contract and existing catalog semantics.

- [ ] **Step 1: Add failing adoption assertions**

In the first test in `src/widgets/places-catalog/ui/places-catalog.test.ts`, add these assertions after `expect(html).toContain('<main');`:

```ts
expect(html).toContain('data-slot="container"');
expect(html).toContain('pt-[30px]');
expect(html).toContain('pb-16');
expect(html).not.toContain('max-w-[1200px]');
```

- [ ] **Step 2: Run the catalog test and verify it fails**

Run:

```bash
pnpm exec vitest run src/widgets/places-catalog/ui/places-catalog.test.ts
```

Expected: FAIL because the current `<main>` has no `data-slot="container"` and still contains `max-w-[1200px]`.

- [ ] **Step 3: Replace only the outer page shell**

Add this import to `src/widgets/places-catalog/ui/places-catalog.tsx`:

```ts
import { Container } from '@/shared/ui';
```

Replace the existing opening tag:

```tsx
<main className="mx-auto w-full max-w-[1200px] px-4 pt-[30px] pb-16 min-[600px]:px-6 min-[600px]:pt-12">
```

with:

```tsx
<Container as="main" className="pt-[30px] pb-16 min-[600px]:pt-12">
```

Replace the matching final `</main>` with `</Container>`. Do not change the header, controls, grid or empty state, or pagination between those tags. This removes only `mx-auto`, `w-full`, `max-w-[1200px]`, `px-4`, and `min-[600px]:px-6` from the consumer because `Container` now owns width, centering, and gutters.

- [ ] **Step 4: Run the focused catalog and shared-container tests**

Run:

```bash
pnpm exec vitest run src/shared/ui/container.test.tsx src/widgets/places-catalog/ui/places-catalog.test.ts
```

Expected: both test files PASS; catalog copy, grid semantics, empty states, and pagination assertions remain green.

- [ ] **Step 5: Commit the catalog adoption**

```bash
git add src/widgets/places-catalog/ui/places-catalog.tsx src/widgets/places-catalog/ui/places-catalog.test.ts
git commit -m "refactor(places-catalog): use shared container"
```

### Task 3: Align global and home loading shells

**Files:**

- Modify: `src/app/loading.test.ts`
- Modify: `src/app/loading.tsx`
- Modify: `src/app/(home)/loading.test.ts`
- Modify: `src/app/(home)/loading.tsx`

**Interfaces:**

- Consumes: `Container` and `Skeleton` from `@/shared/ui`.
- Produces: unchanged `Loading()` and `HomeLoading()` Next.js route-boundary components with the shared page-width shell.

- [ ] **Step 1: Add failing shared-shell assertions**

In `src/app/loading.test.ts`, add after the `aria-label` assertion:

```ts
expect(html).toContain('data-slot="container"');
```

In `src/app/(home)/loading.test.ts`, add after the `aria-label` assertion:

```ts
expect(html).toContain('data-slot="container"');
```

- [ ] **Step 2: Run both loading tests and verify they fail**

Run:

```bash
pnpm exec vitest run src/app/loading.test.ts 'src/app/(home)/loading.test.ts'
```

Expected: both tests FAIL because neither current loading shell renders `data-slot="container"`.

- [ ] **Step 3: Adopt Container in the global loading boundary**

Change the import in `src/app/loading.tsx`:

```ts
import { Container, Skeleton } from '@/shared/ui';
```

Replace the outer `<main>` with:

```tsx
<Container as="main" aria-busy="true" className="flex py-8 sm:py-12">
  <section
    aria-label="Загрузка"
    aria-live="polite"
    className="flex min-h-60 w-full flex-col items-center justify-center gap-4 text-center"
    role="status"
  >
    <Skeleton aria-hidden="true" className="size-8 rounded-full" />
    <div className="flex flex-col items-center gap-2">
      <Skeleton aria-hidden="true" className="h-4 w-28" />
      <span className="text-sm text-muted-foreground">Загрузка...</span>
    </div>
  </section>
</Container>
```

- [ ] **Step 4: Adopt Container in the home loading boundary**

Change the import in `src/app/(home)/loading.tsx`:

```ts
import { Container, Skeleton } from '@/shared/ui';
```

Replace this outer opening tag:

```tsx
<main aria-busy="true" className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
```

with:

```tsx
<Container as="main" aria-busy="true" className="py-8 sm:py-12">
```

Replace the matching final `</main>` with `</Container>` and leave the existing catalog-shaped loading section unchanged. This removes the old shell classes `mx-auto`, `w-full`, `max-w-6xl`, `px-4`, `sm:px-6`, and `lg:px-8`; `Container` owns those concerns.

- [ ] **Step 5: Run the shared component, loading, and catalog tests**

Run:

```bash
pnpm exec vitest run src/shared/ui/container.test.tsx src/app/loading.test.ts 'src/app/(home)/loading.test.ts' src/widgets/places-catalog/ui/places-catalog.test.ts
```

Expected: all four test files PASS; both loading states retain their status semantics, copy, skeletons, and expected card count.

- [ ] **Step 6: Commit the loading adoption**

```bash
git add src/app/loading.tsx src/app/loading.test.ts 'src/app/(home)/loading.tsx' 'src/app/(home)/loading.test.ts'
git commit -m "refactor(loading): use shared container"
```

### Task 4: Verify the complete Container slice

**Files:**

- Verify only: all files changed in Tasks 1-3.

**Interfaces:**

- Consumes: completed shared primitive and all three adopted page shells.
- Produces: evidence that formatting, lint, types, tests, build, and responsive behavior meet the approved spec.

- [ ] **Step 1: Check formatting for the exact changed files**

Run:

```bash
pnpm exec prettier --check src/shared/ui/container.tsx src/shared/ui/container.test.tsx src/shared/ui/index.ts src/widgets/places-catalog/ui/places-catalog.tsx src/widgets/places-catalog/ui/places-catalog.test.ts src/app/loading.tsx src/app/loading.test.ts 'src/app/(home)/loading.tsx' 'src/app/(home)/loading.test.ts'
```

Expected: `All matched files use Prettier code style!`.

- [ ] **Step 2: Run static and unit quality gates before starting a dev server**

Run:

```bash
pnpm run lint:strict
pnpm exec tsc --noEmit --pretty false --incremental false
pnpm run test:unit
git diff --check HEAD~3..HEAD
```

Expected: ESLint exits with no warnings, TypeScript exits with code `0`, the full Vitest suite passes, and `git diff --check` prints no errors.

- [ ] **Step 3: Run the production build**

Run:

```bash
pnpm run build
```

Expected: Next.js completes the production build and route generation with exit code `0`.

- [ ] **Step 4: Verify responsive page-shell behavior in a real browser**

Run the dev server only after the type and build checks:

```bash
pnpm run dev
```

Open `/` at widths `390`, `768`, `1024`, and `1440` pixels. At each width verify:

- the catalog and home loading state are horizontally centered;
- horizontal gutters are present and no content touches the viewport edge;
- no horizontal scrollbar appears;
- the catalog heading, filters, cards or empty state, and pagination remain usable;
- loading and loaded shells use the same standard Tailwind container geometry.

Expected: all five checks pass at every viewport; exact MUI width parity is intentionally not required.

- [ ] **Step 5: Confirm final repository state**

Run:

```bash
git status --short --branch
git log -5 --oneline
```

Expected: no uncommitted changes remain; the log shows the design spec, this implementation plan, and the three logical implementation commits from this plan.
