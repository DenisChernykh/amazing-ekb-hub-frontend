# Final MUI Bridge Removal Design

## Goal

Finish the gradual MUI-to-shadcn migration in one coherent pull request by deleting the
internal `auth-lab` routes and removing the now-unused MUI/Emotion runtime bridge.

The resulting frontend keeps the existing Next.js App Router, FSD boundaries, Tailwind
CSS, project-owned shadcn UI components, authentication behavior, typography, and
public routes.

## Scope

The pull request will:

1. Delete `src/app/auth-lab` and its debug-only server actions and UI.
2. Remove `AppRouterCacheProvider` from the root layout.
3. Reduce the root client provider to the application-owned `SessionProvider`.
4. Delete the MUI theme slice under `src/shared/ui/theme`.
5. Remove direct `@mui/*` and `@emotion/*` dependencies and update the lockfile.
6. Remove the obsolete `mui` cascade layer from `src/app/globals.css`.
7. Replace `/auth-lab/*` values used as redirect examples in login tests with valid,
   neutral application paths.
8. Update migration documentation to mark Phase 5 and the overall migration complete.

## Out of Scope

- Redesigning any public page.
- Changing login, logout, session refresh, role, or redirect behavior.
- Replacing Roboto or changing existing typography tokens.
- Removing generic client-provider infrastructure while `SessionProvider` still needs it.
- Broad dependency upgrades unrelated to removing MUI and Emotion.
- Rewriting historical design specifications or implementation plans.

## Architecture

### Root Layout

`src/app/layout.tsx` remains an async Server Component. It continues to:

- load global Tailwind CSS and Roboto;
- read the current session on the server;
- pass the initial session model into the root client provider.

The MUI cache boundary is removed. The body renders the application-owned provider
directly, which matches the App Router pattern of keeping context providers in a small
Client Component while the root layout remains server-rendered.

### Runtime Providers

`src/app/providers.tsx` retains:

- the existing stable session-boundary key;
- `SessionProvider`;
- the current remount behavior after login and logout.

It removes MUI `ThemeProvider`, `CssBaseline`, and the deleted app theme. This is a
structural cleanup only; session data flow does not change.

### Styling

Tailwind and shadcn remain the only application UI styling system. The cascade order
changes from:

`theme, base, mui, components, utilities`

to:

`theme, base, components, utilities`

Roboto and the current CSS variables stay unchanged so bridge removal does not become
a visual redesign.

### Auth Lab Removal

All `/auth-lab`, `/auth-lab/protected`, and `/auth-lab/admin` routes are deleted.
They are internal debug surfaces and have no public navigation contract.

Login tests currently use `/auth-lab/protected` only as a representative safe
`redirectTo` value. Those fixtures will use an existing neutral application route
instead, while retaining the same assertions about hidden input propagation and
server-to-client handoff.

## Dependency Removal

Remove the direct dependencies:

- `@mui/material`;
- `@mui/material-nextjs`;
- `@emotion/cache`;
- `@emotion/react`;
- `@emotion/styled`.

The package manager updates `package.json` and `pnpm-lock.yaml`. No unrelated package
versions should change.

## Error Handling and Compatibility

No production error contract changes. Existing route-level errors, login field errors,
session fallback behavior, and redirects remain intact.

The removal is considered safe only when repository-wide searches find no remaining
MUI/Emotion imports or provider symbols. Historical Markdown may still describe the
bridge as past migration context; the current architecture plan must state the final
state explicitly.

## Verification

Automated checks:

1. Focused tests covering the root session provider and updated login redirect fixtures.
2. `pnpm run format:check`.
3. `pnpm run lint:strict`.
4. `pnpm run test:unit`.
5. `pnpm run typecheck`.
6. `pnpm run build`.
7. `git diff --check`.
8. A repository search proving no runtime MUI/Emotion imports, providers, or direct
   dependencies remain.

Browser checks:

- home page on desktop and mobile;
- production login idle and validation/error states;
- one place detail page;
- console and hydration errors;
- `/auth-lab` returns the expected not-found response.

## Completion Criteria

The slice is complete when `auth-lab` is gone, the MUI/Emotion bridge and direct
dependencies are removed, session behavior is preserved, all quality gates pass, the
representative browser checks show no visual regression, and the migration plan records
the completed target architecture.
