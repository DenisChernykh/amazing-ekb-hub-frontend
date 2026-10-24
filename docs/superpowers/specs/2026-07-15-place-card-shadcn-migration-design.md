# Place Card shadcn Migration

## Goal

Migrate the complete reusable place-card entity slice from MUI to the existing shadcn/Tailwind foundation in one pull request. The result must preserve the current catalog appearance and behavior while removing MUI and the client boundary from `PlaceCard`, `PlaceCardImage`, and `PlaceCardBadges`.

## Scope

The migration includes:

- `PlaceCardBadges`, including its server-rendered regression tests;
- `PlaceCard`, including its card surface, image link, title link, content layout, hover, focus, and reduced-motion states;
- `PlaceCardImage`, including the 4:3 media frame, local placeholder, lazy image, image motion, and category badge overlay;
- the MUI-to-shadcn migration plan entry for the completed place-card entity slice.

The migration does not include:

- `PlacesCatalog`, `CatalogControls`, or `PlacesPagination`;
- catalog URL-state work tracked by issue `#76`;
- forms, login UI, route layouts, providers, the MUI theme bridge, Emotion, or package removal;
- changes to place DTOs, models, mappers, href builders, public APIs, dependencies, or `components.json`;
- a visual redesign.

## Component Design

### `PlaceCard`

- Remove `'use client'`, MUI imports, and the legacy theme-token import.
- Compose the card from the existing shared `Card` and `CardContent` exports plus `next/link`.
- Keep the card as a full-height vertical flex surface with an 8px radius, one-pixel border treatment, no outer vertical padding, and no gap between media and content.
- Reuse the existing global card shadow tokens: `--shadow-app-card`, `--shadow-app-card-hover`, and `--shadow-app-card-focus`.
- Preserve the current 180ms lift and shadow transition, the `-4px` hover/focus-within lift, the primary-tinted border on hover/focus, and the stronger card focus shadow.
- Keep the image and title as two separate links to the same `buildPlaceHref(place.id)` destination. Platform badges remain separate links, so no anchors are nested.
- Give both place links a visible shared focus treatment. Card-level `focus-within` styling supplements the focused link instead of replacing it.
- Keep the content area at a minimum height of 112px with 14px padding and a 10px vertical gap.
- Preserve the title as a two-line-clamped text block with `clamp(1.05rem, 0.9rem + 0.45vw, 1.28rem)`, weight 700, and line-height 1.18.
- Preserve reduced-motion behavior by removing card and image transitions and image scaling when `prefers-reduced-motion: reduce` is active.

### `PlaceCardImage`

- Replace the MUI media primitives with a relative Tailwind frame and `next/image`.
- Keep a full-width 4:3 frame with clipped overflow and the existing muted image-placeholder color.
- Use `fill`, `object-cover`, `loading="lazy"`, and `unoptimized`. The positioned frame is the containing block required by `fill`; `unoptimized` preserves the current same-origin image delivery contract.
- Keep `src?.trim()` fallback semantics and the existing local placeholder `/images/places/place-placeholder.webp`.
- Preserve the current alt text: `Фото места ${title}`.
- Keep the 260ms image transform and the `1.035` scale driven by card hover or focus-within.
- Keep `PlaceCategoryBadge` in the top-left at 12px with the existing overlay shadow equivalent: `0 8px 20px rgb(15 23 42 / 14%)`.

### `PlaceCardBadges`

- Keep the accepted shared `Badge` implementation local to the place-card slice.
- Render non-zero platform counters as `next/link` anchors through the Badge `render` prop.
- Preserve hrefs, platform order, dynamic colors, 24px badge height, 18px count circle, 72% white overlay, current typography, wrapping, 6px gap, 28px minimum group height, hover feedback, and shared focus ring.
- Keep zero counters hidden and keep an empty semantic group when every count is zero.
- Do not introduce `PlacePlatformBadge` or expand `src/entities/place/index.ts`.

## Data and Rendering Boundaries

- `PlaceCardModel` and all API-to-UI mapping remain unchanged.
- Existing `buildPlaceHref` and `buildPlaceMaterialsHref` helpers remain the only URL builders used by the card.
- All card markup is server-renderable; this slice adds no state, effects, event handlers, or client-side data fetching.
- The image link, title link, and platform links remain independently keyboard reachable.
- Runtime handling of a valid-looking image URL that later fails to load is unchanged and remains outside this migration.

## Migration Plan Update

Expand Phase 2 from the already-recorded platform/count badge slice to the complete place-card entity slice. Record `PlaceCard`, `PlaceCardImage`, and `PlaceCardBadges` as completed together, and remove `Place cards` from the remaining Phase 4 list. Phase 4 continues to own only the high-visibility catalog layout and other page-level composition.

## Tests

Follow test-driven development:

1. Keep the new `place-card-badges.test.ts` server-render tests and run them red before finalizing the badge implementation.
2. Add `place-card.test.ts` with static server rendering before migrating `PlaceCard` and `PlaceCardImage`.
3. Cover the real-image and placeholder branches, place image/title hrefs, platform hrefs, title and alt copy, category and platform badges, lazy image markup, shared `data-slot` markers, and the absence of `Mui*` classes.
4. Verify that links are separate anchors and never nested.
5. Avoid asserting framework-private class ordering or generated Next.js internals that are not part of the user-visible contract.

## Visual Acceptance

Compare the home catalog before and after at representative desktop and mobile widths. Check:

- real cover and placeholder cards;
- short and two-line titles;
- multiple platform badges and the all-zero badge state;
- card hover, image scale, image-link focus, title-link focus, and platform-link focus;
- reduced-motion behavior;
- consistent card heights and wrapping within the existing catalog grid.

Smoke-test `/login` on desktop and mobile as a representative legacy MUI route. Temporary screenshots and browser artifacts must not be committed.

## Verification

Before handing off the pull request, run:

- targeted place-card tests;
- the full unit suite;
- strict ESLint;
- Prettier check;
- TypeScript without emit;
- the production build;
- `git diff --check`;
- desktop/mobile browser checks for `/` and `/login`, including a clean browser console.

The slice is complete when the three place-card UI files contain no MUI imports or client directives, all checks pass, the catalog remains visually equivalent, and unrelated user changes remain untouched.
