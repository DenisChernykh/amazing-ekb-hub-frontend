# MUI to shadcn/ui Migration Plan

## Goal

Gradually migrate the public frontend UI from Material UI to Tailwind CSS + shadcn/ui without changing the current visual language or rewriting all screens at once.

The target stack is:

- Next.js App Router;
- FSD layers;
- Tailwind CSS as the everyday styling language;
- shadcn/ui source components in `src/shared/ui`;
- MUI kept only as a legacy bridge until no MUI imports remain.

## Guardrails

1. Do not run `shadcn add --all`.
2. Do not remove `ThemeProvider`, `CssBaseline`, Emotion, `AppRouterCacheProvider`, or `@mui/*` while any MUI component remains.
3. New migrated UI must not import MUI.
4. Each migration slice must keep the existing copy, layout intent, colors, radii, focus behavior, and responsive states unless a separate redesign decision exists.
5. Tailwind preflight is enabled globally during the bridge period; keep cascade layer order `theme, base, mui, components, utilities`.
6. For every slice, keep desktop and mobile visual checks for affected states plus representative legacy MUI pages.
7. Repeated loading, empty, error, disabled, focus, and confirmation behavior belongs in shared UI contracts, not local JSX copies.

## Phases

### Phase 0: Foundation

Status: in progress.

- Add Tailwind CSS, shadcn/ui config, PostCSS config, and shared `cn`.
- Add only the first needed shadcn components to `src/shared/ui`.
- Mirror current MUI app-level tokens in `src/app/globals.css`.
- Document the target stack in ADR and architecture docs.
- Ignore generated visual-check output unless selected screenshots are intentionally promoted to docs assets.

Exit criteria:

- `components.json` points shadcn UI to `src/shared/ui`.
- `shadcn` CLI is a dev-only dependency or used through `pnpm dlx`.
- A first low-risk component is migrated and verified.

### Phase 1: Low-risk Shared States

Migrate small, visually bounded states first:

1. `PlacesCatalogEmpty`.
2. Shared route/page `ErrorState`.
3. App-level `loading` surfaces.
4. Other empty/error/loading surfaces that do not require complex form controls.

Exit criteria:

- Empty/error/loading UI uses shared shadcn/Tailwind contracts.
- Tests cover visible copy, semantic landmarks/headings, and action links/buttons.
- Legacy MUI pages still pass representative desktop/mobile visual checks.

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

### Phase 3: Forms and Controls

Status: in progress.

Completed slice:

- `CatalogControls` now uses the project-owned shadcn `TextField`, `Button`, and `Badge` contracts while preserving submit-only search, category colors, canonical URL transitions, and leaf client ownership.
- `PlacesPagination` now uses the shared shadcn pagination composition with a tested compact range, responsive mobile controls, explicit accessible labels, and the existing canonical href transition.

Remaining work:

1. Login form.
2. Auth lab/debug surfaces if they are still useful.

Special rule:

- Do not migrate `TextField` blindly. Preserve useful MUI micro-UX, especially label/helper/error behavior, in project-owned shared input/field contracts.

Exit criteria:

- Form fields have shared validation, helper text, disabled, pending, and focus behavior.
- Client boundaries stay leaf-level.
- Controls preserve URL/state behavior and existing tests.

### Phase 4: High-visibility Pages

Status: completed.

Completed slices:

- The complete public places catalog now uses semantic HTML, Tailwind layout, shared shadcn controls, and the migrated place-card entity slice. Its server/client boundaries, canonical URL behavior, empty states, 600px/900px/1200px responsive layout, and desktop/mobile visual language remain intact.
- Place detail is migrated as the explicitly approved **Archive Spine × Focus Mode** redesign. This is a documented exception to visual parity, not a precedent for silently redesigning other migration slices.
- `src/widgets/place-detail` and `PlaceCategoryBadge` no longer import MUI; the complete publication index, anchors, redirect links, headings, and empty state remain server-rendered.
- Focus preview and platform scrollspy are isolated client enhancements. The page requires no client-side data fetch and keeps usable anchors and material links without JavaScript.
- Literata and Manrope are loaded through `next/font` and scoped to the ready place-detail route. Legacy pages keep the existing Roboto setup.
- MUI/Emotion providers and packages remain in the root bridge because auth and debug surfaces still depend on them.

Exit criteria:

- The catalog and detail pages preserve the existing look unless a redesign ADR exists.
- No MUI imports remain in migrated entity/widget slices.
- Visual checks cover home, filtered empty, login, place detail, desktop and mobile.

### Phase 5: Remove MUI Bridge

Start only when `rg "@mui|@emotion|AppRouterCacheProvider|ThemeProvider|CssBaseline" src package.json` shows no remaining UI dependency need.

- Remove MUI providers from root layout/provider wiring.
- Remove MUI and Emotion packages.
- Delete `src/shared/ui/theme`.
- Remove MUI-specific CSS exceptions from `globals.css`.
- Update stale MUI docs and ADRs as superseded.

Exit criteria:

- No MUI/Emotion imports remain.
- Full quality gates pass.
- The final ADR or changelog states that the bridge period is over.

## Required Checks Per Slice

1. `pnpm exec prettier --check <changed-files>`
2. `pnpm exec tsc --noEmit --pretty false --incremental false`
3. Relevant unit/component tests.
4. Desktop and mobile visual check for affected states.
5. Smoke check for at least one legacy MUI page while MUI bridge is active.
6. `git diff --check`

Use full `pnpm lint:strict`, `pnpm test:unit`, and `pnpm build` before merging larger slices or removing bridge pieces.

## Current First Slice

The first slice is `src/widgets/places-catalog/ui/places-catalog-empty.tsx`.

It validates the foundation because it exercises:

- shared `Button` and `Card`;
- Tailwind token mapping;
- server-rendered UI;
- empty-state semantics;
- action link rendering through the shared button contract.

Do not use this slice as permission for mass conversion. Each next slice should be small enough to review visually and mechanically.

## Completed High-visibility Slice

The place-detail redesign is specified in
`docs/superpowers/specs/2026-07-11-place-detail-archive-focus-design.md` and implemented through the matching execution plan.

Its verification contract includes:

- deterministic material ordering, deduplication, and pinned injection in the entity mapper;
- one pinned row, followed by nonempty platform sections in stable platform order;
- safe same-origin backend redirect links as the only row actions;
- a decorative, non-interactive Focus Stage with reduced-motion support;
- desktop Archive Spine and a one-tap mobile index without the Focus Stage;
- pinned, no-pinned, unavailable-link, placeholder-cover, long-title, empty-platform, and no-material states;
- desktop/mobile checks of the redesigned route plus a legacy catalog smoke check.
