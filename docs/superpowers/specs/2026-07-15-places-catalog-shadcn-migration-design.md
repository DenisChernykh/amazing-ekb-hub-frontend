# Places Catalog shadcn Migration

## Goal

Migrate the complete public catalog UI surrounding the already-migrated place cards from MUI to the existing Tailwind CSS and shadcn/ui foundation in one pull request. The result must preserve the current catalog appearance, responsive layout, URL-driven behavior, and rendering boundaries while removing MUI from the home-page catalog surface.

## Scope

The migration includes:

- `PlacesCatalog`, including the page container, header, result count, page summary, responsive card grid, empty-state composition, and pagination placement;
- `CatalogControls`, including the search form, category filter buttons, active-category colors, responsive wrapping, and URL navigation behavior;
- `PlacesPagination`, including first, previous, numbered, next, and last controls, compact page ranges, ellipses, disabled edge states, and URL navigation behavior;
- the shadcn `input`, `label`, and `pagination` components, added through the configured CLI into `src/shared/ui`;
- a project-owned shared text-field composition that preserves the useful outlined/floating-label behavior needed by catalog search and the later login migration;
- focused tests for the migrated component markup and the pagination item model;
- the MUI-to-shadcn migration plan entry for the completed public catalog slice.

The migration does not include:

- changes to the canonical catalog URL-state work completed by PR `#78` and clarified by PR `#79`;
- changes to route loading, API requests, DTOs, entity mappers, `PlacesCatalogModel`, control models, pagination models, or existing href builders;
- a new sort control, page-size control, automatic URL replacement, or backend work;
- login, auth-lab, providers, the MUI theme bridge, Emotion, package removal, or unrelated MUI surfaces;
- a visual redesign.

## Architecture and Boundaries

- `src/widgets/places-catalog` remains the server-rendered page composition boundary.
- `src/features/catalog-controls` remains the leaf client feature that owns submit and category-click navigation through `router.push`.
- `src/features/places-pagination` remains the leaf client feature that owns page navigation through `router.push`.
- Existing `currentSearchParams` inputs and pure href builders remain the only navigation source for both features. Neither feature reads raw browser search params.
- The widget continues importing both features and the `PlaceCard` entity through their public APIs.
- New feature-local presentation helpers stay inside their current slice and are not added to public `index.ts` files unless another layer must consume them.
- Shared shadcn source components live in `src/shared/ui` and are exported through its existing public API.
- The field composition is a shared UI contract rather than feature-local label/input markup. This slice implements and tests its neutral state; validation/helper/error extensions remain part of the later login slice.

## Component Design

### `PlacesCatalog`

- Replace MUI `Container`, `Grid`, `Stack`, and `Typography` with semantic HTML and Tailwind classes.
- Keep `<main>` at the current MUI `lg` container width of 1200px, with 16px mobile gutters, 24px larger-screen gutters, 30px/48px responsive top padding, and 64px bottom padding.
- Keep the header stacked on mobile and aligned along the bottom edge from the current `sm` breakpoint.
- Preserve the page-title typography: `clamp(2rem, 1.4rem + 2vw, 3.4rem)`, weight 700, letter-spacing 0, and line-height 1.04.
- Preserve the result count, page summary, copy, muted color, spacing, and no-wrap behavior of the page summary.
- Render the card list as a semantic `<section aria-label="Список мест">` containing a CSS grid.
- Preserve the current one-column, two-column, and three-column layout at the MUI-equivalent 900px and 1200px breakpoints, with 16px mobile and 20px larger gaps.
- Keep the existing filtered/unfiltered empty-state selection and `PlacesCatalogEmpty` composition unchanged.
- Keep pagination after either the populated grid or the empty state.

### `CatalogControls`

- Replace the MUI layout, `TextField`, `Button`, `Chip`, and `Typography` composition with Tailwind and project-owned shared UI.
- Preserve the `<section aria-label="Фильтры каталога">`, search form semantics, visible `Поиск` label, name, default value, placeholder, 100-character maximum, and submit-only application behavior.
- Keep the search input uncontrolled and preserve `buildCatalogControlsInputKey` so server-applied search/category changes remount it predictably.
- Keep the mobile stacked form and the current row layout from 600px, including a full-width input and a submit button with a 128px minimum width on larger screens.
- Compose search through the project-owned shared text field seeded from shadcn `Input` and `Label`. Keep the label visually anchored into the outlined field, retain the placeholder, associate label and input through a stable id, and make a label click focus the input.
- Do not add unused validation/helper/error behavior to this slice; the shared field contract can be extended when login becomes its second stateful consumer.
- Render category filters as real `type="button"` controls with a compact rounded badge/chip appearance, visible keyboard focus, and at least a 32px visual height.
- Keep `Все` first, then backend categories in model order. Preserve `getPlaceCategoryDisplay`, active-category matching by slug, dynamic active background/text colors, bold labels, wrapping, and 8px gaps.
- Keep inactive categories outlined and the active default `Все` state primary-filled.
- Keep `navigate` as the only imperative navigation helper and preserve all existing `buildCatalogControlsHref` transitions.
- If the migrated file would exceed the project component-size limit, extract a feature-private category-filter list without expanding the feature public API.

### `PlacesPagination`

- Replace MUI `Pagination` and layout primitives with the shadcn pagination structure and project-owned Tailwind styling.
- Keep `<nav aria-label="Пагинация мест">`, centered placement, and the current 34px top margin equivalent.
- Preserve the current `pageCount <= 1` null result.
- Preserve first, previous, numbered, next, and last navigation controls and rounded page buttons. The active page uses the primary treatment and exposes `aria-current="page"`.
- Edge controls remain present but disabled at the first and last pages, matching the current MUI behavior.
- Add a small pure feature-local pagination item builder that produces the MUI-equivalent desktop range with one boundary page and one sibling page on each side, inserting ellipses for omitted ranges. It must never emit duplicate pages or adjacent redundant ellipses.
- Page actions continue using `router.push(buildPlacesPaginationHref(...))`; the URL-state contract and client boundary do not change in this migration.
- Controls have explicit Russian accessible labels for first, previous, numbered, next, and last-page actions.
- Below 600px, keep first, previous, current-page, next, and last controls visible while hiding extra numeric siblings and ellipses. At 600px and wider, show the complete compact range from the item builder. This keeps the required navigation affordances and 32px minimum controls without horizontal overflow.

## Data Flow and Error Handling

- `PlacesCatalogModel` remains the single widget input.
- `controls`, `pagination`, `links`, `navigation`, and `results` are consumed exactly as before.
- Search/category changes continue resetting page through the existing controls href helper.
- Pagination continues changing only page through the existing pagination href helper.
- `PlacesCatalogEmpty` remains responsible for filtered and out-of-range empty states; this slice introduces no new error UI.
- The migration adds no effects, network requests, local copies of server data, optimistic state, or client-side error branches.

## Test Strategy

Follow test-driven development:

1. Add failing tests for the desired semantic markup before replacing MUI in each component.
2. Add focused tests for the pure pagination item builder before implementing it.
3. Cover small page counts, first/middle/last pages, large page counts, ellipses, and no duplicates. The pure builder assumes valid-domain input `1 <= page <= pageCount`; the pagination consumer must still preserve MUI boundary behavior for reachable `page > pageCount`, while URL clamping or redirect policy remains outside this migration.
4. Cover the shared text field's label association, placeholder, default value, maximum length, and absence of MUI markup.
5. Cover search input/button markup, category order, active/inactive states, dynamic category colors, and button semantics.
6. Cover catalog title/result/page copy, populated grid semantics, empty-state composition, pagination presence, and the absence of `Mui*` classes in migrated markup.
7. Cover pagination accessible labels, `aria-current`, disabled boundary controls, and generated destinations through the existing href-builder tests plus focused component markup tests.
8. Avoid assertions against generated class ordering or framework-private implementation details.

## Visual Acceptance

Compare the home catalog before and after at representative desktop and mobile widths. Check:

- unfiltered catalog with multiple cards;
- search and active-category states;
- populated first, middle, and last pages;
- filtered empty and out-of-range empty states;
- 1/2/3-column grid transitions near 900px and 1200px;
- search input, submit, category filters, all pagination controls, hover, keyboard focus, active, and disabled states;
- long category labels and enough pages to show ellipses;
- no horizontal overflow at 390px.

Smoke-test `/login` on desktop and mobile as a representative legacy MUI route. Temporary screenshots and browser artifacts must not be committed.

## Migration Plan Update

Record the complete catalog layout, controls, and pagination slice as completed across Phase 3 and Phase 4. Phase 3 keeps login and auth-lab work pending. Phase 4 no longer lists the places catalog layout as pending. The MUI bridge remains because auth routes and root provider/theme wiring still use MUI.

## Verification

Before handing off the implementation, run:

- targeted catalog-controls, pagination, and catalog-widget tests;
- the full unit suite;
- strict ESLint;
- Prettier check;
- TypeScript without emit;
- the production build;
- `git diff --check`;
- desktop/mobile browser checks for `/` and `/login`, including a clean browser console.

The slice is complete when the three catalog UI entry files contain no MUI imports, the home-page catalog remains visually and behaviorally equivalent, the URL-state contracts remain unchanged, all quality gates pass, and unrelated user changes remain untouched.
