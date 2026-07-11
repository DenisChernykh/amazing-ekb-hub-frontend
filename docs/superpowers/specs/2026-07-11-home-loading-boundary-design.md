# Home Loading Boundary Design

## Goal

Return the catalog-shaped loading skeleton on `/` without showing catalog UI while unrelated routes load.

## Decision

Keep `src/app/loading.tsx` as the generic fallback for the whole application. Move the home page route entry to the URL-neutral `(home)` route group and add `src/app/(home)/loading.tsx` with the previously approved catalog skeleton.

The `(home)` directory does not change the public URL. Its loading boundary is closer to the home page than the root boundary, so the catalog skeleton handles suspension on `/`, while `/login`, `/places/[placeId]`, and `auth-lab` continue to use the generic root fallback.

## Scope

- Move only the home `page.tsx` route entry into `(home)`.
- Keep existing home `_lib` and `_components` files in place to avoid an unrelated refactor.
- Restore the catalog-shaped shadcn/Tailwind skeleton without MUI imports.
- Preserve the generic root loading contract.
- Add focused tests for both loading surfaces.
- Verify desktop and mobile route behavior.

## Non-goals

- Migrating the catalog itself from MUI.
- Changing home page data fetching.
- Redesigning either loading state.
- Adding a permanent artificial loading delay.
