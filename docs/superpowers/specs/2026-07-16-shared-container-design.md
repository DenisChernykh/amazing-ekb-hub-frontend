# Shared Container

## Goal

Add a project-owned `Container` component that gives migrated Tailwind UI a consistent page-width primitive without reproducing the old MUI `Container` dimensions or API. The component should remove repeated centering and horizontal-gutter classes while keeping page-specific vertical spacing local to each consumer.

## Decision

Build `Container` on the standard Tailwind CSS v4 `container` utility:

```tsx
<Container as="main" className="py-8">
  {children}
</Container>
```

Its default layout classes are:

```text
container mx-auto px-4 sm:px-6 lg:px-8
```

The standard `container` utility owns breakpoint-based width and maximum-width behavior. `mx-auto` centers the element, and the responsive padding utilities provide project-wide horizontal gutters. MUI is not a visual or sizing reference for this contract.

## Component Contract

- Add `src/shared/ui/container.tsx` and export `Container` through `src/shared/ui/index.ts`.
- Keep the component server-compatible: no client directive, hooks, effects, or browser APIs.
- Render a `div` by default.
- Support an `as` prop for the semantic elements needed by current page composition: `div`, `main`, and `section`.
- Forward native attributes appropriate to the selected element, including `aria-*`, `data-*`, and `children`.
- Merge caller `className` with the default layout classes through the existing shared `cn` helper.
- Add `data-slot="container"` for stable identification consistent with the shared UI layer.
- Keep vertical spacing, background, grid/flex behavior, and page-specific presentation outside the component.

## Deliberate Omissions

- Do not add MUI-compatible `maxWidth`, `fixed`, `disableGutters`, or `component` props.
- Do not add project-defined width variants in the first version. The standard Tailwind `container` scale is the accepted default.
- Do not customize the global Tailwind `container` utility through `@utility`; the React component owns the project defaults without changing raw Tailwind behavior elsewhere.
- Do not add `w-full`: Tailwind's `container` utility already sets full width before applying breakpoint maximums.
- Do not include vertical padding defaults.

## Initial Adoption

Use the new component where the existing classes represent the general page shell:

- replace the manual outer container in `PlacesCatalog` while preserving its page-specific top and bottom spacing in `className`;
- replace the manual outer containers in the global and home loading states so their shell follows the same width and gutters as the migrated catalog.

Do not migrate `ErrorState` in this slice. Its intentional `max-w-3xl` content width is a narrower content contract, and forcing it through the standard breakpoint container would either change that intent or prematurely require size variants.

Legacy MUI auth routes remain outside this slice.

## Rendering and Error Behavior

`Container` performs no data handling and introduces no runtime error state. It renders the selected semantic element synchronously and passes children and native attributes through unchanged.

## Test Strategy

Add a focused shared UI test that verifies:

- the default element is a `div`;
- `as="main"` and `as="section"` preserve their requested semantics;
- the standard `container`, centering, and responsive gutter classes are present;
- caller `className`, children, and native attributes are forwarded;
- `data-slot="container"` is present.

Update affected catalog and loading tests only where their assertions intentionally cover the replaced outer markup. Avoid testing generated CSS or Tailwind class ordering beyond the component's explicit contract.

## Verification

Run:

- the focused `Container`, catalog, and loading tests;
- Prettier check for changed files;
- strict ESLint;
- TypeScript without emit;
- the full unit suite;
- `git diff --check`.

Because adopting the standard Tailwind container intentionally changes the old fixed MUI-derived width behavior, visually check the home catalog and its loading state at mobile, tablet, and desktop widths. Confirm consistent centering, gutters, and no horizontal overflow; exact MUI parity is not an acceptance criterion.
