# Places Catalog shadcn Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the complete public places-catalog UI surrounding the already-migrated cards from MUI to Tailwind CSS and project-owned shadcn/ui components without changing URL-state behavior or visual design.

**Architecture:** Keep `PlacesCatalog` as the server-rendered widget composition boundary and keep `CatalogControls` plus `PlacesPagination` as leaf client features. Add only the shadcn input, label, and pagination seeds required by this slice, preserve the project-owned Button implementation, build one shared outlined text-field contract, and keep all catalog navigation routed through the existing canonical `currentSearchParams` and href helpers.

**Tech Stack:** Next.js 16.2.6 App Router, React 19.2.3, TypeScript 5, Tailwind CSS 4.3.2, shadcn CLI 4.13.0 with Base Nova/Base UI components, Base UI 1.6.0, lucide-react 1.23.0, Vitest 4.1.6.

## Global Constraints

- Preserve visual parity; this pull request is not a redesign.
- Do not change the canonical catalog URL-state implementation completed by PR `#78` and clarified by PR `#79`.
- Do not change route loading, API calls, DTOs, entity mappers, `PlacesCatalogModel`, `CatalogControlsModel`, `PlacesPaginationModel`, or existing href builders.
- Keep `PlacesCatalog` server-renderable and keep `CatalogControls` plus `PlacesPagination` as leaf client boundaries.
- Keep search uncontrolled, submit-only, limited to exactly 100 characters, and remounted through `buildCatalogControlsInputKey` when applied search/category state changes.
- Keep the current MUI-equivalent breakpoints exactly at 600px, 900px, and 1200px for the migrated catalog composition.
- Keep the current container maximum at 1200px, mobile/desktop gutters at 16px/24px, grid gaps at 16px/20px, and pagination top margin at 34px.
- Add only shadcn `input`, `label`, and `pagination` through the CLI. Do not run `shadcn add --all`.
- The CLI dry-run proves that pagination wants to overwrite `src/shared/ui/button.tsx`; immediately restore that project-owned file after generation and verify it is unchanged.
- Add no validation/helper/error API to the shared text field in this slice; the login migration owns those later states.
- Keep first, previous, current, next, and last pagination controls visible below 600px; show the complete boundary/sibling/ellipsis range at 600px and wider.
- Preserve the MUI/Emotion provider and theme bridge because login and auth-lab routes still depend on it.
- Preserve unrelated user changes and do not commit temporary screenshots, trace files, browser profiles, or `.next` output.
- Use test-driven development: every new behavior starts with a focused failing test, then minimal implementation, then a passing focused test.

## File Map

- Create `src/shared/ui/input.tsx`: shadcn/Base UI input seed added by the CLI.
- Create `src/shared/ui/label.tsx`: shadcn label seed added by the CLI.
- Create `src/shared/ui/pagination.tsx`: shadcn pagination composition added by the CLI.
- Create `src/shared/ui/text-field.tsx`: project-owned outlined/floating-label composition for the catalog search field.
- Create `src/shared/ui/text-field.test.ts`: static-render contract for label association and native input props.
- Modify `src/shared/ui/index.ts`: export the three CLI seeds and `TextField` through the shared UI public API.
- Create `src/features/places-pagination/lib/build-places-pagination-items.ts`: pure compact numeric/ellipsis range builder.
- Create `src/features/places-pagination/lib/build-places-pagination-items.test.ts`: exact first/middle/last range coverage.
- Create `src/features/catalog-controls/ui/catalog-category-filters.tsx`: feature-private category button list.
- Create `src/features/catalog-controls/ui/catalog-controls.test.ts`: static-render search/category semantics.
- Modify `src/features/catalog-controls/ui/catalog-controls.tsx`: replace MUI with Tailwind, shared `TextField`, shared `Button`, and the private category list.
- Create `src/features/places-pagination/ui/places-pagination-action.tsx`: feature-private shadcn pagination link/action adapter.
- Create `src/features/places-pagination/ui/places-pagination.test.ts`: compact responsive navigation and accessibility coverage.
- Modify `src/features/places-pagination/ui/places-pagination.tsx`: replace MUI Pagination with the shared composition and pure item model.
- Create `src/widgets/places-catalog/ui/places-catalog.test.ts`: populated, filtered-empty, and page-empty widget coverage.
- Modify `src/widgets/places-catalog/ui/places-catalog.tsx`: replace MUI container/header/grid primitives with semantic HTML and Tailwind.
- Modify `docs/architecture/mui-to-shadcn-migration-plan.md`: record catalog controls, pagination, and the public catalog layout as completed.
- Do not modify `src/shared/ui/button.tsx`, `components.json`, catalog models, href builders, or any generated API files.

## Execution Precondition

Before Task 1, run:

```bash
git branch --show-current
git status --short
git merge-base --is-ancestor origin/stage HEAD
```

Expected: the branch is `refactor/places-catalog-shadcn`, status prints no changed files, and the ancestry check exits 0. If the status is not clean, preserve and classify those changes before touching any overlapping file.

## Git Safety Contract

- `git add <explicit paths>` stages only the logical task files; never use `git add .` in this plan.
- `git diff --cached --check` verifies the staged patch has no whitespace errors before every commit.
- `git commit -m <message>` creates one Conventional Commit after the task's focused checks pass.
- `git restore src/shared/ui/button.tsx` is allowed only in Task 1 after confirming the file is clean; it discards only the shadcn CLI's proposed overwrite and restores the current committed project-owned Button.
- Verify each commit with `git show --stat --oneline HEAD`. If an unpublished task commit later needs to be undone, ask before rewriting history; after publication, use a separate `git revert <commit>` rather than reset.

---

### Task 1: Add the Shared Form and Pagination Primitives

**Files:**

- Create: `src/shared/ui/input.tsx`
- Create: `src/shared/ui/label.tsx`
- Create: `src/shared/ui/pagination.tsx`
- Create: `src/shared/ui/text-field.tsx`
- Create: `src/shared/ui/text-field.test.ts`
- Modify: `src/shared/ui/index.ts:1-13`
- Verify unchanged: `src/shared/ui/button.tsx`

**Interfaces:**

- Consumes: configured shadcn aliases from `components.json`, existing `cn()`, existing project-owned `Button`, and native input/label props.
- Produces: `Input`, `Label`, all shadcn pagination subcomponents, and `TextField({ id, label, containerClassName?, labelClassName?, ...inputProps })` through `@/shared/ui`.

- [ ] **Step 1: Write the failing shared text-field test**

Create `src/shared/ui/text-field.test.ts` with this complete content:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TextField } from './text-field';

describe('TextField', () => {
  it('renders an associated floating label and forwards native input props', () => {
    const html = renderToStaticMarkup(
      createElement(TextField, {
        id: 'catalog-search',
        label: 'Поиск',
        name: 'search',
        defaultValue: 'spa',
        placeholder: 'Название или описание места',
        maxLength: 100,
      }),
    );

    expect(html).toContain('data-slot="text-field"');
    expect(html).toContain('data-slot="input"');
    expect(html).toContain('data-slot="label"');
    expect(html).toContain('id="catalog-search"');
    expect(html).toContain('for="catalog-search"');
    expect(html).toContain('name="search"');
    expect(html).toContain('value="spa"');
    expect(html).toContain('placeholder="Название или описание места"');
    expect(html).toMatch(/maxlength="100"/i);
    expect(html).toContain('>Поиск</label>');
    expect(html).not.toContain('Mui');
  });
});
```

- [ ] **Step 2: Run the test to verify the red phase**

Run:

```bash
pnpm exec vitest run src/shared/ui/text-field.test.ts
```

Expected: FAIL because `./text-field` does not exist.

- [ ] **Step 3: Preview and apply the three shadcn seeds through the CLI**

Run the non-writing preview first:

```bash
pnpm exec shadcn add input label pagination --dry-run --yes
```

Expected: three new files (`input.tsx`, `label.tsx`, `pagination.tsx`) and one proposed overwrite (`button.tsx`).

Apply the registry items, then immediately restore the customized Button:

```bash
git diff --quiet -- src/shared/ui/button.tsx
pnpm exec shadcn add input label pagination --yes
git restore src/shared/ui/button.tsx
git diff --exit-code origin/stage -- src/shared/ui/button.tsx
```

Expected: the precondition exits 0 because Button has no user changes, the CLI creates the three new shared files, and the final comparison exits 0 with no output, proving the project-owned Button is byte-for-byte unchanged from `origin/stage`.

- [ ] **Step 4: Implement the project-owned outlined text field**

Create `src/shared/ui/text-field.tsx` with this complete content:

```tsx
import { cn } from '@/shared/lib/utils';
import type * as React from 'react';
import { Input } from './input';
import { Label } from './label';

interface TextFieldProps extends Omit<React.ComponentProps<typeof Input>, 'id'> {
  id: string;
  label: string;
  containerClassName?: string;
  labelClassName?: string;
}

/**
 * Рендерит project-owned outlined field с постоянно видимой floating label.
 *
 * @param props - Нативные input props, label и классы композиции.
 */
function TextField({
  className,
  containerClassName,
  id,
  label,
  labelClassName,
  ...props
}: TextFieldProps) {
  return (
    <div
      data-slot="text-field"
      className={cn('group/text-field relative w-full', containerClassName)}
    >
      <Input id={id} className={cn('h-10 rounded-sm px-3', className)} {...props} />
      <Label
        htmlFor={id}
        className={cn(
          'absolute top-0 left-2 z-10 -translate-y-1/2 cursor-text bg-background px-1 text-xs leading-none text-muted-foreground transition-colors group-focus-within/text-field:text-primary',
          labelClassName,
        )}
      >
        {label}
      </Label>
    </div>
  );
}

export { TextField };
```

Append these exports to `src/shared/ui/index.ts` after the existing Card exports and before Skeleton:

```ts
export { Input } from './input';
export { Label } from './label';
export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from './pagination';
export { TextField } from './text-field';
```

Keep the existing Alert, Badge, Button, Card, and Skeleton exports unchanged.

- [ ] **Step 5: Run the focused test and strict lint for shared UI**

Run:

```bash
pnpm exec vitest run src/shared/ui/text-field.test.ts
pnpm exec eslint src/shared/ui/input.tsx src/shared/ui/label.tsx src/shared/ui/pagination.tsx src/shared/ui/text-field.tsx src/shared/ui/text-field.test.ts src/shared/ui/index.ts --max-warnings=0
```

Expected: one test file passes with one passing test; ESLint exits 0 without warnings.

- [ ] **Step 6: Verify CLI scope and formatting**

Run:

```bash
pnpm exec prettier --check src/shared/ui/input.tsx src/shared/ui/label.tsx src/shared/ui/pagination.tsx src/shared/ui/text-field.tsx src/shared/ui/text-field.test.ts src/shared/ui/index.ts
git diff --check
git status --short
```

Expected: only the three CLI files, `text-field.tsx`, its test, and `shared/ui/index.ts` are changed. `button.tsx`, `package.json`, and `pnpm-lock.yaml` are absent from the status.

- [ ] **Step 7: Commit the shared primitives**

```bash
git add src/shared/ui/input.tsx src/shared/ui/label.tsx src/shared/ui/pagination.tsx src/shared/ui/text-field.tsx src/shared/ui/text-field.test.ts src/shared/ui/index.ts
git diff --cached --check
git commit -m "feat(ui): add catalog field and pagination primitives"
```

Expected: the commit contains exactly five new shared UI files plus the public index edit.

---

### Task 2: Model the Compact Pagination Range with TDD

**Files:**

- Create: `src/features/places-pagination/lib/build-places-pagination-items.ts`
- Create: `src/features/places-pagination/lib/build-places-pagination-items.test.ts`

**Interfaces:**

- Consumes: the validated invariant `1 <= page <= pageCount` from `PlacesPaginationModel`.
- Produces: `buildPlacesPaginationItems({ page, pageCount }): PlacesPaginationItem[]`, where an item is `{ type: 'page'; page: number }` or `{ type: 'ellipsis'; key: 'start' | 'end' }`.

- [ ] **Step 1: Write the failing range-builder test**

Create `src/features/places-pagination/lib/build-places-pagination-items.test.ts` with this complete content:

```ts
import { describe, expect, it } from 'vitest';
import { buildPlacesPaginationItems } from './build-places-pagination-items';

describe('buildPlacesPaginationItems', () => {
  it('returns every page when the count fits the seven-item window', () => {
    expect(buildPlacesPaginationItems({ page: 3, pageCount: 7 })).toEqual([
      { type: 'page', page: 1 },
      { type: 'page', page: 2 },
      { type: 'page', page: 3 },
      { type: 'page', page: 4 },
      { type: 'page', page: 5 },
      { type: 'page', page: 6 },
      { type: 'page', page: 7 },
    ]);
  });

  it('keeps the first five pages, an end ellipsis, and the boundary page near the start', () => {
    expect(buildPlacesPaginationItems({ page: 2, pageCount: 20 })).toEqual([
      { type: 'page', page: 1 },
      { type: 'page', page: 2 },
      { type: 'page', page: 3 },
      { type: 'page', page: 4 },
      { type: 'page', page: 5 },
      { type: 'ellipsis', key: 'end' },
      { type: 'page', page: 20 },
    ]);
  });

  it('keeps boundary pages, one sibling on each side, and two ellipses in the middle', () => {
    expect(buildPlacesPaginationItems({ page: 10, pageCount: 20 })).toEqual([
      { type: 'page', page: 1 },
      { type: 'ellipsis', key: 'start' },
      { type: 'page', page: 9 },
      { type: 'page', page: 10 },
      { type: 'page', page: 11 },
      { type: 'ellipsis', key: 'end' },
      { type: 'page', page: 20 },
    ]);
  });

  it('keeps the boundary page, a start ellipsis, and the final five pages near the end', () => {
    expect(buildPlacesPaginationItems({ page: 19, pageCount: 20 })).toEqual([
      { type: 'page', page: 1 },
      { type: 'ellipsis', key: 'start' },
      { type: 'page', page: 16 },
      { type: 'page', page: 17 },
      { type: 'page', page: 18 },
      { type: 'page', page: 19 },
      { type: 'page', page: 20 },
    ]);
  });

  it('never emits duplicate page numbers or adjacent ellipses', () => {
    for (let page = 1; page <= 30; page += 1) {
      const items = buildPlacesPaginationItems({ page, pageCount: 30 });
      const pages = items.filter((item) => item.type === 'page').map((item) => item.page);

      expect(new Set(pages).size).toBe(pages.length);
      expect(
        items.some(
          (item, index) => item.type === 'ellipsis' && items[index + 1]?.type === 'ellipsis',
        ),
      ).toBe(false);
    }
  });
});
```

- [ ] **Step 2: Run the range-builder test to verify the red phase**

Run:

```bash
pnpm exec vitest run src/features/places-pagination/lib/build-places-pagination-items.test.ts
```

Expected: FAIL because `build-places-pagination-items.ts` does not exist.

- [ ] **Step 3: Implement the minimal deterministic item builder**

Create `src/features/places-pagination/lib/build-places-pagination-items.ts` with this complete content:

```ts
type PageItem = {
  type: 'page';
  page: number;
};

type EllipsisItem = {
  type: 'ellipsis';
  key: 'start' | 'end';
};

export type PlacesPaginationItem = PageItem | EllipsisItem;

type BuildPlacesPaginationItemsOptions = {
  page: number;
  pageCount: number;
};

const MAX_VISIBLE_ITEMS = 7;

/**
 * Это хелпер. Строит включительный диапазон номеров страниц.
 *
 * @param start - Первый номер.
 * @param end - Последний номер.
 * @returns Последовательность page items.
 */
function buildPageRange(start: number, end: number): PageItem[] {
  return Array.from({ length: end - start + 1 }, (_, index) => ({
    type: 'page',
    page: start + index,
  }));
}

/**
 * Это хелпер. Строит MUI-equivalent compact range с boundary/sibling страницами.
 *
 * @param options - Текущая страница и общее число страниц.
 * @returns Page и ellipsis items в порядке отображения.
 */
export function buildPlacesPaginationItems({
  page,
  pageCount,
}: BuildPlacesPaginationItemsOptions): PlacesPaginationItem[] {
  if (pageCount <= MAX_VISIBLE_ITEMS) {
    return buildPageRange(1, pageCount);
  }

  if (page <= 4) {
    return [
      ...buildPageRange(1, 5),
      { type: 'ellipsis', key: 'end' },
      { type: 'page', page: pageCount },
    ];
  }

  if (page >= pageCount - 3) {
    return [
      { type: 'page', page: 1 },
      { type: 'ellipsis', key: 'start' },
      ...buildPageRange(pageCount - 4, pageCount),
    ];
  }

  return [
    { type: 'page', page: 1 },
    { type: 'ellipsis', key: 'start' },
    ...buildPageRange(page - 1, page + 1),
    { type: 'ellipsis', key: 'end' },
    { type: 'page', page: pageCount },
  ];
}
```

- [ ] **Step 4: Run focused tests and static checks**

Run:

```bash
pnpm exec vitest run src/features/places-pagination/lib/build-places-pagination-items.test.ts
pnpm exec eslint src/features/places-pagination/lib/build-places-pagination-items.ts src/features/places-pagination/lib/build-places-pagination-items.test.ts --max-warnings=0
pnpm exec prettier --check src/features/places-pagination/lib/build-places-pagination-items.ts src/features/places-pagination/lib/build-places-pagination-items.test.ts
```

Expected: one test file passes with five passing tests; lint and formatting exit 0.

- [ ] **Step 5: Commit the pure pagination model**

```bash
git add src/features/places-pagination/lib/build-places-pagination-items.ts src/features/places-pagination/lib/build-places-pagination-items.test.ts
git diff --cached --check
git commit -m "feat(pagination): model compact page range"
```

Expected: the commit contains exactly the helper and its test.

---

### Task 3: Migrate Catalog Search and Category Controls

**Files:**

- Create: `src/features/catalog-controls/ui/catalog-category-filters.tsx`
- Create: `src/features/catalog-controls/ui/catalog-controls.test.ts`
- Modify: `src/features/catalog-controls/ui/catalog-controls.tsx:1-116`

**Interfaces:**

- Consumes: `CatalogControlsModel`, `getPlaceCategoryDisplay()`, shared `TextField`, shared `Button`, shared `Badge`, `buildCatalogControlsHref()`, and `buildCatalogControlsInputKey()`.
- Produces: unchanged public `CatalogControls({ model, currentSearchParams })` plus feature-private `CatalogCategoryFilters({ categories, activeCategorySlug, onCategoryChange })`.

- [ ] **Step 1: Capture the MUI controls baseline before editing**

Run the development server in a separate terminal:

```bash
pnpm run dev
```

Expected: Next.js reports ready on `http://127.0.0.1:3001`.

Using the Playwright browser workflow, save these temporary baselines:

- `/tmp/catalog-before-desktop.png` at `1440x1000` on `/`;
- `/tmp/catalog-before-mobile.png` at `390x844` on `/`;
- `/tmp/catalog-before-filtered.png` at `1440x1000` after applying one category and a search value.

Record the chosen category slug and resulting query string in the execution notes. Do not add the screenshots to Git.

- [ ] **Step 2: Write the failing catalog-controls static-render tests**

Create `src/features/catalog-controls/ui/catalog-controls.test.ts` with this complete content:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { CatalogControlsModel } from '../model/types';
import { CatalogControls } from './catalog-controls';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

const MODEL: CatalogControlsModel = {
  search: 'spa',
  activeCategorySlug: 'night-life',
  categories: [
    {
      id: 'category_spa',
      slug: 'spa',
      title: 'SPA',
      badgeBackgroundColor: '#faf0ed',
    },
    {
      id: 'category_night_life',
      slug: 'night-life',
      title: 'Ночная жизнь',
      badgeBackgroundColor: '#111827',
    },
  ],
};

describe('CatalogControls', () => {
  it('renders the search field and ordered category buttons without MUI markup', () => {
    const html = renderToStaticMarkup(
      createElement(CatalogControls, {
        model: MODEL,
        currentSearchParams: 'search=spa&category=night-life',
      }),
    );

    expect(html).toContain('aria-label="Фильтры каталога"');
    expect(html).toContain('data-slot="text-field"');
    expect(html).toContain('id="catalog-search"');
    expect(html).toContain('for="catalog-search"');
    expect(html).toContain('name="search"');
    expect(html).toContain('value="spa"');
    expect(html).toContain('placeholder="Название или описание места"');
    expect(html).toMatch(/maxlength="100"/i);
    expect(html).toContain('type="submit"');
    expect(html).toContain('>Найти</button>');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('background-color:#111827');
    expect(html).toContain('color:#ffffff');
    expect(html.indexOf('>Все</button>')).toBeLessThan(html.indexOf('>SPA</button>'));
    expect(html.indexOf('>SPA</button>')).toBeLessThan(html.indexOf('>Ночная жизнь</button>'));
    expect(html.match(/<button\b/g)).toHaveLength(4);
    expect(html).not.toContain('Mui');
  });

  it('marks the All category as active when no category slug is applied', () => {
    const html = renderToStaticMarkup(
      createElement(CatalogControls, {
        model: {
          ...MODEL,
          activeCategorySlug: undefined,
        },
        currentSearchParams: 'search=spa',
      }),
    );

    expect(html).toMatch(/<button[^>]*aria-pressed="true"[^>]*>Все<\/button>/);
    expect(html.match(/aria-pressed="false"/g)).toHaveLength(2);
  });
});
```

- [ ] **Step 3: Run the controls test to verify the red phase**

Run:

```bash
pnpm exec vitest run src/features/catalog-controls/ui/catalog-controls.test.ts
```

Expected: FAIL because the current component renders MUI classes and has no shared text-field or button-based category contract.

- [ ] **Step 4: Extract the feature-private category filter list**

Create `src/features/catalog-controls/ui/catalog-category-filters.tsx` with this complete content:

```tsx
import { getPlaceCategoryDisplay, type PlaceCategory } from '@/entities/place';
import { Badge } from '@/shared/ui';

interface CatalogCategoryFiltersProps {
  activeCategorySlug?: string;
  categories: PlaceCategory[];
  onCategoryChange: (categorySlug: string | null) => void;
}

const CATEGORY_BUTTON_CLASS_NAME =
  'h-8 cursor-pointer rounded-full px-3 py-0 text-[0.8125rem] leading-8 font-bold transition-[filter,background-color,color,border-color,box-shadow] hover:brightness-95';

/**
 * Рендерит feature-private список category filter buttons.
 *
 * @param props - Категории, активный slug и callback перехода.
 */
export function CatalogCategoryFilters({
  activeCategorySlug,
  categories,
  onCategoryChange,
}: Readonly<CatalogCategoryFiltersProps>) {
  return (
    <div className="flex flex-wrap gap-2">
      <Badge
        render={
          <button
            aria-pressed={!activeCategorySlug}
            onClick={() => onCategoryChange(null)}
            type="button"
          />
        }
        className={CATEGORY_BUTTON_CLASS_NAME}
        variant={activeCategorySlug ? 'outline' : 'default'}
      >
        Все
      </Badge>

      {categories.map((placeCategory) => {
        const display = getPlaceCategoryDisplay(placeCategory);
        const isActive = activeCategorySlug === placeCategory.slug;

        return (
          <Badge
            render={
              <button
                aria-pressed={isActive}
                onClick={() => onCategoryChange(placeCategory.slug)}
                type="button"
              />
            }
            key={placeCategory.id}
            className={CATEGORY_BUTTON_CLASS_NAME}
            style={
              isActive
                ? {
                    backgroundColor: display.backgroundColor,
                    color: display.color,
                  }
                : undefined
            }
            variant={isActive ? 'default' : 'outline'}
          >
            {display.label}
          </Badge>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: Replace the MUI controls composition**

Replace `src/features/catalog-controls/ui/catalog-controls.tsx` with this complete content:

```tsx
'use client';

import { Button, TextField } from '@/shared/ui';
import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { buildCatalogControlsHref } from '../lib/build-catalog-controls-href';
import { buildCatalogControlsInputKey } from '../lib/build-catalog-controls-input-key';
import type { CatalogControlsModel } from '../model/types';
import { CatalogCategoryFilters } from './catalog-category-filters';

interface CatalogControlsProps {
  model: CatalogControlsModel;
  currentSearchParams: string;
}

/**
 * Рендерит URL-driven controls публичного каталога мест.
 *
 * @param props - Модель controls из server-side каталога.
 */
export function CatalogControls({ model, currentSearchParams }: Readonly<CatalogControlsProps>) {
  const { search, activeCategorySlug, categories } = model;
  const router = useRouter();

  /**
   * Это хелпер. Навигирует каталог к следующему URL-состоянию controls.
   *
   * @param next - Следующее состояние поиска или категории.
   */
  function navigate(next: Parameters<typeof buildCatalogControlsHref>[0]['next']) {
    router.push(
      buildCatalogControlsHref({
        currentSearchParams,
        next,
      }),
    );
  }

  /**
   * Это хелпер. Применяет поисковую строку только по submit.
   *
   * @param event - Browser submit event формы поиска.
   */
  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const nextSearch = String(formData.get('search') ?? '');

    navigate({ search: nextSearch });
  }

  return (
    <section aria-label="Фильтры каталога" className="mb-7 flex flex-col gap-[18px]">
      <form
        className="flex flex-col items-stretch gap-2.5 min-[600px]:flex-row min-[600px]:items-start"
        onSubmit={handleSearchSubmit}
      >
        <TextField
          key={buildCatalogControlsInputKey({ search, category: activeCategorySlug })}
          containerClassName="min-w-0 flex-1"
          defaultValue={search ?? ''}
          id="catalog-search"
          label="Поиск"
          maxLength={100}
          name="search"
          placeholder="Название или описание места"
        />
        <Button className="h-10 w-full min-[600px]:w-auto min-[600px]:min-w-32" type="submit">
          Найти
        </Button>
      </form>

      <div className="flex flex-col gap-2">
        <h2 className="text-sm leading-[1.55] font-medium text-muted-foreground">Категории</h2>
        <CatalogCategoryFilters
          activeCategorySlug={activeCategorySlug}
          categories={categories}
          onCategoryChange={(category) => navigate({ category })}
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Run focused controls checks**

Run:

```bash
pnpm exec vitest run src/features/catalog-controls/ui/catalog-controls.test.ts src/features/catalog-controls/lib/build-catalog-controls-href.test.ts src/features/catalog-controls/lib/build-catalog-controls-input-key.test.ts
pnpm exec eslint src/features/catalog-controls/ui/catalog-controls.tsx src/features/catalog-controls/ui/catalog-category-filters.tsx src/features/catalog-controls/ui/catalog-controls.test.ts --max-warnings=0
pnpm exec prettier --check src/features/catalog-controls/ui/catalog-controls.tsx src/features/catalog-controls/ui/catalog-category-filters.tsx src/features/catalog-controls/ui/catalog-controls.test.ts
rg -n "@mui|Mui" src/features/catalog-controls/ui
```

Expected: all focused tests pass; lint and formatting exit 0; the final `rg` prints no matches and exits 1.

- [ ] **Step 7: Commit the catalog controls migration**

```bash
git add src/features/catalog-controls/ui/catalog-controls.tsx src/features/catalog-controls/ui/catalog-category-filters.tsx src/features/catalog-controls/ui/catalog-controls.test.ts
git diff --cached --check
git commit -m "refactor(catalog-controls): migrate filters to shadcn"
```

Expected: the commit contains exactly the controls entry, private category list, and component test.

---

### Task 4: Migrate Pagination to the Shared shadcn Composition

**Files:**

- Create: `src/features/places-pagination/ui/places-pagination-action.tsx`
- Create: `src/features/places-pagination/ui/places-pagination.test.ts`
- Modify: `src/features/places-pagination/ui/places-pagination.tsx:1-59`

**Interfaces:**

- Consumes: `PlacesPaginationModel`, `buildPlacesPaginationItems()`, `buildPlacesPaginationHref()`, shared pagination components, `useRouter()`, and lucide first/previous/next/last icons.
- Produces: unchanged public `PlacesPagination({ pagination, currentSearchParams })` plus feature-private `PlacesPaginationAction` for accessible href and `router.push` behavior.

- [ ] **Step 1: Write the failing pagination component tests**

Create `src/features/places-pagination/ui/places-pagination.test.ts` with this complete content:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { PlacesPagination } from './places-pagination';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

function renderPagination(page: number, pageCount: number): string {
  return renderToStaticMarkup(
    createElement(PlacesPagination, {
      pagination: { page, pageCount },
      currentSearchParams: `search=spa&page=${page}`,
    }),
  );
}

describe('PlacesPagination', () => {
  it('renders nothing for a single page', () => {
    expect(renderPagination(1, 1)).toBe('');
  });

  it('renders accessible disabled boundaries and the compact start range', () => {
    const html = renderPagination(1, 20);

    expect(html).toContain('aria-label="Пагинация мест"');
    expect(html.match(/aria-disabled="true"/g)).toHaveLength(2);
    expect(html).toContain('aria-current="page"');
    expect(html).toContain('aria-label="Страница 1, текущая"');
    expect(html).toContain('aria-label="Следующая страница"');
    expect(html).toContain('href="/?search=spa&amp;page=2"');
    expect(html).toContain('aria-label="Последняя страница"');
    expect(html).toContain('href="/?search=spa&amp;page=20"');
    expect(html).toContain('data-slot="pagination-ellipsis"');
    expect(html).toContain('hidden min-[600px]:block');
    expect(html).not.toContain('Mui');
  });

  it('renders two ellipses and neighboring destinations in the middle', () => {
    const html = renderPagination(10, 20);

    expect(html.match(/data-slot="pagination-ellipsis"/g)).toHaveLength(2);
    expect(html).toContain('aria-label="Страница 10, текущая"');
    expect(html).toContain('href="/?search=spa&amp;page=9"');
    expect(html).toContain('href="/?search=spa&amp;page=11"');
    expect(html).toContain('href="/?search=spa"');
    expect(html).toContain('href="/?search=spa&amp;page=20"');
  });

  it('disables next and last controls on the final page', () => {
    const html = renderPagination(20, 20);

    expect(html.match(/aria-disabled="true"/g)).toHaveLength(2);
    expect(html).toContain('aria-label="Страница 20, текущая"');
    expect(html).toContain('aria-label="Предыдущая страница"');
    expect(html).toContain('href="/?search=spa&amp;page=19"');
  });
});
```

- [ ] **Step 2: Run the pagination component test to verify the red phase**

Run:

```bash
pnpm exec vitest run src/features/places-pagination/ui/places-pagination.test.ts
```

Expected: FAIL because the current MUI component has no shared pagination slots, compact range, or explicit Russian page labels.

- [ ] **Step 3: Implement the feature-private pagination action adapter**

Create `src/features/places-pagination/ui/places-pagination-action.tsx` with this complete content:

```tsx
import { cn } from '@/shared/lib/utils';
import { PaginationLink } from '@/shared/ui';
import type { MouseEvent, ReactNode } from 'react';
import { buildPlacesPaginationHref } from '../lib/build-places-pagination-href';

interface PlacesPaginationActionProps {
  ariaLabel: string;
  children: ReactNode;
  currentSearchParams: string;
  disabled?: boolean;
  isActive?: boolean;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, page: number) => void;
  page: number;
}

/**
 * Рендерит один link-like pagination action поверх shared shadcn primitive.
 *
 * @param props - Destination page, accessibility state и navigate callback.
 */
export function PlacesPaginationAction({
  ariaLabel,
  children,
  currentSearchParams,
  disabled = false,
  isActive = false,
  onNavigate,
  page,
}: Readonly<PlacesPaginationActionProps>) {
  const href = disabled ? undefined : buildPlacesPaginationHref({ currentSearchParams, page });

  return (
    <PaginationLink
      aria-disabled={disabled || undefined}
      aria-label={ariaLabel}
      className={cn(
        'rounded-sm',
        isActive &&
          'border-primary bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
        disabled && 'pointer-events-none opacity-50',
      )}
      data-page={page}
      href={href}
      isActive={isActive}
      onClick={(event) => onNavigate(event, page)}
      size="icon-sm"
      tabIndex={disabled ? -1 : undefined}
    >
      {children}
    </PaginationLink>
  );
}
```

- [ ] **Step 4: Replace the MUI pagination composition**

Replace `src/features/places-pagination/ui/places-pagination.tsx` with this complete content:

```tsx
'use client';

import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem } from '@/shared/ui';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronsLeftIcon,
  ChevronsRightIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import { buildPlacesPaginationItems } from '../lib/build-places-pagination-items';
import { buildPlacesPaginationHref } from '../lib/build-places-pagination-href';
import type { PlacesPaginationModel } from '../model/types';
import { PlacesPaginationAction } from './places-pagination-action';

interface PlacesPaginationProps {
  pagination: PlacesPaginationModel;
  currentSearchParams: string;
}

/**
 * Рендерит постраничную навигацию каталога мест.
 *
 * @param props - Текущее состояние пагинации.
 */
export function PlacesPagination({
  pagination,
  currentSearchParams,
}: Readonly<PlacesPaginationProps>) {
  const { page, pageCount } = pagination;
  const router = useRouter();

  if (pageCount <= 1) {
    return null;
  }

  const items = buildPlacesPaginationItems({ page, pageCount });
  const isFirstPage = page === 1;
  const isLastPage = page === pageCount;

  /**
   * Это хелпер. Переводит pagination action в canonical URL каталога.
   *
   * @param event - Click event semantic anchor.
   * @param nextPage - Выбранный номер страницы.
   */
  function handlePageChange(event: MouseEvent<HTMLAnchorElement>, nextPage: number) {
    event.preventDefault();

    if (nextPage === page) {
      return;
    }

    router.push(buildPlacesPaginationHref({ currentSearchParams, page: nextPage }));
  }

  return (
    <Pagination aria-label="Пагинация мест" className="mt-[34px]">
      <PaginationContent className="max-w-full gap-1.5">
        <PaginationItem>
          <PlacesPaginationAction
            ariaLabel="Первая страница"
            currentSearchParams={currentSearchParams}
            disabled={isFirstPage}
            onNavigate={handlePageChange}
            page={1}
          >
            <ChevronsLeftIcon />
          </PlacesPaginationAction>
        </PaginationItem>
        <PaginationItem>
          <PlacesPaginationAction
            ariaLabel="Предыдущая страница"
            currentSearchParams={currentSearchParams}
            disabled={isFirstPage}
            onNavigate={handlePageChange}
            page={Math.max(1, page - 1)}
          >
            <ChevronLeftIcon />
          </PlacesPaginationAction>
        </PaginationItem>

        {items.map((item) => {
          if (item.type === 'ellipsis') {
            return (
              <PaginationItem key={item.key} className="hidden min-[600px]:block">
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          const isActive = item.page === page;

          return (
            <PaginationItem
              key={item.page}
              className={isActive ? undefined : 'hidden min-[600px]:block'}
            >
              <PlacesPaginationAction
                ariaLabel={`Страница ${item.page}${isActive ? ', текущая' : ''}`}
                currentSearchParams={currentSearchParams}
                isActive={isActive}
                onNavigate={handlePageChange}
                page={item.page}
              >
                {item.page}
              </PlacesPaginationAction>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PlacesPaginationAction
            ariaLabel="Следующая страница"
            currentSearchParams={currentSearchParams}
            disabled={isLastPage}
            onNavigate={handlePageChange}
            page={Math.min(pageCount, page + 1)}
          >
            <ChevronRightIcon />
          </PlacesPaginationAction>
        </PaginationItem>
        <PaginationItem>
          <PlacesPaginationAction
            ariaLabel="Последняя страница"
            currentSearchParams={currentSearchParams}
            disabled={isLastPage}
            onNavigate={handlePageChange}
            page={pageCount}
          >
            <ChevronsRightIcon />
          </PlacesPaginationAction>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
```

- [ ] **Step 5: Run focused pagination checks**

Run:

```bash
pnpm exec vitest run src/features/places-pagination/lib/build-places-pagination-items.test.ts src/features/places-pagination/lib/build-places-pagination-href.test.ts src/features/places-pagination/ui/places-pagination.test.ts
pnpm exec eslint src/features/places-pagination/lib/build-places-pagination-items.ts src/features/places-pagination/ui/places-pagination-action.tsx src/features/places-pagination/ui/places-pagination.tsx src/features/places-pagination/ui/places-pagination.test.ts --max-warnings=0
pnpm exec prettier --check src/features/places-pagination/lib/build-places-pagination-items.ts src/features/places-pagination/ui/places-pagination-action.tsx src/features/places-pagination/ui/places-pagination.tsx src/features/places-pagination/ui/places-pagination.test.ts
rg -n "@mui|Mui" src/features/places-pagination
```

Expected: all focused tests pass; lint and formatting exit 0; the final `rg` prints no matches and exits 1.

- [ ] **Step 6: Commit the pagination UI migration**

```bash
git add src/features/places-pagination/ui/places-pagination-action.tsx src/features/places-pagination/ui/places-pagination.tsx src/features/places-pagination/ui/places-pagination.test.ts
git diff --cached --check
git commit -m "refactor(pagination): migrate catalog navigation to shadcn"
```

Expected: the commit contains exactly the private action adapter, public UI entry, and component test.

---

### Task 5: Migrate the Server-Rendered Catalog Layout

**Files:**

- Create: `src/widgets/places-catalog/ui/places-catalog.test.ts`
- Modify: `src/widgets/places-catalog/ui/places-catalog.tsx:1-77`

**Interfaces:**

- Consumes: unchanged `PlacesCatalogModel`, `PlaceCard`, `CatalogControls`, `PlacesPagination`, `getPlacesCatalogEmptyState()`, and `PlacesCatalogEmpty`.
- Produces: unchanged server-renderable `PlacesCatalog({ model })` with semantic header/grid/empty composition and no MUI import.

- [ ] **Step 1: Write the failing widget-level static-render tests**

Create `src/widgets/places-catalog/ui/places-catalog.test.ts` with this complete content:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import type { PlacesCatalogModel } from '../model/types';
import { PlacesCatalog } from './places-catalog';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const MODEL: PlacesCatalogModel = {
  results: {
    total: 1,
    items: [
      {
        id: 'place_ekb_001',
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
      },
    ],
  },
  controls: {
    categories: [
      {
        id: 'category_spa',
        slug: 'spa',
        title: 'SPA',
        badgeBackgroundColor: '#faf0ed',
      },
    ],
  },
  pagination: {
    page: 1,
    pageCount: 3,
  },
  links: {
    resetFilters: '/',
    firstPage: '/',
  },
  navigation: {
    currentSearchParams: '',
  },
};

describe('PlacesCatalog', () => {
  it('server-renders the populated catalog with semantic responsive grid and no MUI', () => {
    const html = renderToStaticMarkup(createElement(PlacesCatalog, { model: MODEL }));

    expect(html).toContain('<main');
    expect(html).toContain('<h1');
    expect(html).toContain('>Места</h1>');
    expect(html).toContain('Найдено: 1');
    expect(html).toContain('Страница 1 из 3');
    expect(html).toContain('aria-label="Список мест"');
    expect(html).toContain('min-[900px]:grid-cols-2');
    expect(html).toContain('min-[1200px]:grid-cols-3');
    expect(html).toContain('Баден-Баден Уктус');
    expect(html).toContain('aria-label="Пагинация мест"');
    expect(html).not.toContain('Mui');
  });

  it('renders the filtered empty state without a card grid', () => {
    const html = renderToStaticMarkup(
      createElement(PlacesCatalog, {
        model: {
          ...MODEL,
          results: { items: [], total: 0 },
          controls: { ...MODEL.controls, search: 'missing' },
          pagination: { page: 1, pageCount: 0 },
          links: { ...MODEL.links, resetFilters: '/?pageSize=40' },
          navigation: { currentSearchParams: 'search=missing' },
        },
      }),
    );

    expect(html).toContain('Ничего не найдено');
    expect(html).toContain('href="/?pageSize=40"');
    expect(html).not.toContain('aria-label="Список мест"');
  });

  it('renders the out-of-range page state with a first-page action', () => {
    const html = renderToStaticMarkup(
      createElement(PlacesCatalog, {
        model: {
          ...MODEL,
          results: { items: [], total: 1 },
          pagination: { page: 2, pageCount: 3 },
          links: { ...MODEL.links, firstPage: '/?search=spa' },
          navigation: { currentSearchParams: 'search=spa&page=2' },
        },
      }),
    );

    expect(html).toContain('На этой странице нет мест');
    expect(html).toContain('href="/?search=spa"');
    expect(html).toContain('Перейти на первую страницу');
  });
});
```

- [ ] **Step 2: Run the widget test to verify the red phase**

Run:

```bash
pnpm exec vitest run src/widgets/places-catalog/ui/places-catalog.test.ts
```

Expected: FAIL because the current widget renders MUI classes and does not expose the Tailwind grid breakpoint contract.

- [ ] **Step 3: Replace the MUI widget composition with semantic HTML and Tailwind**

Replace `src/widgets/places-catalog/ui/places-catalog.tsx` with this complete content:

```tsx
import { PlaceCard } from '@/entities/place';
import { CatalogControls } from '@/features/catalog-controls';
import { PlacesPagination } from '@/features/places-pagination';
import { getPlacesCatalogEmptyState } from '../model/get-places-catalog-empty-state';
import type { PlacesCatalogModel } from '../model/types';
import { PlacesCatalogEmpty } from './places-catalog-empty';

interface PlacesCatalogProps {
  model: PlacesCatalogModel;
}

/**
 * Собирает рабочий каталог мест: заголовок, сетку карточек и пагинацию.
 *
 * @param props - Модель каталога мест.
 */
export function PlacesCatalog({ model }: Readonly<PlacesCatalogProps>) {
  const { results, controls, pagination, links, navigation } = model;
  const hasActiveFilters = Boolean(controls.search || controls.activeCategorySlug);
  const emptyState = getPlacesCatalogEmptyState({
    hasActiveFilters,
    total: results.total,
    resetHref: links.resetFilters,
    firstPageHref: links.firstPage,
  });

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 pt-[30px] pb-16 min-[600px]:px-6 min-[600px]:pt-12">
      <header className="mb-7 flex flex-col items-start justify-between gap-[18px] min-[600px]:flex-row min-[600px]:items-end">
        <div className="flex flex-col gap-2.5">
          <h1 className="text-[clamp(2rem,1.4rem+2vw,3.4rem)] leading-[1.04] font-bold tracking-normal text-foreground">
            Места
          </h1>
          <p className="leading-[1.55] text-muted-foreground">Найдено: {results.total}</p>
        </div>

        <p className="leading-[1.55] whitespace-nowrap text-muted-foreground min-[600px]:mb-1.5">
          Страница {pagination.page} из {pagination.pageCount}
        </p>
      </header>

      <CatalogControls model={controls} currentSearchParams={navigation.currentSearchParams} />

      {results.items.length > 0 ? (
        <section
          aria-label="Список мест"
          className="grid grid-cols-1 gap-4 min-[600px]:gap-5 min-[900px]:grid-cols-2 min-[1200px]:grid-cols-3"
        >
          {results.items.map((place) => (
            <PlaceCard key={place.id} place={place} />
          ))}
        </section>
      ) : (
        <PlacesCatalogEmpty {...emptyState} />
      )}

      <PlacesPagination
        pagination={pagination}
        currentSearchParams={navigation.currentSearchParams}
      />
    </main>
  );
}
```

- [ ] **Step 4: Run focused catalog tests and enforce the MUI-free boundary**

Run:

```bash
pnpm exec vitest run src/widgets/places-catalog/ui/places-catalog.test.ts src/widgets/places-catalog/ui/places-catalog-empty.test.ts src/widgets/places-catalog/model/get-places-catalog-empty-state.test.ts
pnpm exec eslint src/widgets/places-catalog/ui/places-catalog.tsx src/widgets/places-catalog/ui/places-catalog.test.ts --max-warnings=0
pnpm exec prettier --check src/widgets/places-catalog/ui/places-catalog.tsx src/widgets/places-catalog/ui/places-catalog.test.ts
rg -n "@mui|Mui" src/widgets/places-catalog src/features/catalog-controls src/features/places-pagination
```

Expected: all focused tests pass; lint and formatting exit 0; the final `rg` prints no matches and exits 1.

- [ ] **Step 5: Commit the catalog widget migration**

```bash
git add src/widgets/places-catalog/ui/places-catalog.tsx src/widgets/places-catalog/ui/places-catalog.test.ts
git diff --cached --check
git commit -m "refactor(places-catalog): migrate layout to Tailwind"
```

Expected: the commit contains exactly the widget entry and widget-level test.

---

### Task 6: Verify Visual Parity, Sync the Migration Plan, and Run Full Gates

**Files:**

- Modify: `docs/architecture/mui-to-shadcn-migration-plan.md:79-118`
- Verify: all files created or modified in Tasks 1-5

**Interfaces:**

- Consumes: the complete migrated catalog slice and the authoritative migration plan.
- Produces: verified desktop/mobile parity, documented Phase 3/Phase 4 progress, and a clean branch ready for review without publishing it automatically.

- [ ] **Step 1: Update Phase 3 to record controls and pagination as completed**

Replace the opening of Phase 3 through its remaining-work list with:

```md
### Phase 3: Forms and Controls

Status: in progress.

Completed slice:

- `CatalogControls` now uses the project-owned shadcn `TextField`, `Button`, and `Badge` contracts while preserving submit-only search, category colors, canonical URL transitions, and leaf client ownership.
- `PlacesPagination` now uses the shared shadcn pagination composition with a tested compact range, responsive mobile controls, explicit accessible labels, and the existing canonical href transition.

Remaining work:

1. Login form.
2. Auth lab/debug surfaces if they are still useful.
```

Keep the existing Special rule and Exit criteria directly after this block.

- [ ] **Step 2: Update Phase 4 to record the high-visibility catalog as completed**

Replace the Phase 4 introduction and completed-slice heading with:

```md
### Phase 4: High-visibility Pages

Status: completed.

Completed slices:

- The complete public places catalog now uses semantic HTML, Tailwind layout, shared shadcn controls, and the migrated place-card entity slice. Its server/client boundaries, canonical URL behavior, empty states, 600px/900px/1200px responsive layout, and desktop/mobile visual language remain intact.
- Place detail is migrated as the explicitly approved **Archive Spine × Focus Mode** redesign. This is a documented exception to visual parity, not a precedent for silently redesigning other migration slices.
```

Keep the remaining existing place-detail completion bullets, but change the provider note to:

```md
- MUI/Emotion providers and packages remain in the root bridge because auth and debug surfaces still depend on them.
```

Keep the existing Phase 4 Exit criteria unchanged.

- [ ] **Step 3: Run the complete targeted regression set**

Run:

```bash
pnpm exec vitest run src/shared/ui/text-field.test.ts src/features/catalog-controls/lib/build-catalog-controls-href.test.ts src/features/catalog-controls/lib/build-catalog-controls-input-key.test.ts src/features/catalog-controls/ui/catalog-controls.test.ts src/features/places-pagination/lib/build-places-pagination-items.test.ts src/features/places-pagination/lib/build-places-pagination-href.test.ts src/features/places-pagination/ui/places-pagination.test.ts src/widgets/places-catalog/model/get-places-catalog-empty-state.test.ts src/widgets/places-catalog/ui/places-catalog-empty.test.ts src/widgets/places-catalog/ui/places-catalog.test.ts
```

Expected: all ten targeted test files pass.

- [ ] **Step 4: Run repository-wide static and production gates**

Run each command separately and stop on the first failure:

```bash
pnpm run format:check
pnpm run lint:strict
pnpm run test:unit
pnpm run typecheck
pnpm run build
git diff --check
```

Expected: every command exits 0. `typecheck` may clean `.next/dev`; restart only this frontend's development server before browser verification if the previous process becomes stale.

- [ ] **Step 5: Verify the remaining MUI boundary**

Run:

```bash
rg -l "@mui/|from ['\"]@mui" src --glob '!src/shared/api/generated/**' | sort
```

Expected output contains only these legacy bridge/auth files:

```text
src/app/auth-lab/_components/auth-lab-client-panel.tsx
src/app/auth-lab/_components/auth-lab-page-content.tsx
src/app/auth-lab/admin/page.tsx
src/app/auth-lab/protected/page.tsx
src/app/layout.tsx
src/app/login/_components/login-page-content.tsx
src/app/providers.tsx
src/features/auth-login/ui/login-form.tsx
src/shared/ui/theme/app-theme.ts
```

No file under `src/widgets/places-catalog`, `src/features/catalog-controls`, or `src/features/places-pagination` may appear.

- [ ] **Step 6: Run desktop and mobile browser parity checks**

Restart the frontend if `typecheck` invalidated its dev cache:

```bash
pnpm run dev
```

Using the Playwright browser workflow, verify all of the following against the Task 3 baseline:

- `/` at `1440x1000`, `900x900`, and `390x844`;
- the previously recorded search/category query at `1440x1000` and `390x844`;
- a temporary test-only route reproducing `page=10`, `pageCount=20` with two ellipses, using the exact fixture below;
- filtered empty and out-of-range empty states;
- search label, placeholder, submit, active/inactive category buttons, first/previous/page/next/last pagination actions, hover, focus-visible, active, and disabled states;
- grid transitions at 899/900px and 1199/1200px;
- no horizontal overflow at 390px;
- `/login` at `1440x1000` and `390x844` as the representative legacy MUI smoke route;
- a clean browser console on `/` and `/login`.

Save after-state screenshots under `/tmp/catalog-after-*.png`; do not add them to Git. If a parity defect is reproduced, add the narrowest regression assertion to the owning test, observe the failing test, fix the owning component, rerun its focused tests, and commit that fix with the owning scope before continuing this task.

For the deterministic two-ellipsis state, temporarily create `src/app/pagination-visual-fixture/page.tsx` through `apply_patch` with:

```tsx
import { PlacesPagination } from '@/features/places-pagination';

export default function PaginationVisualFixturePage() {
  return (
    <main className="mx-auto max-w-3xl p-8">
      <PlacesPagination
        pagination={{ page: 10, pageCount: 20 }}
        currentSearchParams="search=spa&page=10"
      />
    </main>
  );
}
```

Verify `/pagination-visual-fixture` at `600x400` and `390x400`, then delete that exact file through `apply_patch`. Run:

```bash
git status --short
```

Expected: `src/app/pagination-visual-fixture/page.tsx` is absent from status before the documentation commit.

- [ ] **Step 7: Commit the migration-plan synchronization**

```bash
git add docs/architecture/mui-to-shadcn-migration-plan.md
git diff --cached --check
git commit -m "docs(ui): complete places catalog migration slice"
```

Expected: the commit contains only the migration-plan update.

- [ ] **Step 8: Perform the final branch audit**

Run:

```bash
git status --short --branch
git log --oneline --decorate origin/stage..HEAD
git diff --stat origin/stage...HEAD
git diff --check origin/stage...HEAD
```

Expected:

- the working tree is clean;
- the branch is `refactor/places-catalog-shadcn` and is ahead of `origin/stage` by the design/plan docs plus the logical implementation commits;
- the diff contains only the approved catalog migration, its tests, shared UI seeds, and migration documentation;
- no push, PR creation, merge, issue closure, or branch cleanup occurs without a separate user request.
