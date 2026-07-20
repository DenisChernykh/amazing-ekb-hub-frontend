# MUI to shadcn/ui Migration Plan

## Goal

Record the completed migration of the public frontend UI from Material UI to Tailwind CSS + shadcn/ui.

The target stack is:

- Next.js App Router;
- FSD layers;
- Tailwind CSS as the everyday styling language;
- shadcn/ui source components in `src/shared/ui`;
- application-owned runtime providers without a UI toolkit bridge.

## Guardrails

1. Do not run `shadcn add --all`.
2. Do not reintroduce MUI, Emotion, or their provider/theme infrastructure without a new ADR.
3. UI imports shared shadcn components and Tailwind contracts instead of a parallel toolkit.
4. UI changes keep the existing copy, layout intent, colors, radii, focus behavior, and responsive states unless a separate redesign decision exists.
5. Tailwind preflight is enabled globally; keep cascade layer order `theme, base, components, utilities`.
6. For visible UI changes, keep desktop and mobile visual checks for affected states.
7. Repeated loading, empty, error, disabled, focus, and confirmation behavior belongs in shared UI contracts, not local JSX copies.

## Phases

### Phase 0: Foundation

Status: completed.

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

Status: completed.

The migration began with small, visually bounded states:

1. `PlacesCatalogEmpty` (historical first slice, later removed with the query-driven catalog).
2. Shared route/page `ErrorState`.
3. App-level `loading` surfaces.
4. Other empty/error/loading surfaces that do not require complex form controls.

The current category-first catalog keeps its empty category message in the
route composition and does not restore the deleted `PlacesCatalogEmpty` widget.

Exit criteria:

- Empty/error/loading UI uses shared shadcn/Tailwind contracts.
- Tests cover visible copy, semantic landmarks/headings, and action links/buttons.
- Legacy MUI pages still pass representative desktop/mobile visual checks.

### Phase 2: Display Primitives and Entity Cards

Status: completed.

Migrate reusable display components:

1. Category badges/chips.
2. Material metadata badges.
3. Platform counters.
4. Reusable entity cards built on stable shared primitives.

Historical completed slice:

- The original migrated place-card slice used `PlaceCard`, `PlaceCardImage`, and
  `PlaceCardBadges` with shared shadcn `Card` and `Badge` contracts.
- The later category-first redesign removed `PlaceCardBadges`, platform links,
  counters, and metadata from catalog cards. The current reusable `PlaceCard`
  renders only its image and title as one server-renderable link.

Exit criteria:

- New `Badge`, `Card`, and related shared components cover the repeated display patterns.
- Domain components import shared UI through public APIs.
- No domain slice owns duplicated badge/card styling that should be shared.

### Phase 3: Forms and Controls

Status: completed.

Historical completed slices:

- `CatalogControls` was migrated to the project-owned shadcn `TextField`,
  `Button`, and `Badge` contracts before the query-driven catalog was removed.
- `PlacesPagination` was migrated to the shared shadcn pagination composition
  before numbered public pagination was removed.
- Production login now uses the shared shadcn `Field`, `Input`, `Alert`, and `Button` contracts while preserving the existing server action, credential safety, validation, and redirect flow.
- Login uses the explicitly approved editorial desktop/form-first mobile redesign. Field errors combine visible text, invalid styling, and explicit accessible associations; pending submit keeps the stable `Войти` label and adds a reduced-motion-safe spinner.

The current public flow is category-first. `features/infinite-places` owns the
append state, observer, loader, and retry action for category feeds; no search
controls or numbered pagination remain in the public catalog.

Special rule:

- Do not migrate `TextField` blindly. Preserve useful MUI micro-UX, especially label/helper/error behavior, in project-owned shared input/field contracts.

Exit criteria:

- Form fields have shared validation, helper text, disabled, pending, and focus behavior.
- Client boundaries stay leaf-level.
- Controls preserve URL/state behavior and existing tests.

### Phase 4: High-visibility Pages

Status: completed.

Completed slices:

- The current public catalog is category-first: `/` previews categories,
  `/categories` lists all categories, and `/categories/[categorySlug]`
  server-renders the first place batch before the client appends later pages.
  Category and place cards contain only image and title.
- Place detail is migrated as the explicitly approved **Archive Spine × Focus Mode** redesign. This is a documented exception to visual parity, not a precedent for silently redesigning other migration slices.
- `src/widgets/place-detail` and `PlaceCategoryBadge` no longer import MUI; the complete publication index, anchors, redirect links, headings, and empty state remain server-rendered.
- Focus preview and platform scrollspy are isolated client enhancements. The page requires no client-side data fetch and keeps usable anchors and material links without JavaScript.
- Onest is the global public-catalog font. Literata and Manrope remain loaded
  through `next/font` and scoped to the ready place-detail route.
- Before its later removal under issue #88, the production login and public routes used the same Tailwind/shadcn foundation without a root UI toolkit bridge.

Exit criteria:

- The category-first catalog follows its approved catalog design specification;
  other migrated pages preserve their existing look unless a redesign ADR exists.
- No MUI imports remain in migrated entity/widget slices.
- Visual checks cover the active home, filtered-empty, and place-detail routes on desktop and mobile.

### Phase 5: Remove MUI Bridge

Status: completed.

Completed outcomes:

- The internal `auth-lab` debug routes were deleted.
- `AppRouterCacheProvider`, MUI `ThemeProvider`, and `CssBaseline` were removed from root wiring.
- The later auth/session cleanup removed the unused root `SessionProvider` and `/login` route; generated auth API artifacts remain backend-contract snapshots.
- Direct MUI and Emotion dependencies and `src/shared/ui/theme` were removed.
- The `mui` cascade layer and MUI-specific CSS exception were removed from `globals.css`.
- ADR-0004 was superseded and current contributor guidance records the final stack.

Exit criteria:

- No MUI/Emotion imports remain.
- Full quality gates pass.
- The final ADR or changelog states that the bridge period is over.

## Required Checks Per Slice

1. `pnpm exec prettier --check <changed-files>`
2. `pnpm exec tsc --noEmit --pretty false --incremental false`
3. Relevant unit/component tests.
4. Desktop and mobile visual check for affected states.
5. Smoke check for representative public and authenticated routes.
6. `git diff --check`

Use full `pnpm lint:strict`, `pnpm test:unit`, and `pnpm build` before merging larger slices or removing bridge pieces.

## Historical Initial Slice

The first migration slice was
`src/widgets/places-catalog/ui/places-catalog-empty.tsx`. The category-first
catalog later deleted that widget together with the old query catalog.

At the time, it validated the foundation because it exercised:

- shared `Button` and `Card`;
- Tailwind token mapping;
- server-rendered UI;
- empty-state semantics;
- action link rendering through the shared button contract.

The historical slice should not be reintroduced as a current architecture
reference. New empty states follow the owning route or shared UI contract and
remain small enough to review visually and mechanically.

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
- desktop/mobile checks of the redesigned route plus a catalog smoke check.
