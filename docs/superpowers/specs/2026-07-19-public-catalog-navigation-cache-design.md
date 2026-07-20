# Public Catalog Navigation, Infinite Feed, and Cache Design

## Goal

Replace the current search/filter/pagination-oriented public catalog with a
category-first navigation model and make public data cacheable under Next.js
Cache Components.

The resulting experience must:

- render up to eight category cards on `/`;
- expose the complete category list on `/categories`;
- render a server-provided first batch of places on
  `/categories/[categorySlug]`;
- append later batches without replacing the existing grid;
- navigate place cards to `/places/[placeSlug]`;
- preserve the category feed and scroll position during soft
  category → place → back navigation;
- prerender all category and active-place slugs known during `pnpm build`;
- invalidate affected public caches after successful admin mutations through a
  signed backend webhook;
- remove `cache: 'no-store'` from public category, place-list, place-detail, and
  material reads covered by this design.

## Product Scope

### Routes

| Route                        | Responsibility                                                                  |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `/`                          | Up to eight category cards and the primary `Показать все категории` action      |
| `/categories`                | Complete category list                                                          |
| `/categories/[categorySlug]` | Category heading and infinite place feed                                        |
| `/places/[placeSlug]`        | Existing place-detail experience with shared navigation and cached public reads |

Search, filters, query-string pagination, and catalog result counts are removed
from the redesigned public entry flow. They are not retained as hidden or
secondary controls.

### Non-goals

- admin UI changes;
- backend webhook implementation inside the frontend branch;
- durable feed restoration after a hard reload or in a new tab;
- explicit editorial ranking or a backend `featured` flag;
- category-image upload or a category-image API;
- an outbox;
- a redesign of the existing place-detail content;
- PPR personalization, auth, or favorites;
- direct client calls to backend DTOs;
- N+1 detail requests for card imagery.

## Visual Thesis

A white, typographic city catalog with rigid rectangular frames, real
photography where the API supports it, and a controlled uneven rhythm. It must
not use beige page surfaces, gradients, glass effects, soft shadows, pill
navigation, decorative iconography, or rounded card shells.

## Content Plan

1. Global sticky navigation orients the visitor.
2. The home page introduces no more than eight categories.
3. The category index exposes the complete set.
4. A category page presents places through image and title only.
5. A place page preserves its existing information architecture.

## Interaction Thesis

- The header compresses smoothly while remaining visible.
- Card hover changes only the title color.
- The primary action uses a black-to-white wipe transition.
- Infinite-feed loading uses a quiet moving line below the retained cards.

All motion respects `prefers-reduced-motion`.

## Visual System

### Typography

- Use `Onest` through `next/font/google`, which produces self-hosted build
  output rather than runtime Google Fonts requests.
- Use only weights `400`, `500`, and `600`.
- Do not introduce a display typeface.
- Uppercase is reserved for the primary action treatment inherited from the
  approved reference.

### Color

- Page background: white.
- Primary and main text: near-black/black.
- Primary foreground: white.
- Neutral borders and placeholder surfaces: project-owned gray scale.
- Card-title hover: `#c6b09f`, represented by a named design token rather than
  an arbitrary Tailwind value.

The existing teal primary and beige application background are replaced for the
new public catalog surface.

### Tailwind Contract

- New and touched catalog code must not add arbitrary Tailwind values using
  bracket syntax such as `w-[...]`, `bg-[#...]`, or
  `transition-[...]`.
- Use the built-in Tailwind scale when it matches the design.
- Add reusable project values to the Tailwind v4 theme in
  `src/app/globals.css`.
- Express timing curves, header sizes, the hover color, and any non-standard
  layout measurements as named tokens or component CSS classes.
- Do not change the global cascade layer order.

### Primary Action

The `Показать все категории` action:

- is a black rectangle with no border radius;
- uses white uppercase text and Lucide `ArrowRight`;
- uses the approved reference spacing and proportions;
- wipes to a white surface with black text/icon over `400ms` on
  hover and keyboard focus;
- keeps text and icon colors synchronized throughout the transition;
- has a visible keyboard focus treatment.

The taupe card-title hover color is not used as the button hover color.

## Global Header

The shared header is sticky and remains visible at all scroll positions.

- Left: `Стрельчук в Екатеринбурге`, linked to `/`.
- Right: `Категории`, linked to `/categories`.
- No hamburger, icons, pills, blur, glass, or shadow.
- Expanded height: `78px`.
- Compressed height: `58px`.
- On scroll, the brand scales down slightly and a thin bottom border fades in.
- Duration: `360ms` with a named project easing token.
- Reduced motion removes the animated interpolation while preserving the
  expanded/compressed state change.

## Category Cards

Category cards contain only:

1. an image area;
2. the category title.

Rules:

- one outer border;
- no radius or shadow;
- no internal horizontal divider;
- no description, count, badge, arrow, or metadata;
- hover/focus changes the title to the named taupe token;
- the complete card is a link;
- keyboard focus is visible without depending on the title-color change.

The current public category DTO has no image field. A deterministic,
entity-owned placeholder is therefore added by the category mapper, not inside
JSX. The later category-image contract will support transparent PNG artwork
centered with `object-contain`; adding that backend field changes the mapper and
image component, not the card composition.

Layout:

- four columns on a wide desktop;
- two columns below the desktop breakpoint, including mobile;
- up to eight cards on `/`;
- all cards on `/categories`.

## Place Cards and Uneven Grid

Place cards contain only:

1. the public cover image or fallback;
2. the place title.

`PublicPlaceSummary.coverImageUrl` is used directly through the frontend
mapper. A missing or unusable URL falls back to the deterministic
entity-owned placeholder. Real place covers use an `object-cover` crop.

The complete card links to `/places/[placeSlug]`. Summary, tags, category,
material counters, popularity, badges, and descriptions are not rendered.

### Stable Five-Item Module

The feed is divided into stable modules of five API-ordered places:

- the first card in each module is tall;
- the next four cards are regular;
- no random selection or backend priority field is used;
- already-rendered modules never change when another page is appended;
- DOM, keyboard, and API ordering remain aligned;
- `grid-auto-flow: dense` is not used.

Responsive layout:

- three columns on wide desktop;
- two columns on tablet and mobile;
- on two-column layouts, the tall card occupies the height of two regular
  cards;
- grouping remains one tall plus four regular at every breakpoint.

The implementation groups the normalized card models into arrays of five and
renders each group as its own CSS grid. This avoids visual reordering and makes
an incomplete final group predictable.

## Infinite Feed

### Batch Size

- Fixed backend `pageSize`: `20`.
- The first server batch contains four complete five-item modules.
- Every later successful request appends another four modules.
- The final response may contain an incomplete module and renders it without
  synthetic filler cards.

### Server/Client Boundary

The category route is a Server Component. It resolves the category and the
first twenty places, then passes this serializable data to the small
infinite-feed Client Component as:

- `initialItems`;
- `initialPage`;
- `pageSize`;
- `total`;
- `categorySlug`.

The Client Component renders `initialItems` during server prerendering, so the
browser does not request page 1 after hydration.

An `IntersectionObserver` sentinel requests page 2 and later pages from a
same-origin Route Handler:

`GET /api/categories/[categorySlug]/places?page=<number>`

The Route Handler:

- validates and normalizes the slug;
- accepts only a bounded positive integer page;
- fixes page size at `20`;
- resolves the category slug to the backend category id server-side;
- requests the public place list;
- maps API DTOs into the frontend card contract;
- returns no generated backend DTO directly to the browser.

The client:

- allows only one append request at a time;
- appends successful items in response order;
- deduplicates by place id;
- stops when the accumulated count reaches `total` or the response has no new
  items;
- retains all existing items on an append error;
- retries only after an explicit user action.

### Loading Indicator

Normal first load has no grid skeleton. The first batch arrives in the initial
server response for a prerendered or cached category.

Append loading renders a centered, non-textual indicator below the retained
grid:

- a thin neutral track;
- one black segment moving horizontally with a restrained easing;
- a stable reserved height that prevents layout shift;
- an `aria-live="polite"`/status contract with visually hidden Russian loading
  text;
- no visible `Загружаем ещё…` copy;
- reduced motion stops the segment at a clear static position.

## Route States

- Unknown or invalid category slug: `notFound()`.
- Unknown, inactive, or invalid place slug: `notFound()`.
- Empty category: a quiet route-specific message, with no empty card grid.
- Initial route failure: route-level `error.tsx` with retry.
- Append failure: retained cards plus a bottom `Повторить` action.
- End of list: observer and loader are removed silently.
- First on-demand generation of a new slug may use a minimal route fallback;
  prebuilt/cache-hit categories do not paint that fallback.

## FSD Architecture

### App Layer

`src/app` remains route/framework orchestration only:

```text
src/app/
  (home)/page.tsx
  categories/page.tsx
  categories/[categorySlug]/
    page.tsx
    loading.tsx
    error.tsx
    _lib/
    _components/
  places/[placeSlug]/
  api/categories/[categorySlug]/places/route.ts
  api/cache/revalidate/route.ts
```

Responsibilities:

- `page.tsx` reads `params` and delegates to route-private loaders;
- `_lib` validates route input, assembles page models, and owns
  `generateStaticParams` helpers;
- `_components` owns route-private success/error composition;
- Route Handlers validate transport input and delegate mapping/caching to lower
  layers.

### Entity Layer

`entities/category` owns:

- frontend category-card contract;
- public category DTO mapper;
- deterministic image placeholder adapter;
- category card and href helper.

`entities/place` owns:

- frontend place-card contract;
- public summary mapper;
- cover-image fallback;
- place card and href helper;
- cached public place/detail/material data adapters.

Temporary fallback values remain in mappers/adapters and never appear as ad hoc
branches in cards.

### Feature and Widget Layers

- `features/infinite-places` owns append state, observation, deduplication,
  retry, and end detection.
- `widgets/category-grid` composes category cards.
- `widgets/place-feed` composes stable five-item modules and the infinite
  feature.
- `widgets/site-header` owns shared navigation and its scroll state.

Public APIs are expanded only for cross-layer consumers. Feature-private
helpers stay inside the slice.

## Cache Components and Prerendering

Set `cacheComponents: true` in `next.config.ts`. This enables Cache Components,
the associated partial-prerendering model, and Activity-based state
preservation; no separate experimental PPR flag is added.

### Cache Policy

Public category, place-list, place-detail, and material data functions use
`'use cache'`, `cacheLife`, and `cacheTag`.

Default catalog policy:

```text
stale: 60 seconds
revalidate: 300 seconds
expire: 3600 seconds
```

Tags:

- `categories`;
- `category:{categorySlug}`;
- `category-places:{categorySlug}`;
- `place:{placeSlug}`.

Place detail and its public material data share the `place:{placeSlug}` tag so
one domain invalidation refreshes the complete public place page.

Cache tagging lives in reusable server data functions. Route components do not
construct cache-tag strings inline.

### Static Parameters

During `pnpm build`:

- all current category slugs are returned from category
  `generateStaticParams`;
- all active place slugs are returned from place `generateStaticParams`;
- the paginated place API is enumerated with backend page size `100` until
  `total` is reached;
- every returned category page includes its first twenty places.

The backend API must be reachable during production build. An unavailable or
invalid public contract fails the build rather than silently shipping an empty
catalog.

New slugs created after deployment remain allowed. Their first visit renders
them on demand and stores the result for later requests.

### Activity State Preservation

With Cache Components enabled, Next.js uses React Activity during client-side
navigation. Category feed Client Component state, appended pages, DOM state,
and scroll position are preserved when a visitor opens a place and returns with
browser back/forward navigation.

This is a session/navigation optimization only. A hard reload, new tab, or
fresh direct entry starts again from the server-provided first batch. No
`sessionStorage`, global store, or URL serialization is added.

## Signed Revalidation Endpoint

Frontend implements:

`POST /api/cache/revalidate`

### Request Body

```json
{
  "schemaVersion": 1,
  "eventId": "0d088c43-4f7f-4c3b-b51f-1457cc9ef818",
  "occurredAt": "2026-07-19T12:00:00.000Z",
  "scopes": {
    "categories": true,
    "categorySlugs": ["old-slug", "new-slug"],
    "placeSlugs": ["old-place-slug", "new-place-slug"]
  }
}
```

Contract rules:

- `schemaVersion` is exactly `1`;
- `eventId` is a UUID;
- `occurredAt` is an ISO timestamp;
- `scopes` must contain at least one non-empty invalidation target;
- arrays are deduplicated by the sender or receiver;
- slugs must satisfy the public slug contract;
- all scope fields are optional individually;
- the serialized raw request body is at most `65,536` bytes;
- unknown fields or unsupported versions are rejected.

The payload is domain-oriented. Backend does not send Next.js cache-tag names.

The frontend enforces the `65,536`-byte limit before authentication. A declared
larger `Content-Length` is rejected early, but missing, malformed, or dishonest
headers do not bypass streamed byte counting. Deployment proxy limits remain
defense in depth and must be configured at or above this contract limit.

Frontend scope mapping:

| Domain scope                 | Invalidated frontend tags                   |
| ---------------------------- | ------------------------------------------- |
| `categories: true`           | `categories`                                |
| each `categorySlugs[]` value | `category:{slug}`, `category-places:{slug}` |
| each `placeSlugs[]` value    | `place:{slug}`                              |

Old and new slugs/categories are included when a mutation changes routing or
category membership.

### Signature

Headers:

```text
Content-Type: application/json
X-Amazing-Timestamp: <Unix seconds>
X-Amazing-Signature: sha256=<lowercase hex digest>
```

Signature input:

```text
<timestamp>.<exact raw UTF-8 request body>
```

Digest:

```text
HMAC-SHA256(CACHE_REVALIDATION_SECRET, signatureInput)
```

Frontend requirements:

- read and preserve the exact raw request body before JSON parsing;
- reject missing or malformed signature headers;
- reject timestamps outside a five-minute replay window;
- compare digests in constant time;
- validate the JSON body after signature verification;
- never log the shared secret or complete signature;
- treat repeated valid `eventId` deliveries as harmless because tag
  invalidation is idempotent.

Successful validation calls:

```text
revalidateTag(tag, { expire: 0 })
```

for every mapped tag. Immediate expiration is intentional: the next request for
that tag performs a blocking refresh instead of receiving a stale response.

Response contract:

- `204` for accepted invalidation, including a duplicate valid event;
- `400` for an invalid body or unsupported schema version;
- `401` for missing, invalid, or replayed signatures;
- `413` when the raw request body exceeds `65,536` bytes;
- `500` only for an unexpected frontend failure.

## Backend Delivery Dependency

Backend must emit the signed domain-scope event after successful admin
mutations that can change public output.

Required coverage:

- category create, update, and delete;
- place create and update;
- place status changes;
- place cover upload/replacement;
- pinned-material set/clear;
- material create, update, and admin-status changes;
- place-material link, link update, and hide operations.

Mutation delivery rules:

- category mutations include `categories: true` and affected old/new category
  slugs;
- place mutations include affected old/new place slugs and old/new category
  slugs when the card/list can change;
- every serialized event must remain within `65,536` raw bytes;
- if one mutation would exceed the limit, the backend splits it into multiple
  independently valid signed events with stable event ids;
- a frontend `413` is a non-retriable contract violation: the delivery worker
  surfaces it through its failure/observability path instead of retrying the
  same oversized body;
- photo changes include the current place and category slug;
- material/link/pinned changes include all affected place slugs;
- no event is sent when the domain mutation fails;
- webhook delivery failure does not convert an already-committed admin
  mutation into an HTTP failure;
- delivery uses a short timeout, bounded retries with backoff, and structured
  logs containing event id, attempt, result, and status without secrets;
- process loss between commit and delivery is an accepted boundary because the
  frontend TTL is the fallback; no outbox is introduced.

Rollout configuration:

- backend URL and secret are environment variables;
- URL may be absent while frontend support is not deployed, in which case
  delivery is disabled with one explicit startup warning;
- when URL is configured, the shared secret is mandatory and at least 32
  characters;
- frontend and backend secrets must match.

The backend work is tracked in
[`amazing-ekb-hub-backend#132`](https://github.com/DenisChernykh/amazing-ekb-hub-backend/issues/132)
using this contract.

## Error and Freshness Semantics

### Webhook Success

After a successful admin mutation and webhook delivery:

1. the relevant cache entries expire immediately;
2. the next visitor request waits for current backend data;
3. the new response is cached under the same policy.

### Webhook Failure

The TTL remains a fallback:

- after `revalidate: 300`, the first request may receive stale data while
  background revalidation begins;
- subsequent requests receive the refreshed entry when revalidation succeeds;
- `expire: 3600` is the maximum age before a blocking refresh is required;
- backend/API failures may keep stale data available until the expire boundary
  rather than turning every catalog request into an outage.

Suspense controls the visible waiting boundary; it does not cache or invalidate
data.

## Accessibility

- Cards are real links with visible keyboard focus.
- The header has semantic navigation and an accessible name.
- Breadcrumbs use semantic navigation and current-page markup.
- Image `alt` avoids repeating the adjacent card title unnecessarily;
  decorative placeholders are hidden from assistive technology.
- The append loader exposes a visually hidden status.
- Append retry is a real button.
- Hover interactions have focus equivalents.
- Reduced motion removes header interpolation, button wipe movement, and loader
  movement without removing state feedback.
- DOM and visual place order remain identical.

## Testing Strategy

### Unit

- category and place DTO mappers;
- actual cover/fallback selection;
- category and place href helpers;
- stable chunking into five-item modules;
- global append order and id deduplication;
- end detection from `total` and empty/new-item responses;
- retry transition after append failure;
- cache-tag builders and scope-to-tag mapping;
- webhook schema, replay-window, and HMAC validation;
- cache-life/tag declarations where they can be asserted without depending on
  framework internals.

### Route and Component

- `/` renders no more than eight categories and the complete-list action;
- `/categories` renders all category links;
- category page uses the first server batch without a duplicate client page-1
  request;
- unknown/inactive slugs produce 404;
- empty, route error, append loading, append error, retry, and end states;
- same-origin page Route Handler validates page/slug and returns the frontend
  contract;
- revalidation Route Handler returns `204`, `400`, and `401` for the defined
  cases and invokes each exact tag once;
- reduced-motion and loader accessibility markup;
- removed search/filter/pagination controls do not remain in the public catalog
  composition.

### Build and Quality Gates

- `pnpm run format:check`;
- `pnpm run lint:strict`;
- `pnpm run test:unit`;
- `pnpm run typecheck`;
- `pnpm run build` against a reachable backend;
- `git diff --check`.

### Browser Verification

Capture desktop and mobile evidence for:

- home page with eight categories;
- complete category index;
- populated category with real place covers and fallbacks;
- uneven five-item modules at three and two columns;
- empty category;
- append loading, append error/retry, and end state;
- sticky header expanded/compressed;
- category-card hover/focus;
- primary action idle/hover/focus;
- place open and browser-back restoration of appended pages and scroll;
- no horizontal overflow at `390px`;
- no hydration or console errors.

Browser verification distinguishes:

- prebuilt/cache-hit route behavior;
- first on-demand generation of a new slug;
- post-webhook blocking refresh;
- TTL stale-while-revalidate fallback.

## Acceptance Criteria

- Public navigation follows `/` → `/categories` →
  `/categories/[categorySlug]` → `/places/[placeSlug]`.
- The home page renders at most eight category cards.
- The first twenty category places are present in the server response without
  a normal first-load skeleton.
- Later pages append through IntersectionObserver and the approved line loader.
- Place layout repeats one tall plus four regular cards without visual/DOM
  reordering.
- Soft back navigation restores appended items and scroll position.
- All build-known category and active-place slugs prerender successfully.
- New slugs render on first request and become cached.
- Covered public reads no longer use `cache: 'no-store'`.
- Cache tags, TTL, signed invalidation, and failure fallback follow this
  specification.
- No new arbitrary bracket-value Tailwind classes are introduced in touched
  catalog code.
- Desktop/mobile visual checks and all quality gates pass.
