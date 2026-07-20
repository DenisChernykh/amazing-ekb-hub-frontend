# Public Catalog Navigation and Cache Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the query-driven home catalog with category-first public navigation, a server-rendered/infinite category feed, cached public reads, build-time slug generation, and signed backend-triggered cache invalidation.

**Architecture:** App Router pages remain thin route orchestrators. Category and place entities own API adapters and serializable card models, widgets own the category grid, five-card place modules, and sticky header, while `features/infinite-places` owns append state and observation. Cache Components wrap successful public data reads with shared cache-life/tag builders; the webhook Route Handler verifies the exact raw body before mapping domain scopes to those tags.

**Tech Stack:** Next.js 16.2.6 App Router and Cache Components, React 19.2.3, TypeScript 5, Tailwind CSS 4.3.2, Zod 4.3.6, Lucide React, Vitest 4.1.6, Node `crypto`.

## Global Constraints

- Public navigation is `/` → `/categories` → `/categories/[categorySlug]` → `/places/[placeSlug]`.
- `/` renders at most eight category cards; `/categories` renders the complete category list.
- Category and place cards contain only an image area and title.
- Category cards have one outer border, no internal divider, no radius, no shadow, and no metadata.
- Place cards have no category badge, counters, summary, tags, descriptions, or platform actions.
- Use `Onest` weights `400`, `500`, and `600`; keep the place-detail-only Literata/Manrope scope unchanged.
- The public catalog surface is white, primary is black, primary foreground is white, and card-title hover is the named `#c6b09f` token.
- New and touched catalog JSX must contain no Tailwind arbitrary bracket utilities.
- Header heights are exactly `78px` expanded and `58px` compressed; transition duration is exactly `360ms`.
- The primary action wipe duration is exactly `400ms`; text and Lucide `ArrowRight` change together.
- Category pages request fixed `pageSize: 20`; build-time place enumeration requests fixed `pageSize: 100`.
- The first category page is rendered on the server; only page `2+` is requested by the browser.
- Place order stays API order; each independent five-item module renders one tall card followed by four regular cards without dense grid flow.
- Cache life is exactly `{ stale: 60, revalidate: 300, expire: 3600 }`.
- Cache tags are exactly `categories`, `category:{slug}`, `category-places:{slug}`, and `place:{slug}`.
- Cache invalidation accepts schema version `1`, a five-minute signature window, and calls `revalidateTag(tag, { expire: 0 })`.
- HMAC input is exactly `<timestamp>.<exact raw UTF-8 request body>` and the digest header is `sha256=<lowercase hex>`.
- No MUI, Emotion, PPR flag, auth, favorites, session storage, global feed store, category-image API, outbox, or new dependency is introduced.
- Follow TDD for pure contracts and route behavior; commit each independently reviewable task.

---

## File Map

### Visual foundation and navigation

- Modify `src/app/globals.css`: Onest/theme tokens, black/white public palette, header/button/card/module/loader component classes, reduced-motion rules.
- Modify `src/app/layout.tsx`: load Onest and mount the shared header.
- Create `src/widgets/site-header/model/is-site-header-compact.ts`: pure scroll threshold.
- Create `src/widgets/site-header/model/is-site-header-compact.test.ts`: threshold contract.
- Create `src/widgets/site-header/ui/site-header.tsx`: sticky client header with requestAnimationFrame-throttled scroll state.
- Create `src/widgets/site-header/ui/site-header.test.ts`: semantic expanded-state SSR contract.
- Create `src/widgets/site-header/index.ts`: widget public API.

### Category entity and grid

- Create `public/images/categories/category-placeholder.svg`: neutral deterministic image fallback.
- Create `src/entities/category/model/types.ts`: serializable category-card model.
- Create `src/entities/category/model/map-category-to-card-model.ts`: API-to-UI mapper and placeholder ownership.
- Create `src/entities/category/model/map-category-to-card-model.test.ts`: mapping contract.
- Create `src/entities/category/model/normalize-category-slug.ts`: public slug validation.
- Create `src/entities/category/model/normalize-category-slug.test.ts`: valid/invalid slug cases.
- Create `src/entities/category/lib/build-category-href.ts`: `/categories/{slug}` helper.
- Create `src/entities/category/lib/build-category-href.test.ts`: encoded href contract.
- Create `src/entities/category/api/fetch-public-categories.ts`: public category-list adapter.
- Create `src/entities/category/api/fetch-public-category.ts`: public category-detail adapter with nullable 404.
- Create `src/entities/category/ui/category-card-image.tsx`: contain-fit image/placeholder surface.
- Create `src/entities/category/ui/category-card.tsx`: full-card semantic link.
- Create `src/entities/category/ui/category-card.test.ts`: image/title-only and focus/hover contract.
- Create `src/entities/category/index.ts`: category public API.
- Create `src/widgets/category-grid/ui/category-grid.tsx`: two/four-column card composition.
- Create `src/widgets/category-grid/ui/category-grid.test.ts`: grid and link semantics.
- Create `src/widgets/category-grid/index.ts`: widget public API.

### Home and category index

- Replace `src/app/(home)/page.tsx`: category-first home route.
- Create `src/app/(home)/_lib/get-home-page-data.ts`: map and cap categories at eight.
- Create `src/app/(home)/_lib/get-home-page-data.test.ts`: cap/order contract.
- Create `src/app/(home)/_components/home-category-section.tsx`: home heading, grid, and CTA.
- Create `src/app/(home)/_components/home-category-section.test.ts`: CTA and eight-card render contract.
- Create `src/app/(home)/_components/show-all-categories-link.tsx`: approved two-layer wipe link.
- Create `src/app/categories/page.tsx`: complete category index.
- Create `src/app/categories/_lib/get-categories-page-data.ts`: map all categories.
- Create `src/app/categories/_lib/get-categories-page-data.test.ts`: complete-list contract.
- Delete the legacy home query-state files, catalog widget, catalog controls, pagination feature, and home skeleton listed in Task 3.

### Place cards and feed modules

- Modify `src/entities/place/model/types.ts`: reduce `PlaceCardModel` to card fields.
- Modify `src/entities/place/model/map-place-summary-to-card.ts`: remove card-only counters/category mapping.
- Modify `src/entities/place/model/map-place-summary-to-card.test.ts`: real/fallback cover and minimal model tests.
- Modify `src/entities/place/ui/place-card.tsx`: one full-card link with image/title only.
- Modify `src/entities/place/ui/place-card-image.tsx`: decorative cover/fallback with regular/tall variants.
- Modify `src/entities/place/ui/place-card.test.ts`: content, link, alt, fallback, and no-metadata contract.
- Modify `src/entities/place/index.ts`: export the new card variant/type and remove card-badge-only exports.
- Delete `src/entities/place/ui/place-card-badges.tsx` and its test.
- Delete `src/entities/place/lib/build-place-materials-href.ts` and its test when no consumer remains.
- Create `src/widgets/place-feed/lib/chunk-place-cards.ts`: stable groups of five.
- Create `src/widgets/place-feed/lib/chunk-place-cards.test.ts`: complete/incomplete group order.
- Create `src/widgets/place-feed/ui/place-feed.tsx`: module composition.
- Create `src/widgets/place-feed/ui/place-feed.test.ts`: one tall plus four regular, no dense flow.
- Create `src/widgets/place-feed/index.ts`: widget public API.

### Category route and infinite append

- Create `src/entities/place/model/category-places-page-schema.ts`: runtime-safe same-origin page contract.
- Create `src/entities/place/model/category-places-page-schema.test.ts`: strict page validation.
- Create `src/entities/place/api/fetch-public-category-place-page.ts`: backend page fetch and mapper.
- Create `src/entities/place/api/fetch-public-category-place-page.test.ts`: fixed params and mapped response.
- Create `src/app/categories/[categorySlug]/_lib/get-category-page-data.ts`: validate category and load page one.
- Create `src/app/categories/[categorySlug]/_lib/get-category-page-data.test.ts`: ready/not-found/empty/error propagation.
- Create `src/app/categories/[categorySlug]/_components/category-page-content.tsx`: breadcrumbs, title, empty/feed composition.
- Create `src/app/categories/[categorySlug]/page.tsx`: route orchestration.
- Create `src/app/categories/[categorySlug]/loading.tsx`: minimal non-skeleton fallback.
- Create `src/app/categories/[categorySlug]/error.tsx`: route retry boundary.
- Create `src/app/api/categories/[categorySlug]/places/_lib/normalize-page-param.ts`: bounded integer parser.
- Create `src/app/api/categories/[categorySlug]/places/_lib/normalize-page-param.test.ts`: page boundaries.
- Create `src/app/api/categories/[categorySlug]/places/route.ts`: same-origin page `2+` transport.
- Create `src/app/api/categories/[categorySlug]/places/route.test.ts`: `200`, `400`, and `404` contract.
- Create `src/features/infinite-places/model/infinite-places-state.ts`: pure append state machine.
- Create `src/features/infinite-places/model/infinite-places-state.test.ts`: dedupe/order/error/retry/end transitions.
- Create `src/features/infinite-places/api/fetch-next-category-places-page.ts`: client same-origin fetch and Zod parsing.
- Create `src/features/infinite-places/ui/infinite-places.tsx`: IntersectionObserver lifecycle and retained feed.
- Create `src/features/infinite-places/ui/infinite-places.test.ts`: server-rendered initial items and accessible idle/end markup.
- Create `src/features/infinite-places/index.ts`: feature public API.

### Cache Components and static parameters

- Modify `next.config.ts`: enable `cacheComponents: true`.
- Create `src/next-config-cache-components.test.ts`: configuration regression test.
- Create `src/shared/lib/cache/public-catalog-cache.ts`: cache life and tag builders.
- Create `src/shared/lib/cache/public-catalog-cache.test.ts`: exact tag strings/life.
- Create `src/shared/lib/cache/index.ts`: cache helper public API.
- Modify category and place API adapters to use `'use cache'`, `cacheLife`, and `cacheTag`.
- Create `src/entities/place/api/fetch-all-public-place-slugs.ts`: page-size-100 build enumeration.
- Create `src/entities/place/api/fetch-all-public-place-slugs.test.ts`: multi-page and failure behavior.
- Create `src/app/categories/[categorySlug]/_lib/get-category-static-params.ts`: all known category slugs.
- Create `src/app/places/[placeSlug]/_lib/get-place-static-params.ts`: all known active place slugs.
- Modify both dynamic route `page.tsx` files to export `generateStaticParams`.
- Modify `src/app/places/[placeSlug]/_lib/get-place-page-data.test.ts`: shared place-tag behavior remains covered through adapter tests.

### Signed invalidation endpoint

- Modify `.env.example`: document `CACHE_REVALIDATION_SECRET`.
- Create `src/app/api/cache/revalidate/_lib/cache-revalidation-schema.ts`: strict schema v1.
- Create `src/app/api/cache/revalidate/_lib/cache-revalidation-schema.test.ts`: version/slug/target/unknown-field cases.
- Create `src/app/api/cache/revalidate/_lib/verify-cache-revalidation-signature.ts`: replay-window and constant-time HMAC verification.
- Create `src/app/api/cache/revalidate/_lib/verify-cache-revalidation-signature.test.ts`: valid/malformed/replayed signatures.
- Create `src/app/api/cache/revalidate/_lib/map-revalidation-scopes-to-tags.ts`: domain-to-tag mapping with dedupe.
- Create `src/app/api/cache/revalidate/_lib/map-revalidation-scopes-to-tags.test.ts`: exact ordered tag set.
- Create `src/app/api/cache/revalidate/route.ts`: raw-body-first verification and immediate expiration.
- Create `src/app/api/cache/revalidate/route.test.ts`: `204`, `400`, `401`, `500`, exact-once tags.

### Verification

- Create `src/app/public-catalog-source-contract.test.ts`: deleted legacy surfaces and no new arbitrary Tailwind utilities.
- Save temporary browser evidence under `/tmp/amazing-ekb-public-catalog/`; do not add screenshots or browser profiles to Git.

---

### Task 1: Establish the visual foundation and sticky site header

**Files:**

- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Create: `src/widgets/site-header/model/is-site-header-compact.test.ts`
- Create: `src/widgets/site-header/model/is-site-header-compact.ts`
- Create: `src/widgets/site-header/ui/site-header.test.ts`
- Create: `src/widgets/site-header/ui/site-header.tsx`
- Create: `src/widgets/site-header/index.ts`

**Interfaces:**

- Consumes: `cn(...inputs)` from `@/shared/lib/utils`, `Link` from `next/link`.
- Produces: `SiteHeader(): ReactElement` through `@/widgets/site-header`.
- Produces: `isSiteHeaderCompact(scrollY: number): boolean`; compact when `scrollY > 16`.
- Produces named utilities/tokens: `text-card-title-hover`, `duration-site-header`, `duration-primary-action`, `ease-catalog`.

- [ ] **Step 1: Write the failing header behavior tests**

Create `src/widgets/site-header/model/is-site-header-compact.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { isSiteHeaderCompact } from './is-site-header-compact';

describe('isSiteHeaderCompact', () => {
  it.each([
    [0, false],
    [16, false],
    [17, true],
    [400, true],
  ])('maps scrollY %s to %s', (scrollY, expected) => {
    expect(isSiteHeaderCompact(scrollY)).toBe(expected);
  });
});
```

Create `src/widgets/site-header/ui/site-header.test.ts`:

```ts
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SiteHeader } from './site-header';

describe('SiteHeader', () => {
  it('server-renders expanded semantic navigation', () => {
    const html = renderToStaticMarkup(createElement(SiteHeader));

    expect(html).toContain('aria-label="Основная навигация"');
    expect(html).toContain('href="/"');
    expect(html).toContain('Стрельчук в Екатеринбурге');
    expect(html).toContain('href="/categories"');
    expect(html).toContain('>Категории<');
    expect(html).toContain('site-header-expanded');
    expect(html).not.toMatch(/hamburger|backdrop-blur|shadow/);
  });
});
```

- [ ] **Step 2: Run the focused tests and verify missing modules**

Run:

```bash
pnpm exec vitest run src/widgets/site-header
```

Expected: FAIL because the header modules do not exist.

- [ ] **Step 3: Add the pure threshold and client header**

Create `src/widgets/site-header/model/is-site-header-compact.ts`:

```ts
const SITE_HEADER_COMPACT_SCROLL_Y = 16;

export function isSiteHeaderCompact(scrollY: number): boolean {
  return scrollY > SITE_HEADER_COMPACT_SCROLL_Y;
}
```

Create `src/widgets/site-header/ui/site-header.tsx`:

```tsx
'use client';

import { cn } from '@/shared/lib/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { isSiteHeaderCompact } from '../model/is-site-header-compact';

export function SiteHeader() {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let frame: number | null = null;

    const sync = () => {
      frame = null;
      setCompact(isSiteHeaderCompact(window.scrollY));
    };

    const handleScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(sync);
    };

    sync();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b bg-white transition duration-site-header ease-catalog motion-reduce:transition-none',
        compact ? 'site-header-compact border-border' : 'site-header-expanded border-transparent',
      )}
    >
      <nav
        aria-label="Основная навигация"
        className="container mx-auto flex h-full items-center justify-between px-4 sm:px-6 lg:px-8"
      >
        <Link
          href="/"
          className={cn(
            'font-medium text-black transition duration-site-header ease-catalog focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black motion-reduce:transition-none',
            compact ? 'scale-95 text-sm' : 'scale-100 text-base',
          )}
        >
          Стрельчук в Екатеринбурге
        </Link>
        <Link
          href="/categories"
          className="text-sm font-medium text-black transition-colors hover:text-card-title-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
        >
          Категории
        </Link>
      </nav>
    </header>
  );
}
```

Create `src/widgets/site-header/index.ts`:

```ts
export { SiteHeader } from './ui/site-header';
```

- [ ] **Step 4: Replace the root font/palette and add named component CSS**

In `src/app/layout.tsx`, replace Roboto with:

```tsx
import type { Metadata } from 'next';
import { Onest } from 'next/font/google';
import { SiteHeader } from '@/widgets/site-header';
import './globals.css';

const onest = Onest({
  weight: ['400', '500', '600'],
  subsets: ['cyrillic', 'latin'],
  display: 'swap',
  variable: '--font-onest',
});

export const metadata: Metadata = {
  title: 'Стрельчук в Екатеринбурге',
  description: 'Удобный навигатор по моим обзорам',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={onest.variable}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
```

In `src/app/globals.css`, keep the existing cascade order and set these `@theme inline` entries:

```css
--font-heading: var(--font-onest);
--font-sans: var(--font-onest);
--color-card-title-hover: #c6b09f;
--duration-site-header: 360ms;
--duration-primary-action: 400ms;
--ease-catalog: cubic-bezier(0.22, 1, 0.36, 1);
```

Replace the light `:root` palette with:

```css
:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --card: #ffffff;
  --card-foreground: #0a0a0a;
  --popover: #ffffff;
  --popover-foreground: #0a0a0a;
  --primary: #000000;
  --primary-foreground: #ffffff;
  --secondary: #f5f5f5;
  --secondary-foreground: #0a0a0a;
  --muted: #f3f4f6;
  --muted-foreground: #666666;
  --accent: #f5f5f5;
  --accent-foreground: #0a0a0a;
  --destructive: #b42318;
  --border: #d9d9d9;
  --input: #d9d9d9;
  --ring: #000000;
  --chart-1: #000000;
  --chart-2: #666666;
  --chart-3: #9ca3af;
  --chart-4: #d9d9d9;
  --chart-5: #f3f4f6;
  --radius: 0.5rem;
  --sidebar: #ffffff;
  --sidebar-foreground: #0a0a0a;
  --sidebar-primary: #000000;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-accent: #f5f5f5;
  --sidebar-accent-foreground: #0a0a0a;
  --sidebar-border: #d9d9d9;
  --sidebar-ring: #000000;
}
```

Add to `@layer components`:

```css
@layer components {
  .site-header-expanded {
    height: 78px;
  }

  .site-header-compact {
    height: 58px;
  }
}
```

- [ ] **Step 5: Run focused and baseline checks**

Run:

```bash
pnpm exec vitest run src/widgets/site-header src/app/mui-bridge-removal.test.ts
pnpm run typecheck
```

Expected: all focused tests PASS and typecheck exits `0`.

- [ ] **Step 6: Commit the visual foundation**

```bash
git add src/app/globals.css src/app/layout.tsx src/widgets/site-header
git commit -m "feat(layout): add sticky public header"
```

### Task 2: Add the category entity, placeholder adapter, card, and grid

**Files:**

- Create all category entity and category-grid files listed in the File Map.

**Interfaces:**

- Consumes: generated `PlaceCategory`.
- Produces: `CategoryCardModel = { id; slug; title; image }`.
- Produces: `fetchPublicCategories(): Promise<PlaceCategory[]>`.
- Produces: `fetchPublicCategory(slug: string): Promise<PlaceCategory | null>`.
- Produces: `CategoryGrid({ categories, ariaLabel }): ReactElement`.

- [ ] **Step 1: Write mapper, slug, href, card, and grid tests**

Use this category fixture in each focused test:

```ts
const CATEGORY = {
  id: 'category_spa',
  slug: 'family-spa',
  title: 'Семейные SPA',
};
```

The mapper expectation in `map-category-to-card-model.test.ts` is:

```ts
expect(mapCategoryToCardModel(CATEGORY)).toEqual({
  id: 'category_spa',
  slug: 'family-spa',
  title: 'Семейные SPA',
  image: {
    kind: 'placeholder',
    src: '/images/categories/category-placeholder.svg',
    alt: '',
  },
});
```

The card test must assert one `/categories/family-spa` link, one title, an empty image alt, `object-contain`, an outer border, and absence of description/count/badge/arrow/internal divider.

The grid test must assert `grid-cols-2`, `lg:grid-cols-4`, API order, and one link per item.

- [ ] **Step 2: Run tests and verify missing contracts**

Run:

```bash
pnpm exec vitest run src/entities/category src/widgets/category-grid
```

Expected: FAIL because the category slice and widget do not exist.

- [ ] **Step 3: Implement the serializable model and pure helpers**

Create `src/entities/category/model/types.ts`:

```ts
export type CategoryCardImageModel = {
  kind: 'placeholder' | 'photo';
  src: string;
  alt: string;
};

export type CategoryCardModel = {
  id: string;
  slug: string;
  title: string;
  image: CategoryCardImageModel;
};
```

Create `src/entities/category/model/map-category-to-card-model.ts`:

```ts
import type { PlaceCategory } from '@/shared/api/generated/model/placeCategory';
import type { CategoryCardModel } from './types';

const CATEGORY_PLACEHOLDER_SRC = '/images/categories/category-placeholder.svg';

export function mapCategoryToCardModel(category: PlaceCategory): CategoryCardModel {
  return {
    id: category.id,
    slug: category.slug,
    title: category.title,
    image: {
      kind: 'placeholder',
      src: CATEGORY_PLACEHOLDER_SRC,
      alt: '',
    },
  };
}
```

Create `src/entities/category/model/normalize-category-slug.ts`:

```ts
const CATEGORY_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function normalizeCategorySlug(categorySlug: string): string | null {
  return CATEGORY_SLUG_PATTERN.test(categorySlug) ? categorySlug : null;
}
```

Create `src/entities/category/lib/build-category-href.ts`:

```ts
export function buildCategoryHref(categorySlug: string): string {
  return `/categories/${encodeURIComponent(categorySlug)}`;
}
```

- [ ] **Step 4: Implement public category API adapters**

Create `src/entities/category/api/fetch-public-categories.ts`:

```ts
import type { PlaceCategory } from '@/shared/api/generated/model/placeCategory';
import { listPlaceCategories } from '@/shared/api/generated/places/places';

export async function fetchPublicCategories(): Promise<PlaceCategory[]> {
  const response = await listPlaceCategories();
  return response.data.items;
}
```

Create `src/entities/category/api/fetch-public-category.ts`:

```ts
import type { PlaceCategory } from '@/shared/api/generated/model/placeCategory';
import { getPlaceCategory } from '@/shared/api/generated/places/places';
import { isGeneratedApiError } from '@/shared/lib/api/is-generated-api-error';

export async function fetchPublicCategory(categorySlug: string): Promise<PlaceCategory | null> {
  try {
    const response = await getPlaceCategory({ categorySlug });
    return response.data;
  } catch (error) {
    if (isGeneratedApiError(error) && error.status === 404) return null;
    throw error;
  }
}
```

- [ ] **Step 5: Implement the SVG fallback, card, and grid**

Create `public/images/categories/category-placeholder.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="presentation">
  <rect width="800" height="600" fill="#f3f4f6"/>
</svg>
```

Create `src/entities/category/ui/category-card-image.tsx`:

```tsx
import Image from 'next/image';
import type { CategoryCardModel } from '../model/types';

export function CategoryCardImage({ image }: Readonly<Pick<CategoryCardModel, 'image'>>) {
  return (
    <div className="category-card-media relative overflow-hidden bg-muted">
      <Image
        fill
        unoptimized
        src={image.src}
        alt={image.alt}
        sizes="(min-width: 1024px) 25vw, 50vw"
        className="object-contain"
      />
    </div>
  );
}
```

Create `src/entities/category/ui/category-card.tsx`:

```tsx
import Link from 'next/link';
import { buildCategoryHref } from '../lib/build-category-href';
import type { CategoryCardModel } from '../model/types';
import { CategoryCardImage } from './category-card-image';

export function CategoryCard({ category }: Readonly<{ category: CategoryCardModel }>) {
  return (
    <article className="h-full border border-border bg-white">
      <Link
        href={buildCategoryHref(category.slug)}
        className="group flex h-full flex-col text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
      >
        <CategoryCardImage image={category.image} />
        <h2 className="px-4 py-5 text-base font-medium transition-colors group-hover:text-card-title-hover group-focus-visible:text-card-title-hover sm:px-5 sm:text-lg">
          {category.title}
        </h2>
      </Link>
    </article>
  );
}
```

Create `src/widgets/category-grid/ui/category-grid.tsx`:

```tsx
import { CategoryCard, type CategoryCardModel } from '@/entities/category';

export function CategoryGrid({
  categories,
  ariaLabel,
}: Readonly<{ categories: CategoryCardModel[]; ariaLabel: string }>) {
  return (
    <section aria-label={ariaLabel}>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-5">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
```

Add to `src/app/globals.css` inside `@layer components`:

```css
.category-card-media {
  aspect-ratio: 4 / 3;
}
```

Export the exact public contracts from the two `index.ts` files.

Create `src/entities/category/index.ts`:

```ts
export { fetchPublicCategories } from './api/fetch-public-categories';
export { fetchPublicCategory } from './api/fetch-public-category';
export { buildCategoryHref } from './lib/build-category-href';
export { mapCategoryToCardModel } from './model/map-category-to-card-model';
export { normalizeCategorySlug } from './model/normalize-category-slug';
export type { CategoryCardImageModel, CategoryCardModel } from './model/types';
export { CategoryCard } from './ui/category-card';
```

Create `src/widgets/category-grid/index.ts`:

```ts
export { CategoryGrid } from './ui/category-grid';
```

- [ ] **Step 6: Run focused tests and typecheck**

Run:

```bash
pnpm exec vitest run src/entities/category src/widgets/category-grid
pnpm run typecheck
```

Expected: all new tests PASS; typecheck exits `0`.

- [ ] **Step 7: Commit the category primitives**

```bash
git add public/images/categories src/entities/category src/widgets/category-grid src/app/globals.css
git commit -m "feat(categories): add category cards and grid"
```

### Task 3: Replace the home catalog and add `/categories`

**Files:**

- Create/modify the home and category-index files listed in the File Map.
- Delete:
  - `src/app/_components/home-page-content.tsx`
  - every file under `src/app/_lib`
  - `src/app/(home)/loading.tsx`
  - `src/app/(home)/loading.test.ts`
  - `src/entities/place/api/fetch-public-place-categories.ts`
  - `src/entities/place/api/fetch-public-place-list.ts`
  - every file under `src/features/catalog-controls`
  - every file under `src/features/places-pagination`
  - every file under `src/widgets/places-catalog`

**Interfaces:**

- Produces: `getHomePageData(): Promise<CategoryCardModel[]>`, capped with `slice(0, 8)`.
- Produces: `getCategoriesPageData(): Promise<CategoryCardModel[]>`, without truncation.
- Produces: route-private `ShowAllCategoriesLink`.

- [ ] **Step 1: Write the two loaders and composition tests**

Mock `fetchPublicCategories()` with ten ordered categories.

In the home loader test assert:

```ts
expect(await getHomePageData()).toHaveLength(8);
expect((await getHomePageData()).map(({ slug }) => slug)).toEqual([
  'category-1',
  'category-2',
  'category-3',
  'category-4',
  'category-5',
  'category-6',
  'category-7',
  'category-8',
]);
```

In the categories loader test assert all ten slugs remain in backend order.

In `home-category-section.test.ts`, assert eight category links, one `href="/categories"`, uppercase `Показать все категории`, and one `ArrowRight` SVG.

- [ ] **Step 2: Run the route-focused tests and verify failure**

Run:

```bash
pnpm exec vitest run 'src/app/(home)' src/app/categories
```

Expected: FAIL because the new loaders/routes do not exist and the current home renders places/search/pagination.

- [ ] **Step 3: Implement the category-first loaders**

Create `src/app/(home)/_lib/get-home-page-data.ts`:

```ts
import { fetchPublicCategories, mapCategoryToCardModel } from '@/entities/category';

const HOME_CATEGORY_LIMIT = 8;

export async function getHomePageData() {
  const categories = await fetchPublicCategories();
  return categories.slice(0, HOME_CATEGORY_LIMIT).map(mapCategoryToCardModel);
}
```

Create `src/app/categories/_lib/get-categories-page-data.ts`:

```ts
import { fetchPublicCategories, mapCategoryToCardModel } from '@/entities/category';

export async function getCategoriesPageData() {
  const categories = await fetchPublicCategories();
  return categories.map(mapCategoryToCardModel);
}
```

- [ ] **Step 4: Implement the exact two-layer CTA**

Create `src/app/(home)/_components/show-all-categories-link.tsx`:

```tsx
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

function ActionContent() {
  return (
    <>
      <span>Показать все категории</span>
      <ArrowRight aria-hidden="true" className="size-5" />
    </>
  );
}

export function ShowAllCategoriesLink() {
  return (
    <Link href="/categories" className="catalog-primary-action">
      <span className="catalog-primary-action-content">
        <ActionContent />
      </span>
      <span
        aria-hidden="true"
        className="catalog-primary-action-content catalog-primary-action-inverse"
      >
        <ActionContent />
      </span>
    </Link>
  );
}
```

Add these component classes to `src/app/globals.css`:

```css
.catalog-primary-action {
  position: relative;
  display: inline-flex;
  min-height: 56px;
  min-width: 292px;
  overflow: hidden;
  background: var(--color-black);
  color: var(--color-white);
  text-transform: uppercase;
  letter-spacing: 0.12em;
  outline-offset: 4px;
}

.catalog-primary-action:focus-visible {
  outline: 2px solid var(--color-black);
}

.catalog-primary-action-content {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: --spacing(6);
  padding: --spacing(4) --spacing(6);
  font-size: var(--text-xs);
  font-weight: 600;
}

.catalog-primary-action-inverse {
  position: absolute;
  inset: 0;
  background: var(--color-white);
  color: var(--color-black);
  clip-path: inset(0 100% 0 0);
  transition: clip-path var(--duration-primary-action) var(--ease-catalog);
}

.catalog-primary-action:hover .catalog-primary-action-inverse,
.catalog-primary-action:focus-visible .catalog-primary-action-inverse {
  clip-path: inset(0);
}

@media (prefers-reduced-motion: reduce) {
  .catalog-primary-action-inverse {
    transition: none;
  }
}
```

- [ ] **Step 5: Implement both pages**

Create `src/app/(home)/_components/home-category-section.tsx`:

```tsx
import type { CategoryCardModel } from '@/entities/category';
import { Container } from '@/shared/ui';
import { CategoryGrid } from '@/widgets/category-grid';
import { ShowAllCategoriesLink } from './show-all-categories-link';

export function HomeCategorySection({ categories }: Readonly<{ categories: CategoryCardModel[] }>) {
  return (
    <Container as="main" className="py-10 sm:py-14 lg:py-16">
      <div className="mb-8 flex items-end justify-between gap-6">
        <h1 className="text-3xl font-medium text-black sm:text-4xl">Категории</h1>
      </div>
      <CategoryGrid categories={categories} ariaLabel="Категории мест" />
      <div className="mt-8 flex justify-center sm:mt-10">
        <ShowAllCategoriesLink />
      </div>
    </Container>
  );
}
```

Replace `src/app/(home)/page.tsx` with:

```tsx
import { HomeCategorySection } from './_components/home-category-section';
import { getHomePageData } from './_lib/get-home-page-data';

export default async function HomePage() {
  const categories = await getHomePageData();
  return <HomeCategorySection categories={categories} />;
}
```

Create `src/app/categories/page.tsx`:

```tsx
import { Container } from '@/shared/ui';
import { CategoryGrid } from '@/widgets/category-grid';
import { getCategoriesPageData } from './_lib/get-categories-page-data';

export default async function CategoriesPage() {
  const categories = await getCategoriesPageData();

  return (
    <Container as="main" className="py-10 sm:py-14 lg:py-16">
      <h1 className="mb-8 text-3xl font-medium text-black sm:text-4xl">Все категории</h1>
      <CategoryGrid categories={categories} ariaLabel="Все категории мест" />
    </Container>
  );
}
```

- [ ] **Step 6: Delete the legacy home/catalog slices**

Delete the exact paths listed at the start of Task 3. Run:

```bash
rg -n "PlacesCatalog|CatalogControls|PlacesPagination|normalizeHomeSearchParams" src
```

Expected: no matches.

- [ ] **Step 7: Run focused and full unit tests**

Run:

```bash
pnpm exec vitest run 'src/app/(home)' src/app/categories src/entities/category src/widgets/category-grid
pnpm run test:unit
pnpm run typecheck
```

Expected: all tests PASS and typecheck exits `0`.

- [ ] **Step 8: Commit the public entry flow**

```bash
git add src/app src/features src/widgets src/entities/category
git commit -m "feat(catalog): add category-first entry routes"
```

### Task 4: Simplify place cards and add stable five-card modules

**Files:**

- Modify/delete/create the place entity and `place-feed` files listed in the File Map.

**Interfaces:**

- Produces: `PlaceCardModel = { id; slug; title; coverImageUrl }`.
- Produces: `PlaceCardVariant = 'regular' | 'tall'`.
- Produces: `chunkPlaceCards(items, 5): PlaceCardModel[][]`.
- Produces: `PlaceFeed({ items }): ReactElement`.

- [ ] **Step 1: Replace mapper/card tests and add grouping tests**

The mapper test must expect:

```ts
expect(mapPlaceSummaryToCardModel(BASE_PLACE_SUMMARY)).toEqual({
  id: 'place_ekb_001',
  slug: 'baden-baden-uktus',
  title: 'Baden-Baden Uktus',
  coverImageUrl: '/v1/places/baden-baden-uktus/photo',
});
```

The card test must assert exactly one place link, decorative `alt=""`, image and title, and absence of category title, platform names, counters, summary, badge, radius, and shadow classes.

The chunk test must assert input ids `1..12` become `[[1..5], [6..10], [11,12]]` without mutation.

- [ ] **Step 2: Run focused tests and verify current rich card fails**

Run:

```bash
pnpm exec vitest run src/entities/place/model/map-place-summary-to-card.test.ts src/entities/place/ui/place-card.test.ts src/widgets/place-feed
```

Expected: FAIL because the current model/card still includes category badges and platform counters.

- [ ] **Step 3: Reduce the model and mapper**

In `src/entities/place/model/types.ts`, replace `PlaceCardModel` with:

```ts
export type PlaceCardModel = {
  id: string;
  slug: string;
  title: string;
  coverImageUrl: string | null;
};

export type PlaceCardVariant = 'regular' | 'tall';
```

Replace `mapPlaceSummaryToCardModel` with:

```ts
import type { PublicPlaceSummary } from '@/shared/api/generated/model/publicPlaceSummary';
import { normalizeCoverImageUrl } from './normalize-cover-image-url';
import type { PlaceCardModel } from './types';

export function mapPlaceSummaryToCardModel(place: PublicPlaceSummary): PlaceCardModel {
  return {
    id: place.id,
    slug: place.slug,
    title: place.title,
    coverImageUrl: normalizeCoverImageUrl(place.coverImageUrl),
  };
}
```

- [ ] **Step 4: Replace the place card UI**

`PlaceCardImage` accepts `{ src; variant }`, uses the existing `/images/places/place-placeholder.webp`, `alt=""`, `object-cover`, and conditional named classes `place-card-media-regular` / `place-card-media-tall`.

Replace `src/entities/place/ui/place-card-image.tsx` with:

```tsx
import { cn } from '@/shared/lib/utils';
import Image from 'next/image';
import type { PlaceCardVariant } from '../model/types';

const PLACE_PLACEHOLDER_IMAGE_SRC = '/images/places/place-placeholder.webp';

export function PlaceCardImage({
  src,
  variant,
}: Readonly<{ src: string | null; variant: PlaceCardVariant }>) {
  return (
    <div
      className={cn(
        'bg-muted',
        variant === 'tall' ? 'place-card-media-tall' : 'place-card-media-regular',
      )}
    >
      <Image
        fill
        unoptimized
        src={src ?? PLACE_PLACEHOLDER_IMAGE_SRC}
        alt=""
        loading="lazy"
        sizes="(min-width: 1024px) 33vw, 50vw"
        className="object-cover"
      />
    </div>
  );
}
```

`PlaceCard` becomes:

```tsx
import { cn } from '@/shared/lib/utils';
import Link from 'next/link';
import { buildPlaceHref } from '../lib/build-place-href';
import type { PlaceCardModel, PlaceCardVariant } from '../model/types';
import { PlaceCardImage } from './place-card-image';

export function PlaceCard({
  place,
  variant,
}: Readonly<{ place: PlaceCardModel; variant: PlaceCardVariant }>) {
  return (
    <article className="h-full border border-border bg-white">
      <Link
        href={buildPlaceHref(place.slug)}
        className="group flex h-full flex-col text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
      >
        <PlaceCardImage src={place.coverImageUrl} variant={variant} />
        <h2
          className={cn(
            'px-4 py-4 font-medium transition-colors group-hover:text-card-title-hover group-focus-visible:text-card-title-hover sm:px-5',
            variant === 'tall' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg',
          )}
        >
          {place.title}
        </h2>
      </Link>
    </article>
  );
}
```

Delete `place-card-badges.tsx` and its test. Keep `PlaceCategoryBadge` because the existing place-detail widget still uses it.

Remove `buildPlaceMaterialsHref` and `buildPlaceMaterialsAnchor` from
`src/entities/place/index.ts`, then delete their helper/test after `rg` confirms
there is no remaining consumer. Export the new card contracts:

```ts
export {
  PLACE_PLATFORMS,
  type PlaceCardModel,
  type PlaceCardVariant,
  type PlaceCategory,
  type PlaceDetailModel,
  type PlaceMaterialModel,
  type PlaceMaterialsByPlatform,
  type PlatformCounters,
} from './model/types';
export { PlaceCard } from './ui/place-card';
```

- [ ] **Step 5: Add the module helper and widget**

Create `src/widgets/place-feed/lib/chunk-place-cards.ts`:

```ts
import type { PlaceCardModel } from '@/entities/place';

const PLACE_MODULE_SIZE = 5;

export function chunkPlaceCards(items: PlaceCardModel[]): PlaceCardModel[][] {
  const modules: PlaceCardModel[][] = [];

  for (let index = 0; index < items.length; index += PLACE_MODULE_SIZE) {
    modules.push(items.slice(index, index + PLACE_MODULE_SIZE));
  }

  return modules;
}
```

Create `src/widgets/place-feed/ui/place-feed.tsx`:

```tsx
import { PlaceCard, type PlaceCardModel } from '@/entities/place';
import { chunkPlaceCards } from '../lib/chunk-place-cards';

export function PlaceFeed({ items }: Readonly<{ items: PlaceCardModel[] }>) {
  return (
    <section aria-label="Места" className="flex flex-col gap-5">
      {chunkPlaceCards(items).map((module) => (
        <div className="place-feed-module" key={module[0]?.id}>
          {module.map((place, index) => (
            <div className={index === 0 ? 'place-feed-module-tall' : undefined} key={place.id}>
              <PlaceCard place={place} variant={index === 0 ? 'tall' : 'regular'} />
            </div>
          ))}
        </div>
      ))}
    </section>
  );
}
```

Add to `src/app/globals.css`:

```css
.place-feed-module {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: minmax(12rem, auto);
  gap: --spacing(4);
}

.place-feed-module-tall {
  grid-row: span 2;
}

.place-card-media-regular {
  position: relative;
  aspect-ratio: 4 / 3;
  width: 100%;
  overflow: hidden;
}

.place-card-media-tall {
  position: relative;
  min-height: 0;
  flex: 1;
  width: 100%;
  overflow: hidden;
}

@media (min-width: 64rem) {
  .place-feed-module {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: --spacing(5);
  }
}
```

- [ ] **Step 6: Run focused tests and source checks**

Run:

```bash
pnpm exec vitest run src/entities/place src/widgets/place-feed
rg -n "grid-auto-flow|dense|PlaceCardBadges" src/entities/place src/widgets/place-feed
pnpm run typecheck
```

Expected: tests PASS; `rg` prints no matches; typecheck exits `0`.

- [ ] **Step 7: Commit the minimal place feed**

```bash
git add src/entities/place src/widgets/place-feed src/app/globals.css
git commit -m "feat(places): add minimal uneven place feed"
```

### Task 5: Add the server-rendered category route and page-one transport model

**Files:**

- Create the category page, page schema, adapter, loading/error, and content files listed in the File Map.

**Interfaces:**

- Produces `CategoryPlacesPage = { items; page; pageSize; total }`.
- Produces `fetchPublicCategoryPlacePage({ categoryId, categorySlug, page }): Promise<CategoryPlacesPage>`.
- Produces `getCategoryPageData(slug)` with `ready | not_found`.

- [ ] **Step 1: Write the schema, adapter, and route-loader tests**

Define the strict schema expectation:

```ts
const PAGE = {
  items: [
    {
      id: 'place-1',
      slug: 'baden-baden-uktus',
      title: 'Баден-Баден Уктус',
      coverImageUrl: null,
    },
  ],
  page: 1,
  pageSize: 20,
  total: 1,
};
```

The adapter test mocks `listPlaces` and asserts:

```ts
expect(listPlacesMock).toHaveBeenCalledWith({
  categoryId: 'category-spa',
  page: 1,
  pageSize: 20,
});
```

The loader tests assert invalid slug and backend 404 return `not_found`, page one is requested once, and an empty success remains `ready` with `items: []`.

- [ ] **Step 2: Run tests and verify missing route contracts**

Run:

```bash
pnpm exec vitest run src/entities/place/model/category-places-page-schema.test.ts src/entities/place/api/fetch-public-category-place-page.test.ts 'src/app/categories/[categorySlug]'
```

Expected: FAIL because these modules do not exist.

- [ ] **Step 3: Add the strict serializable page schema**

Create `src/entities/place/model/category-places-page-schema.ts`:

```ts
import { z } from 'zod';

export const categoryPlacesPageSchema = z.strictObject({
  items: z.array(
    z.strictObject({
      id: z.string().min(1),
      slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
      title: z.string().min(1),
      coverImageUrl: z.string().nullable(),
    }),
  ),
  page: z.number().int().min(1).max(1000),
  pageSize: z.literal(20),
  total: z.number().int().nonnegative(),
});

export type CategoryPlacesPage = z.infer<typeof categoryPlacesPageSchema>;
```

- [ ] **Step 4: Implement the backend page adapter**

Create `src/entities/place/api/fetch-public-category-place-page.ts`:

```ts
import { listPlaces } from '@/shared/api/generated/places/places';
import { mapPlaceSummaryToCardModel } from '../model/map-place-summary-to-card';
import type { CategoryPlacesPage } from '../model/category-places-page-schema';

export type FetchPublicCategoryPlacePageInput = {
  categoryId: string;
  categorySlug: string;
  page: number;
};

export async function fetchPublicCategoryPlacePage({
  categoryId,
  page,
}: FetchPublicCategoryPlacePageInput): Promise<CategoryPlacesPage> {
  const response = await listPlaces({
    categoryId,
    page,
    pageSize: 20,
  });

  return {
    items: response.data.items.map(mapPlaceSummaryToCardModel),
    page: response.data.page,
    pageSize: 20,
    total: response.data.total,
  };
}
```

Keep `categorySlug` in the input because Task 7 uses it for the cache tag.

- [ ] **Step 5: Implement the route loader and page composition**

Create `get-category-page-data.ts`:

```ts
import {
  fetchPublicCategory,
  mapCategoryToCardModel,
  normalizeCategorySlug,
} from '@/entities/category';
import { fetchPublicCategoryPlacePage } from '@/entities/place';

export async function getCategoryPageData(rawSlug: string) {
  const categorySlug = normalizeCategorySlug(rawSlug);
  if (!categorySlug) return { kind: 'not_found' as const };

  const category = await fetchPublicCategory(categorySlug);
  if (!category) return { kind: 'not_found' as const };

  const places = await fetchPublicCategoryPlacePage({
    categoryId: category.id,
    categorySlug,
    page: 1,
  });

  return {
    kind: 'ready' as const,
    category: mapCategoryToCardModel(category),
    places,
  };
}
```

`category-page-content.tsx` renders semantic breadcrumbs (`Главная`, `Категории`, current title), the category `h1`, and either `В этой категории пока нет мест.` or `<PlaceFeed items={places.items} />`.

Create `src/app/categories/[categorySlug]/_components/category-page-content.tsx`:

```tsx
import type { CategoryCardModel } from '@/entities/category';
import type { CategoryPlacesPage } from '@/entities/place';
import { Container } from '@/shared/ui';
import { PlaceFeed } from '@/widgets/place-feed';
import Link from 'next/link';

export function CategoryPageContent({
  category,
  places,
}: Readonly<{ category: CategoryCardModel; places: CategoryPlacesPage }>) {
  return (
    <Container as="main" className="py-8 sm:py-12 lg:py-14">
      <nav aria-label="Хлебные крошки" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/"
              className="hover:text-black focus-visible:outline-2 focus-visible:outline-black"
            >
              Главная
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/categories"
              className="hover:text-black focus-visible:outline-2 focus-visible:outline-black"
            >
              Категории
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="text-black">
            {category.title}
          </li>
        </ol>
      </nav>

      <h1 className="mb-8 text-3xl font-medium text-black sm:text-4xl">{category.title}</h1>

      {places.items.length > 0 ? (
        <PlaceFeed items={places.items} />
      ) : (
        <p className="py-12 text-base text-muted-foreground">В этой категории пока нет мест.</p>
      )}
    </Container>
  );
}
```

Create `src/app/categories/[categorySlug]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import { CategoryPageContent } from './_components/category-page-content';
import { getCategoryPageData } from './_lib/get-category-page-data';

export default async function CategoryPage({
  params,
}: Readonly<{ params: Promise<{ categorySlug: string }> }>) {
  const { categorySlug } = await params;
  const model = await getCategoryPageData(categorySlug);

  if (model.kind === 'not_found') notFound();

  return <CategoryPageContent category={model.category} places={model.places} />;
}
```

`loading.tsx` renders a stable `Container` with `role="status"` and visible `Открываем категорию…`; it contains no card skeleton.

Create `src/app/categories/[categorySlug]/loading.tsx`:

```tsx
import { Container } from '@/shared/ui';

export default function CategoryLoading() {
  return (
    <Container as="main" className="py-12">
      <div className="flex min-h-48 items-center justify-center" role="status" aria-live="polite">
        Открываем категорию…
      </div>
    </Container>
  );
}
```

`error.tsx` is a Client Component with `reset()` wired to a rectangular `Повторить` button.

Create `src/app/categories/[categorySlug]/error.tsx`:

```tsx
'use client';

import { Container } from '@/shared/ui';

export default function CategoryError({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  void error;

  return (
    <Container as="main" className="py-12">
      <section className="flex min-h-48 flex-col items-start justify-center gap-5">
        <h1 className="text-2xl font-medium text-black">Не удалось загрузить категорию</h1>
        <p className="text-muted-foreground">Попробуйте запросить данные ещё раз.</p>
        <button
          type="button"
          onClick={reset}
          className="border border-black bg-black px-5 py-3 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
        >
          Повторить
        </button>
      </section>
    </Container>
  );
}
```

Add these exports to `src/entities/place/index.ts`:

```ts
export { fetchPublicCategoryPlacePage } from './api/fetch-public-category-place-page';
export {
  categoryPlacesPageSchema,
  type CategoryPlacesPage,
} from './model/category-places-page-schema';
```

- [ ] **Step 6: Run route and accessibility tests**

Run:

```bash
pnpm exec vitest run src/entities/place/model/category-places-page-schema.test.ts src/entities/place/api/fetch-public-category-place-page.test.ts 'src/app/categories/[categorySlug]'
pnpm run typecheck
```

Expected: tests PASS; typecheck exits `0`.

- [ ] **Step 7: Commit server page one**

```bash
git add src/entities/place src/app/categories
git commit -m "feat(categories): add server-rendered category route"
```

### Task 6: Add infinite append, loader, retry, and same-origin page Route Handler

**Files:**

- Create all `features/infinite-places` and category-place API Route Handler files from the File Map.
- Modify `src/app/categories/[categorySlug]/_components/category-page-content.tsx`.
- Modify `src/app/globals.css`.

**Interfaces:**

- Produces `createInfinitePlacesState(initialPage)`.
- Produces `infinitePlacesReducer(state, action)`.
- Produces `InfinitePlaces({ initialPage, categorySlug })`.
- Produces `GET(request, { params })` returning only `CategoryPlacesPage`.

- [ ] **Step 1: Write the pure state-machine tests**

Cover these exact transitions:

```ts
request: idle -> loading
success: append unseen ids in response order
success: ignore duplicate ids
success: end when mergedItems.length >= total
success: end when response contributes no unseen ids
failure: keep every existing item and set error
retry: error -> loading
request while loading/end: unchanged
```

Use initial ids `1..20`, response ids `20..39`, and assert the merged order is `1..39`.

- [ ] **Step 2: Run state tests and verify missing feature**

Run:

```bash
pnpm exec vitest run src/features/infinite-places
```

Expected: FAIL because the feature does not exist.

- [ ] **Step 3: Implement the pure state machine**

Create `infinite-places-state.ts` with:

```ts
import type { CategoryPlacesPage, PlaceCardModel } from '@/entities/place';

type InfinitePlacesStatus = 'idle' | 'loading' | 'error' | 'end';

export type InfinitePlacesState = {
  items: PlaceCardModel[];
  page: number;
  total: number;
  status: InfinitePlacesStatus;
};

export type InfinitePlacesAction =
  | { type: 'request' }
  | { type: 'success'; page: CategoryPlacesPage }
  | { type: 'failure' }
  | { type: 'retry' };

export function createInfinitePlacesState(page: CategoryPlacesPage): InfinitePlacesState {
  return {
    items: page.items,
    page: page.page,
    total: page.total,
    status: page.items.length >= page.total ? 'end' : 'idle',
  };
}

export function infinitePlacesReducer(
  state: InfinitePlacesState,
  action: InfinitePlacesAction,
): InfinitePlacesState {
  if (action.type === 'request' || action.type === 'retry') {
    if (state.status !== 'idle' && state.status !== 'error') return state;
    return { ...state, status: 'loading' };
  }

  if (action.type === 'failure') {
    return state.status === 'loading' ? { ...state, status: 'error' } : state;
  }

  if (state.status !== 'loading') return state;

  const knownIds = new Set(state.items.map(({ id }) => id));
  const newItems = action.page.items.filter(({ id }) => !knownIds.has(id));
  const items = [...state.items, ...newItems];
  const ended = newItems.length === 0 || items.length >= action.page.total;

  return {
    items,
    page: action.page.page,
    total: action.page.total,
    status: ended ? 'end' : 'idle',
  };
}
```

- [ ] **Step 4: Add the bounded page parser and Route Handler**

`normalizePageParam` returns a number only for decimal integers from `1` through `1000`.

Create `src/app/api/categories/[categorySlug]/places/_lib/normalize-page-param.ts`:

```ts
const MIN_PAGE = 1;
const MAX_PAGE = 1000;

export function normalizePageParam(rawPage: string | null): number | null {
  if (!rawPage || !/^\d+$/.test(rawPage)) return null;

  const page = Number(rawPage);
  if (!Number.isSafeInteger(page) || page < MIN_PAGE || page > MAX_PAGE) return null;

  return page;
}
```

The Route Handler:

```ts
import { fetchPublicCategory, normalizeCategorySlug } from '@/entities/category';
import { fetchPublicCategoryPlacePage } from '@/entities/place';
import { normalizePageParam } from './_lib/normalize-page-param';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ categorySlug: string }> },
) {
  const { categorySlug: rawSlug } = await params;
  const categorySlug = normalizeCategorySlug(rawSlug);
  const page = normalizePageParam(new URL(request.url).searchParams.get('page'));

  if (!categorySlug || page === null) {
    return Response.json({ message: 'Некорректные параметры.' }, { status: 400 });
  }

  const category = await fetchPublicCategory(categorySlug);
  if (!category) {
    return Response.json({ message: 'Категория не найдена.' }, { status: 404 });
  }

  const result = await fetchPublicCategoryPlacePage({
    categoryId: category.id,
    categorySlug,
    page,
  });

  return Response.json(result);
}
```

Route tests mock both entity adapters and assert no generated backend-only fields appear in the JSON.

- [ ] **Step 5: Implement the client fetcher and observer component**

Create `src/features/infinite-places/api/fetch-next-category-places-page.ts`:

```ts
import { categoryPlacesPageSchema, type CategoryPlacesPage } from '@/entities/place';

export async function fetchNextCategoryPlacesPage({
  categorySlug,
  page,
  signal,
}: {
  categorySlug: string;
  page: number;
  signal: AbortSignal;
}): Promise<CategoryPlacesPage> {
  const response = await fetch(
    `/api/categories/${encodeURIComponent(categorySlug)}/places?page=${page}`,
    { signal },
  );

  if (!response.ok) {
    throw new Error(`Category places request failed with ${response.status}`);
  }

  return categoryPlacesPageSchema.parse(await response.json());
}
```

Create `src/features/infinite-places/ui/infinite-places.tsx`:

```tsx
'use client';

import type { CategoryPlacesPage } from '@/entities/place';
import { PlaceFeed } from '@/widgets/place-feed';
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { fetchNextCategoryPlacesPage } from '../api/fetch-next-category-places-page';
import { createInfinitePlacesState, infinitePlacesReducer } from '../model/infinite-places-state';

export function InfinitePlaces({
  initialPage,
  categorySlug,
}: Readonly<{ initialPage: CategoryPlacesPage; categorySlug: string }>) {
  const [state, dispatch] = useReducer(
    infinitePlacesReducer,
    initialPage,
    createInfinitePlacesState,
  );
  const stateRef = useRef(state);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  stateRef.current = state;

  const loadNextPage = useCallback(
    async (retry = false) => {
      const current = stateRef.current;
      const allowed = retry ? current.status === 'error' : current.status === 'idle';
      if (!allowed) return;

      dispatch({ type: retry ? 'retry' : 'request' });
      const controller = new AbortController();
      requestRef.current = controller;

      try {
        const page = await fetchNextCategoryPlacesPage({
          categorySlug,
          page: current.page + 1,
          signal: controller.signal,
        });
        dispatch({ type: 'success', page });
      } catch {
        if (!controller.signal.aborted) dispatch({ type: 'failure' });
      } finally {
        if (requestRef.current === controller) requestRef.current = null;
      }
    },
    [categorySlug],
  );

  useEffect(() => () => requestRef.current?.abort(), []);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || state.status !== 'idle') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.unobserve(sentinel);
        void loadNextPage();
      },
      { rootMargin: '240px 0px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loadNextPage, state.status]);

  return (
    <>
      <PlaceFeed items={state.items} />

      {state.status !== 'end' && (
        <div className="places-append-control">
          {state.status === 'idle' && (
            <div ref={sentinelRef} className="h-12 w-full" aria-hidden="true" />
          )}

          {state.status === 'loading' && (
            <div className="places-append-loader" role="status" aria-live="polite">
              <span className="sr-only">Загружаем следующие места</span>
              <span aria-hidden="true" className="places-append-loader-track">
                <span className="places-append-loader-segment" />
              </span>
            </div>
          )}

          {state.status === 'error' && (
            <button
              type="button"
              onClick={() => void loadNextPage(true)}
              className="border border-black bg-white px-5 py-3 text-sm font-medium text-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black"
            >
              Повторить
            </button>
          )}
        </div>
      )}
    </>
  );
}
```

Create `src/features/infinite-places/index.ts`:

```ts
export { InfinitePlaces } from './ui/infinite-places';
```

- [ ] **Step 6: Add named loader animation and integrate**

Add to `@theme inline`:

```css
--animate-place-feed-loader: place-feed-loader 1.2s var(--ease-catalog) infinite;
```

Add the keyframes and component classes without JSX bracket utilities:

```css
@keyframes place-feed-loader {
  0% {
    transform: translateX(-120%);
  }
  100% {
    transform: translateX(420%);
  }
}

.places-append-loader {
  display: flex;
  align-items: center;
  justify-content: center;
}

.places-append-control {
  display: flex;
  min-height: 48px;
  align-items: center;
  justify-content: center;
}

.places-append-loader-track {
  display: block;
  height: 1px;
  width: 128px;
  overflow: hidden;
  background: var(--color-border);
}

.places-append-loader-segment {
  display: block;
  height: 1px;
  width: 24px;
  background: var(--color-black);
  animation: var(--animate-place-feed-loader);
}

@media (prefers-reduced-motion: reduce) {
  .places-append-loader-segment {
    animation: none;
    transform: translateX(52px);
  }
}
```

Replace the direct `PlaceFeed` in category page content with:

```tsx
<InfinitePlaces initialPage={places} categorySlug={category.slug} />
```

- [ ] **Step 7: Run feature and route tests**

Run:

```bash
pnpm exec vitest run src/features/infinite-places 'src/app/api/categories/[categorySlug]/places' 'src/app/categories/[categorySlug]'
pnpm run typecheck
```

Expected: append/state/route tests PASS; typecheck exits `0`.

- [ ] **Step 8: Commit infinite pagination**

```bash
git add src/features/infinite-places src/app/api/categories src/app/categories src/app/globals.css
git commit -m "feat(places): add infinite category feed"
```

### Task 7: Enable Cache Components, cache public reads, and prerender known slugs

**Files:**

- Create/modify every Cache Components and static-param file from the File Map.

**Interfaces:**

- Produces exact cache life and tag builder functions.
- All successful category/list/detail/material adapters become cached server functions.
- Both dynamic public pages export `generateStaticParams`.

- [ ] **Step 1: Write cache/config/static-param tests**

`public-catalog-cache.test.ts` must assert:

```ts
expect(PUBLIC_CATALOG_CACHE_LIFE).toEqual({
  stale: 60,
  revalidate: 300,
  expire: 3600,
});
expect(getCategoriesCacheTag()).toBe('categories');
expect(getCategoryCacheTag('family-spa')).toBe('category:family-spa');
expect(getCategoryPlacesCacheTag('family-spa')).toBe('category-places:family-spa');
expect(getPlaceCacheTag('baden-baden-uktus')).toBe('place:baden-baden-uktus');
```

The config test dynamically imports `next.config.ts` and expects `cacheComponents === true`.

Adapter tests mock `next/cache` and assert exact `cacheLife` and `cacheTag` calls.

The place-slug enumeration test returns `100 + 2` items across two API pages and asserts calls for pages `1` and `2`, each with `pageSize: 100`.

- [ ] **Step 2: Run cache tests and verify failure**

Run:

```bash
pnpm exec vitest run src/shared/lib/cache src/next-config-cache-components.test.ts src/entities/category/api src/entities/place/api
```

Expected: FAIL because cache helpers/config/static enumeration are absent.

- [ ] **Step 3: Add shared cache life and tag builders**

Create `src/shared/lib/cache/public-catalog-cache.ts`:

```ts
export const PUBLIC_CATALOG_CACHE_LIFE = {
  stale: 60,
  revalidate: 300,
  expire: 3600,
} as const;

export const getCategoriesCacheTag = () => 'categories';
export const getCategoryCacheTag = (slug: string) => `category:${slug}`;
export const getCategoryPlacesCacheTag = (slug: string) => `category-places:${slug}`;
export const getPlaceCacheTag = (slug: string) => `place:${slug}`;
```

Export them through `src/shared/lib/cache/index.ts`.

Create `src/shared/lib/cache/index.ts`:

```ts
export {
  PUBLIC_CATALOG_CACHE_LIFE,
  getCategoriesCacheTag,
  getCategoryCacheTag,
  getCategoryPlacesCacheTag,
  getPlaceCacheTag,
} from './public-catalog-cache';
```

- [ ] **Step 4: Enable Cache Components and cache category/list reads**

Add to `next.config.ts`:

```ts
cacheComponents: true,
```

At the top of each successful public data adapter, add `'use cache'`, then:

```ts
cacheLife(PUBLIC_CATALOG_CACHE_LIFE);
```

Apply tags as follows:

```ts
fetchPublicCategories:
cacheTag(getCategoriesCacheTag());

fetchPublicCategory(categorySlug):
cacheTag(getCategoryCacheTag(categorySlug));

fetchPublicCategoryPlacePage({ categorySlug }):
cacheTag(getCategoryPlacesCacheTag(categorySlug));
```

Do not catch technical failures into cacheable error objects. Only the category 404 remains a `null` return.

Replace `src/entities/category/api/fetch-public-categories.ts` with:

```ts
import type { PlaceCategory } from '@/shared/api/generated/model/placeCategory';
import { listPlaceCategories } from '@/shared/api/generated/places/places';
import { PUBLIC_CATALOG_CACHE_LIFE, getCategoriesCacheTag } from '@/shared/lib/cache';
import { cacheLife, cacheTag } from 'next/cache';

export async function fetchPublicCategories(): Promise<PlaceCategory[]> {
  'use cache';
  cacheLife(PUBLIC_CATALOG_CACHE_LIFE);
  cacheTag(getCategoriesCacheTag());

  const response = await listPlaceCategories();
  return response.data.items;
}
```

Replace `src/entities/category/api/fetch-public-category.ts` with:

```ts
import type { PlaceCategory } from '@/shared/api/generated/model/placeCategory';
import { getPlaceCategory } from '@/shared/api/generated/places/places';
import { isGeneratedApiError } from '@/shared/lib/api/is-generated-api-error';
import { PUBLIC_CATALOG_CACHE_LIFE, getCategoryCacheTag } from '@/shared/lib/cache';
import { cacheLife, cacheTag } from 'next/cache';

export async function fetchPublicCategory(categorySlug: string): Promise<PlaceCategory | null> {
  'use cache';
  cacheLife(PUBLIC_CATALOG_CACHE_LIFE);
  cacheTag(getCategoryCacheTag(categorySlug));

  try {
    const response = await getPlaceCategory({ categorySlug });
    return response.data;
  } catch (error) {
    if (isGeneratedApiError(error) && error.status === 404) return null;
    throw error;
  }
}
```

Replace `src/entities/place/api/fetch-public-category-place-page.ts` with:

```ts
import { listPlaces } from '@/shared/api/generated/places/places';
import { PUBLIC_CATALOG_CACHE_LIFE, getCategoryPlacesCacheTag } from '@/shared/lib/cache';
import { cacheLife, cacheTag } from 'next/cache';
import type { CategoryPlacesPage } from '../model/category-places-page-schema';
import { mapPlaceSummaryToCardModel } from '../model/map-place-summary-to-card';

export type FetchPublicCategoryPlacePageInput = {
  categoryId: string;
  categorySlug: string;
  page: number;
};

export async function fetchPublicCategoryPlacePage({
  categoryId,
  categorySlug,
  page,
}: FetchPublicCategoryPlacePageInput): Promise<CategoryPlacesPage> {
  'use cache';
  cacheLife(PUBLIC_CATALOG_CACHE_LIFE);
  cacheTag(getCategoryPlacesCacheTag(categorySlug));

  const response = await listPlaces({ categoryId, page, pageSize: 20 });

  return {
    items: response.data.items.map(mapPlaceSummaryToCardModel),
    page: response.data.page,
    pageSize: 20,
    total: response.data.total,
  };
}
```

- [ ] **Step 5: Cache place detail and material adapters under one tag**

Remove every `cache: 'no-store'` option from:

- `src/entities/place/api/fetch-public-place-detail.ts`
- `src/entities/place/api/fetch-public-place-materials.ts`

Add `'use cache'`, the shared cache life, and:

```ts
cacheTag(getPlaceCacheTag(placeSlug));
```

to both functions. The existing route loader continues to combine the detail and three platform reads without changing the place-detail UI.

Keep the public union contracts uncached and put the directive in successful
inner functions so a technical error is not converted into a cached error
object. `fetch-public-place-detail.ts` uses:

```ts
async function fetchCachedPublicPlaceDetail(
  placeSlug: string,
): Promise<getPlaceDetailResponseSuccess['data']> {
  'use cache';
  cacheLife(PUBLIC_CATALOG_CACHE_LIFE);
  cacheTag(getPlaceCacheTag(placeSlug));

  const response = await getPlaceDetail({ placeSlug });
  return response.data;
}

export async function fetchPublicPlaceDetail(
  placeSlug: string,
): Promise<FetchPublicPlaceDetailResult> {
  try {
    return {
      kind: 'success',
      data: await fetchCachedPublicPlaceDetail(placeSlug),
    };
  } catch (error) {
    if (isGeneratedApiError(error) && error.status === 404) {
      return {
        kind: 'not_found',
        data: error.info as getPlaceDetailResponseError['data'],
      };
    }
    return { kind: 'unexpected_error', message: 'Не удалось загрузить место.' };
  }
}
```

`fetch-public-place-materials.ts` uses the same outer-union pattern with this
cached inner function:

```ts
async function fetchCachedPublicPlaceMaterials(
  placeSlug: string,
  platform: Platform,
): Promise<listPlaceMaterialsResponseSuccess['data']> {
  'use cache';
  cacheLife(PUBLIC_CATALOG_CACHE_LIFE);
  cacheTag(getPlaceCacheTag(placeSlug));

  const query: ListPlaceMaterialsParams = { platform };
  const response = await listPlaceMaterials({ placeSlug }, query);
  return response.data;
}
```

The outer `fetchPublicPlaceMaterials` keeps the existing `bad_request`,
`not_found`, and `unexpected_error` mapping and calls the cached inner function
instead of the generated client directly.

- [ ] **Step 6: Add build-time slug enumeration**

Create `fetch-all-public-place-slugs.ts`:

```ts
import { listPlaces } from '@/shared/api/generated/places/places';
import { PUBLIC_CATALOG_CACHE_LIFE } from '@/shared/lib/cache';
import { cacheLife } from 'next/cache';

const BUILD_PAGE_SIZE = 100;

export async function fetchAllPublicPlaceSlugs(): Promise<string[]> {
  'use cache';
  cacheLife(PUBLIC_CATALOG_CACHE_LIFE);

  const slugs: string[] = [];
  let page = 1;

  while (true) {
    const response = await listPlaces({ page, pageSize: BUILD_PAGE_SIZE });
    slugs.push(...response.data.items.map(({ slug }) => slug));

    if (slugs.length >= response.data.total) return slugs;
    page += 1;
  }
}
```

Create category static params:

```ts
import { fetchPublicCategories } from '@/entities/category';

export async function getCategoryStaticParams() {
  const categories = await fetchPublicCategories();
  return categories.map(({ slug: categorySlug }) => ({ categorySlug }));
}
```

Create place static params:

```ts
import { fetchAllPublicPlaceSlugs } from '@/entities/place';

export async function getPlaceStaticParams() {
  const slugs = await fetchAllPublicPlaceSlugs();
  return slugs.map((placeSlug) => ({ placeSlug }));
}
```

Export the enumeration helper from `src/entities/place/index.ts`:

```ts
export { fetchAllPublicPlaceSlugs } from './api/fetch-all-public-place-slugs';
```

In `src/app/categories/[categorySlug]/page.tsx`, add:

```ts
import { getCategoryStaticParams } from './_lib/get-category-static-params';

export async function generateStaticParams() {
  return getCategoryStaticParams();
}
```

In `src/app/places/[placeSlug]/page.tsx`, add:

```ts
import { getPlaceStaticParams } from './_lib/get-place-static-params';

export async function generateStaticParams() {
  return getPlaceStaticParams();
}
```

Do not export `dynamicParams = false`; new slugs must remain on-demand.

- [ ] **Step 7: Verify no covered public `no-store` remains**

Run:

```bash
rg -n "cache: ['\"]no-store['\"]" src/entities/category src/entities/place
```

Expected: no matches.

- [ ] **Step 8: Run cache tests, typecheck, and a backend-connected build**

Prerequisite: `API_BASE_URL` points to a reachable backend containing valid public category/place data.

Run:

```bash
pnpm exec vitest run src/shared/lib/cache src/next-config-cache-components.test.ts src/entities/category/api src/entities/place/api 'src/app/categories/[categorySlug]' 'src/app/places/[placeSlug]'
pnpm run typecheck
pnpm run build
```

Expected: tests PASS; typecheck/build exit `0`; build output includes prerendered category and place paths. An unreachable backend must fail the build.

- [ ] **Step 9: Commit Cache Components activation**

```bash
git add next.config.ts src/shared/lib/cache src/entities src/app/categories src/app/places src/next-config-cache-components.test.ts
git commit -m "feat(cache): cache and prerender public catalog"
```

### Task 8: Implement the signed cache-revalidation Route Handler

**Files:**

- Modify/create every invalidation file listed in the File Map.

**Interfaces:**

- Produces strict `CacheRevalidationPayload`.
- Produces `verifyCacheRevalidationSignature(input): boolean`.
- Produces `mapRevalidationScopesToTags(scopes): string[]`.
- Produces `POST(request): Promise<Response>`.

- [ ] **Step 1: Write schema/signature/mapping tests**

Use this valid payload:

```ts
const VALID_PAYLOAD = {
  schemaVersion: 1,
  eventId: '0d088c43-4f7f-4c3b-b51f-1457cc9ef818',
  occurredAt: '2026-07-19T12:00:00.000Z',
  scopes: {
    categories: true,
    categorySlugs: ['old-slug', 'new-slug'],
    placeSlugs: ['old-place', 'new-place'],
  },
};
```

Schema tests reject version `2`, malformed UUID/timestamp/slug, empty scopes, empty arrays, and unknown root/scope fields.

Signature tests compute the real HMAC, accept exactly `300` seconds, reject `301`, reject missing/malformed headers, and reject a different raw-body byte sequence.

Mapping tests assert duplicate slugs produce each tag once in deterministic order.

- [ ] **Step 2: Run helper tests and verify missing modules**

Run:

```bash
pnpm exec vitest run src/app/api/cache/revalidate/_lib
```

Expected: FAIL because the helper modules do not exist.

- [ ] **Step 3: Add the strict schema**

Create `cache-revalidation-schema.ts`:

```ts
import { z } from 'zod';

const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const cacheRevalidationPayloadSchema = z.strictObject({
  schemaVersion: z.literal(1),
  eventId: z.uuid(),
  occurredAt: z.iso.datetime({ offset: true }),
  scopes: z
    .strictObject({
      categories: z.literal(true).optional(),
      categorySlugs: z.array(slugSchema).min(1).optional(),
      placeSlugs: z.array(slugSchema).min(1).optional(),
    })
    .refine(
      (scopes) =>
        scopes.categories === true ||
        (scopes.categorySlugs?.length ?? 0) > 0 ||
        (scopes.placeSlugs?.length ?? 0) > 0,
      { message: 'At least one invalidation scope is required.' },
    ),
});

export type CacheRevalidationPayload = z.infer<typeof cacheRevalidationPayloadSchema>;
```

- [ ] **Step 4: Implement constant-time HMAC verification**

Create `verify-cache-revalidation-signature.ts`:

```ts
import { createHmac, timingSafeEqual } from 'node:crypto';

const SIGNATURE_PATTERN = /^sha256=([a-f0-9]{64})$/;
const REPLAY_WINDOW_SECONDS = 300;

type VerifyInput = {
  rawBody: string;
  timestampHeader: string | null;
  signatureHeader: string | null;
  secret: string;
  nowSeconds?: number;
};

export function verifyCacheRevalidationSignature({
  rawBody,
  timestampHeader,
  signatureHeader,
  secret,
  nowSeconds = Math.floor(Date.now() / 1000),
}: VerifyInput): boolean {
  if (!/^\d+$/.test(timestampHeader ?? '')) return false;

  const timestamp = Number(timestampHeader);
  if (!Number.isSafeInteger(timestamp)) return false;
  if (Math.abs(nowSeconds - timestamp) > REPLAY_WINDOW_SECONDS) return false;

  const signatureMatch = signatureHeader?.match(SIGNATURE_PATTERN);
  if (!signatureMatch) return false;

  const expected = createHmac('sha256', secret)
    .update(`${timestampHeader}.${rawBody}`, 'utf8')
    .digest();
  const received = Buffer.from(signatureMatch[1], 'hex');

  return received.length === expected.length && timingSafeEqual(received, expected);
}
```

- [ ] **Step 5: Implement scope-to-tag mapping**

Create `map-revalidation-scopes-to-tags.ts`:

```ts
import type { CacheRevalidationPayload } from './cache-revalidation-schema';
import {
  getCategoriesCacheTag,
  getCategoryCacheTag,
  getCategoryPlacesCacheTag,
  getPlaceCacheTag,
} from '@/shared/lib/cache';

export function mapRevalidationScopesToTags(scopes: CacheRevalidationPayload['scopes']): string[] {
  const tags = new Set<string>();

  if (scopes.categories) tags.add(getCategoriesCacheTag());
  for (const slug of scopes.categorySlugs ?? []) {
    tags.add(getCategoryCacheTag(slug));
    tags.add(getCategoryPlacesCacheTag(slug));
  }
  for (const slug of scopes.placeSlugs ?? []) {
    tags.add(getPlaceCacheTag(slug));
  }

  return [...tags];
}
```

- [ ] **Step 6: Write Route Handler tests before the handler**

Mock `revalidateTag` from `next/cache`.

Test:

- valid signature/body → `204` and each expected tag exactly once with `{ expire: 0 }`;
- duplicate valid delivery → another harmless `204`;
- invalid signature/replayed timestamp → `401` and zero invalidations;
- valid signature plus invalid JSON/schema → `400`;
- missing/short secret → `500`;
- thrown `revalidateTag` → `500`;
- response/log output never contains the configured secret or full signature.

- [ ] **Step 7: Implement raw-body-first POST**

Create `route.ts`:

```ts
import { revalidateTag } from 'next/cache';
import { cacheRevalidationPayloadSchema } from './_lib/cache-revalidation-schema';
import { mapRevalidationScopesToTags } from './_lib/map-revalidation-scopes-to-tags';
import { verifyCacheRevalidationSignature } from './_lib/verify-cache-revalidation-signature';

export const runtime = 'nodejs';

export async function POST(request: Request): Promise<Response> {
  try {
    const secret = process.env.CACHE_REVALIDATION_SECRET;
    if (!secret || secret.length < 32) {
      return Response.json({ message: 'Cache revalidation is not configured.' }, { status: 500 });
    }

    const rawBody = await request.text();
    const verified = verifyCacheRevalidationSignature({
      rawBody,
      timestampHeader: request.headers.get('X-Amazing-Timestamp'),
      signatureHeader: request.headers.get('X-Amazing-Signature'),
      secret,
    });

    if (!verified) {
      return Response.json({ message: 'Invalid signature.' }, { status: 401 });
    }

    let json: unknown;
    try {
      json = JSON.parse(rawBody);
    } catch {
      return Response.json({ message: 'Invalid JSON body.' }, { status: 400 });
    }

    const payload = cacheRevalidationPayloadSchema.safeParse(json);
    if (!payload.success) {
      return Response.json({ message: 'Invalid revalidation body.' }, { status: 400 });
    }

    for (const tag of mapRevalidationScopesToTags(payload.data.scopes)) {
      revalidateTag(tag, { expire: 0 });
    }

    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ message: 'Cache revalidation failed.' }, { status: 500 });
  }
}
```

Add to `.env.example`:

```dotenv
# Shared HMAC secret for POST /api/cache/revalidate. Use at least 32 characters.
CACHE_REVALIDATION_SECRET=
```

- [ ] **Step 8: Run webhook tests and typecheck**

Run:

```bash
pnpm exec vitest run src/app/api/cache/revalidate
pnpm run typecheck
```

Expected: all schema/signature/route tests PASS; typecheck exits `0`.

- [ ] **Step 9: Commit signed invalidation**

```bash
git add .env.example src/app/api/cache/revalidate
git commit -m "feat(cache): add signed revalidation endpoint"
```

### Task 9: Add final source-contract coverage and run the complete automated gate

**Files:**

- Create: `src/app/public-catalog-source-contract.test.ts`
- Modify only the owning files if a gate exposes a defect.

**Interfaces:**

- Produces executable evidence that removed flows stay removed and no new arbitrary Tailwind utilities enter the catalog surface.

- [ ] **Step 1: Add the source-contract test**

Create:

```ts
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const CATALOG_SOURCE_FILES = [
  'src/app/(home)/page.tsx',
  'src/app/(home)/_components/home-category-section.tsx',
  'src/app/(home)/_components/show-all-categories-link.tsx',
  'src/app/categories/page.tsx',
  'src/app/categories/[categorySlug]/_components/category-page-content.tsx',
  'src/entities/category/ui/category-card.tsx',
  'src/entities/category/ui/category-card-image.tsx',
  'src/entities/place/ui/place-card.tsx',
  'src/entities/place/ui/place-card-image.tsx',
  'src/features/infinite-places/ui/infinite-places.tsx',
  'src/widgets/category-grid/ui/category-grid.tsx',
  'src/widgets/place-feed/ui/place-feed.tsx',
  'src/widgets/site-header/ui/site-header.tsx',
] as const;

describe('public catalog source contract', () => {
  it('contains no legacy query catalog slices', () => {
    expect(existsSync(resolve(process.cwd(), 'src/features/catalog-controls'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/features/places-pagination'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/widgets/places-catalog'))).toBe(false);
  });

  it('adds no arbitrary Tailwind bracket utilities to the catalog source', () => {
    const arbitraryUtility = /(?:^|\s)[^\s"'`]*-\[[^\]]+\]/m;

    for (const path of CATALOG_SOURCE_FILES) {
      const source = readFileSync(resolve(process.cwd(), path), 'utf8');
      expect(source, path).not.toMatch(arbitraryUtility);
    }
  });
});
```

- [ ] **Step 2: Run formatting and focused source test**

Run:

```bash
pnpm run format
pnpm exec vitest run src/app/public-catalog-source-contract.test.ts
git diff --check
```

Expected: formatter completes; source contract PASS; diff check prints nothing.

- [ ] **Step 3: Run the complete quality gate**

Run:

```bash
pnpm run format:check
pnpm run lint:strict
pnpm run test:unit
pnpm run typecheck
pnpm run build
git diff --check
```

Expected: every command exits `0`. `pnpm run build` requires the backend public API.

- [ ] **Step 4: Inspect build output and route contracts**

Confirm:

- `/`, `/categories`, known category slugs, and known active place slugs are prerendered;
- `/api/categories/[categorySlug]/places` and `/api/cache/revalidate` remain Route Handlers;
- no normal category page-one browser request is needed after hydration;
- there are no build warnings about uncached dynamic data outside Suspense.

- [ ] **Step 5: Commit the regression contract**

```bash
git add src/app/public-catalog-source-contract.test.ts
git commit -m "test(catalog): guard public navigation contract"
```

### Task 10: Complete desktop/mobile, navigation-state, and cache verification

**Files:**

- No tracked source expected.
- Temporary evidence: `/tmp/amazing-ekb-public-catalog/*.png`.

**Interfaces:**

- Produces fresh runtime evidence for layout, accessibility, state restoration, append behavior, and webhook freshness.

- [ ] **Step 1: Start backend and frontend with matched secrets**

Set:

```dotenv
API_BASE_URL=http://127.0.0.1:3000/v1
CACHE_REVALIDATION_SECRET=<same value configured in backend, at least 32 characters>
```

Start the existing backend, then:

```bash
pnpm run dev
```

Expected: frontend listens on `http://localhost:3001` and backend requests succeed.

- [ ] **Step 2: Capture desktop and mobile page evidence**

Create `/tmp/amazing-ekb-public-catalog/` and capture:

- `/` at `1440px` and `390px`;
- `/categories` at `1440px` and `390px`;
- one populated `/categories/{slug}` at both widths;
- one empty category if fixture data provides it;
- `/places/{slug}` with the shared header.

Confirm:

- home has no more than eight category cards;
- category grid is four columns desktop and two columns mobile;
- place modules are three columns desktop and two columns mobile;
- every module begins with one two-row card;
- no card radius, shadow, internal divider, or horizontal overflow;
- real covers crop with `object-cover`; category fallback uses `object-contain`;
- Onest is the catalog/header font and place-detail local typography remains intact.

- [ ] **Step 3: Verify interaction and accessible states**

Check mouse and keyboard:

- sticky header changes `78px → 58px`, border fades in, no blur/shadow;
- reduced motion removes interpolation;
- category/place focus is visible;
- category/place hover changes title only to `#c6b09f`;
- CTA idle/hover/focus matches the black/white wipe and synchronized arrow/text;
- append loader has no visible text, exposes the hidden Russian status, and reserves height;
- append failure retains cards and exposes the `Повторить` button;
- end state removes sentinel/loader silently.

- [ ] **Step 4: Verify infinite feed and Activity restoration**

On a category with more than twenty places:

1. Confirm page one items already exist in the initial HTML.
2. Scroll until page two appends and confirm only one network request is active.
3. Confirm ids/order are not duplicated and existing modules do not reflow.
4. Open a place card through `next/link`.
5. Use browser Back.
6. Confirm appended items and scroll position are restored.
7. Hard reload and confirm the feed starts from the server-provided first twenty.

- [ ] **Step 5: Verify webhook and TTL behavior**

With a cached category/place open:

1. Perform an admin mutation covered by backend PR #133.
2. Confirm backend delivery logs show the stable event id and a `204`.
3. Request the affected frontend page and confirm it blocks for fresh data rather than serving the old entry.
4. Send the same signed event again and confirm another harmless `204`.
5. Send an invalid signature and confirm `401` with no cache invalidation.
6. Temporarily disable delivery, mutate test data, and confirm stale-while-revalidate remains the fallback after `300s`, with `3600s` as the blocking-expire boundary.

- [ ] **Step 6: Run the final clean-tree gate**

Stop only the processes started for this verification. Run:

```bash
pnpm run format:check
pnpm run lint:strict
pnpm run test:unit
pnpm run typecheck
pnpm run build
git diff --check
git status --short
```

Expected: all commands exit `0`; only intentional feature commits/files exist; `.next`, screenshots, traces, profiles, and temporary evidence are not tracked.
