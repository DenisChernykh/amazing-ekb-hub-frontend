# Final MUI Bridge Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Delete the internal auth lab and finish the frontend migration by removing every runtime MUI/Emotion bridge, direct dependency, and active-policy reference in one pull request.

**Architecture:** Keep `src/app/layout.tsx` as the async Server Component that loads global CSS and the server session. Keep `src/app/providers.tsx` as the smallest possible Client Component around the application-owned `SessionProvider`; remove MUI cache, theme, baseline, theme files, and CSS compatibility rules.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Vitest, pnpm.

## Global Constraints

- Do not redesign public pages or change the current Roboto typography tokens.
- Do not change login, logout, session refresh, role, or redirect behavior.
- Delete every route below `src/app/auth-lab`.
- Remove only direct MUI/Emotion dependencies; do not perform unrelated dependency upgrades.
- Keep `SessionProvider` and its existing stable remount key.
- Historical specs and plans remain historical; update only current architecture and policy documents.
- The local untracked `.superpowers/` directory must not be staged or changed.

---

## File Structure

- `src/app/mui-bridge-removal.test.ts`: repository-level completion contract for the deleted route, runtime bridge, CSS exception, and direct dependencies.
- `src/app/layout.tsx`: server root layout without `AppRouterCacheProvider`.
- `src/app/providers.tsx`: client session boundary without MUI theme or baseline.
- `src/app/globals.css`: Tailwind/shadcn cascade without the `mui` layer or `.MuiInputBase-input` compatibility rule.
- `src/app/auth-lab/**`: deleted internal debug route tree.
- `src/shared/ui/theme/**`: deleted MUI theme and its public API.
- `src/app/login/_components/login-page-content.test.tsx`: valid neutral redirect fixture.
- `src/features/auth-login/ui/login-form-fields.test.tsx`: valid neutral redirect fixture.
- `package.json`, `pnpm-lock.yaml`: direct MUI/Emotion dependency removal.
- `docs/architecture/mui-to-shadcn-migration-plan.md`: completed migration state and final verification contract.
- `docs/adr/ADR-0004-material-ui.md`: superseded status.
- `docs/adr/ADR-0006-tailwind-shadcn-ui-migration.md`: final outcome.
- `AGENTS.md`: current policy prohibiting MUI reintroduction and removing bridge-only instructions.

---

### Task 1: Remove the auth lab and runtime bridge

**Files:**

- Create: `src/app/mui-bridge-removal.test.ts`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/providers.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/login/_components/login-page-content.test.tsx`
- Modify: `src/features/auth-login/ui/login-form-fields.test.tsx`
- Delete: `src/app/auth-lab/_components/auth-lab-client-panel.tsx`
- Delete: `src/app/auth-lab/_components/auth-lab-page-content.tsx`
- Delete: `src/app/auth-lab/_lib/logout-auth-lab-action.ts`
- Delete: `src/app/auth-lab/admin/page.tsx`
- Delete: `src/app/auth-lab/layout.tsx`
- Delete: `src/app/auth-lab/page.tsx`
- Delete: `src/app/auth-lab/protected/page.tsx`
- Delete: `src/shared/ui/theme/app-theme.ts`
- Delete: `src/shared/ui/theme/index.ts`

**Interfaces:**

- Consumes: `SessionProvider` and `SessionState` from `@/entities/session`.
- Produces: `Providers({ children, initialSession })` with unchanged public props and session remount behavior.

- [ ] **Step 1: Write the failing runtime-removal contract**

Create `src/app/mui-bridge-removal.test.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const readProjectFile = (path: string): string =>
  readFileSync(resolve(process.cwd(), path), 'utf8');

describe('completed MUI bridge removal', () => {
  it('has no auth-lab route or runtime MUI bridge', () => {
    expect(existsSync(resolve(process.cwd(), 'src/app/auth-lab/page.tsx'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/shared/ui/theme/index.ts'))).toBe(false);

    const runtimeSource = [
      readProjectFile('src/app/layout.tsx'),
      readProjectFile('src/app/providers.tsx'),
    ].join('\n');
    const globalCss = readProjectFile('src/app/globals.css');

    expect(runtimeSource).not.toMatch(
      /@mui|@emotion|AppRouterCacheProvider|ThemeProvider|CssBaseline/,
    );
    expect(globalCss).not.toContain('@layer theme, base, mui, components, utilities;');
    expect(globalCss).not.toContain('.MuiInputBase-input');
  });
});
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run:

```bash
pnpm exec vitest run src/app/mui-bridge-removal.test.ts
```

Expected: FAIL because `src/app/auth-lab` and `src/shared/ui/theme` still exist and the
root runtime still contains MUI providers.

- [ ] **Step 3: Remove the MUI wrappers while preserving the session boundary**

Replace the body of `src/app/layout.tsx` with the same server-side session flow and no
MUI cache provider:

```tsx
import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import { Providers } from './providers';

import { getCurrentSession } from '@/entities/session/server';
import './globals.css';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-roboto',
});

export const metadata: Metadata = {
  title: 'Стрельчук в Екатеринбурге',
  description: 'Удобный навигатор по моим обзорам',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSession = await getCurrentSession();

  return (
    <html lang="ru" className={roboto.variable}>
      <body>
        <Providers initialSession={initialSession}>{children}</Providers>
      </body>
    </html>
  );
}
```

Reduce `src/app/providers.tsx` to:

```tsx
'use client';

import { SessionProvider, type SessionState } from '@/entities/session';

interface ProvidersProps {
  initialSession: SessionState;
  children: React.ReactNode;
}

function getSessionBoundaryKey(session: SessionState): string {
  if (session.status === 'anonymous') {
    return 'anonymous';
  }

  return `${session.user.id}:${session.user.role}`;
}

export function Providers({ children, initialSession }: Readonly<ProvidersProps>) {
  return (
    <SessionProvider key={getSessionBoundaryKey(initialSession)} initialSession={initialSession}>
      {children}
    </SessionProvider>
  );
}
```

Keep the existing JSDoc comments around `getSessionBoundaryKey` and `Providers`; only
replace the JSX and imports.

- [ ] **Step 4: Delete the debug route and MUI theme**

Delete all files listed under `src/app/auth-lab/**` and `src/shared/ui/theme/**` using
`apply_patch` delete hunks. Do not remove any authentication entity, server action, or
session code outside the auth-lab route.

- [ ] **Step 5: Remove the bridge-only CSS**

In `src/app/globals.css`, change:

```css
@layer theme, base, mui, components, utilities;
```

to:

```css
@layer theme, base, components, utilities;
```

Delete only this compatibility block:

```css
.MuiInputBase-input {
  box-sizing: content-box;
}
```

- [ ] **Step 6: Replace deleted-route test fixtures**

In both login test files, replace `/auth-lab/protected` with
`/places/example-place`. Preserve the existing assertions for `redirectTo` propagation:

```tsx
createElement(LoginPageContent, { redirectTo: '/places/example-place' });
```

```ts
expect(html).toContain('data-redirect-to="/places/example-place"');
```

and:

```tsx
createElement(LoginFormFields, {
  redirectTo: '/places/example-place',
  state: VALIDATION_STATE,
});
```

```ts
expect(html).toContain('value="/places/example-place"');
```

- [ ] **Step 7: Run the focused tests**

Run:

```bash
pnpm exec vitest run \
  src/app/mui-bridge-removal.test.ts \
  src/app/login/_components/login-page-content.test.tsx \
  src/features/auth-login/ui/login-form-fields.test.tsx
```

Expected: 3 test files pass with no warnings.

- [ ] **Step 8: Verify the source boundary and commit**

Run:

```bash
rg -n "@mui|@emotion|AppRouterCacheProvider|ThemeProvider|CssBaseline|MuiInputBase" \
  src --glob '!src/app/mui-bridge-removal.test.ts'
git diff --check
```

Expected: `rg` returns no matches and `git diff --check` exits successfully.

Commit:

```bash
git add src/app src/features/auth-login src/shared/ui/theme
git commit -m "refactor(ui): remove final MUI runtime bridge"
```

---

### Task 2: Remove direct MUI and Emotion dependencies

**Files:**

- Modify: `src/app/mui-bridge-removal.test.ts`
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`

**Interfaces:**

- Consumes: pnpm dependency graph from `package.json` and `pnpm-lock.yaml`.
- Produces: an install graph with no direct `@mui/*` or `@emotion/*` dependencies.

- [ ] **Step 1: Add the failing direct-dependency contract**

Add this test to `src/app/mui-bridge-removal.test.ts`:

```ts
it('has no direct MUI or Emotion dependencies', () => {
  const packageJson = JSON.parse(readProjectFile('package.json')) as {
    dependencies?: Record<string, string>;
  };
  const dependencies = packageJson.dependencies ?? {};

  for (const dependency of [
    '@emotion/cache',
    '@emotion/react',
    '@emotion/styled',
    '@mui/material',
    '@mui/material-nextjs',
  ]) {
    expect(dependencies).not.toHaveProperty(dependency);
  }
});
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run:

```bash
pnpm exec vitest run src/app/mui-bridge-removal.test.ts
```

Expected: FAIL because the five direct dependencies are still present.

- [ ] **Step 3: Remove only the direct bridge dependencies**

Run:

```bash
pnpm remove \
  @emotion/cache \
  @emotion/react \
  @emotion/styled \
  @mui/material \
  @mui/material-nextjs
```

Expected: `package.json` and `pnpm-lock.yaml` change; no unrelated dependency is
intentionally upgraded.

- [ ] **Step 4: Re-run the dependency contract**

Run:

```bash
pnpm exec vitest run src/app/mui-bridge-removal.test.ts
```

Expected: both tests pass.

- [ ] **Step 5: Inspect the dependency diff and commit**

Run:

```bash
git diff -- package.json pnpm-lock.yaml
pnpm why @mui/material
pnpm why @emotion/react
git diff --check
```

Expected: the manifest removes exactly five direct dependencies; `pnpm why` reports no
application dependency path requiring MUI or Emotion.

Commit:

```bash
git add package.json pnpm-lock.yaml src/app/mui-bridge-removal.test.ts
git commit -m "chore(deps): remove MUI and Emotion"
```

---

### Task 3: Record the completed migration in active documentation

**Files:**

- Modify: `docs/architecture/mui-to-shadcn-migration-plan.md`
- Modify: `docs/adr/ADR-0004-material-ui.md`
- Modify: `docs/adr/ADR-0006-tailwind-shadcn-ui-migration.md`
- Modify: `AGENTS.md`

**Interfaces:**

- Consumes: verified final source and dependency state from Tasks 1 and 2.
- Produces: current architecture guidance that treats Tailwind/shadcn as the only UI
  foundation and prevents MUI reintroduction.

- [ ] **Step 1: Update the migration plan**

Apply these content changes to
`docs/architecture/mui-to-shadcn-migration-plan.md`:

- change Phase 0 and Phase 2 statuses to `completed`;
- remove the Phase 3 `Remaining work` entry for auth lab;
- mark Phase 3 and Phase 5 as `completed`;
- replace Phase 5 future-tense instructions with the completed outcomes:
  auth-lab deleted, providers removed, theme deleted, dependencies removed, CSS bridge
  removed;
- add a final-state note that `SessionProvider` remains application infrastructure and
  does not require a general theme provider;
- retain the historical completed-slice descriptions and verification commands.

- [ ] **Step 2: Supersede the MUI ADR and record the final outcome**

In `docs/adr/ADR-0004-material-ui.md`, set:

```md
## Status

Superseded by [ADR-0006](./ADR-0006-tailwind-shadcn-ui-migration.md).
```

Preserve the rest as historical context.

Append to `docs/adr/ADR-0006-tailwind-shadcn-ui-migration.md`:

```md
## Final Outcome

The bridge period ended after the production login migration. The internal auth lab was
deleted, the root MUI/Emotion providers and theme were removed, and the direct MUI and
Emotion dependencies were uninstalled. Tailwind CSS and project-owned shadcn components
are now the only application UI foundation; `SessionProvider` remains as an
application-owned client context boundary.
```

- [ ] **Step 3: Update current contributor policy**

In `AGENTS.md`:

- state that the MUI migration is complete;
- replace the legacy-bridge instruction with a rule not to add MUI/Emotion back without
  a new ADR;
- remove the section describing how to write new legacy MUI components;
- remove bridge-only Tailwind rules about retaining providers and legacy MUI visual
  smoke pages;
- keep FSD, shadcn CLI, shared UI ownership, accessibility states, component-size, and
  Git rules unchanged.

- [ ] **Step 4: Verify current docs and commit**

Run:

```bash
pnpm exec prettier --check \
  AGENTS.md \
  docs/architecture/mui-to-shadcn-migration-plan.md \
  docs/adr/ADR-0004-material-ui.md \
  docs/adr/ADR-0006-tailwind-shadcn-ui-migration.md
rg -n "Status: in progress|Auth lab/debug surfaces if they are still useful" \
  docs/architecture/mui-to-shadcn-migration-plan.md
git diff --check
```

Expected: Prettier passes, the stale migration-status search returns no matches, and the
diff check passes.

Commit:

```bash
git add \
  AGENTS.md \
  docs/architecture/mui-to-shadcn-migration-plan.md \
  docs/adr/ADR-0004-material-ui.md \
  docs/adr/ADR-0006-tailwind-shadcn-ui-migration.md
git commit -m "docs(ui): complete shadcn migration"
```

---

### Task 4: Run full automated and browser verification

**Files:**

- Modify only if verification exposes a regression in the files already in scope.
- Save temporary browser screenshots outside tracked source unless intentionally promoted
  as documentation evidence.

**Interfaces:**

- Consumes: completed source, dependency, and documentation tasks.
- Produces: fresh evidence that the final bridge removal is releasable.

- [ ] **Step 1: Prove the repository runtime is free of MUI and Emotion**

Run:

```bash
rg -n \
  "@mui|@emotion|AppRouterCacheProvider|ThemeProvider|CssBaseline|MuiInputBase" \
  src package.json --glob '!src/app/mui-bridge-removal.test.ts'
test ! -f src/app/auth-lab/page.tsx
```

Expected: both commands return no matches.

- [ ] **Step 2: Run all quality gates**

Run each command separately and require exit code 0:

```bash
pnpm run format:check
pnpm run lint:strict
pnpm run test:unit
pnpm run typecheck
pnpm run build
git diff --check
```

Expected: every command passes with zero warnings treated as errors, zero failed tests,
and a successful production build.

- [ ] **Step 3: Start the real local runtime**

Start the frontend using the repository script:

```bash
pnpm run dev
```

Use the configured backend/runtime environment already used by the project. Do not
replace API responses with UI-only mocks for this verification.

- [ ] **Step 4: Check representative browser routes**

With Playwright, verify at desktop and mobile widths:

- `/` renders the catalog/home surface;
- `/login` renders idle state and invalid credentials produce the existing visible and
  accessible error treatment;
- one available `/places/[placeId]` route renders the detail page;
- `/auth-lab` renders Next.js not-found;
- browser console contains no hydration, missing-style, or runtime provider errors.

Capture temporary screenshots for home and login at both widths and compare them with
the immediately previous migration evidence where available.

- [ ] **Step 5: Review the complete branch diff**

Run:

```bash
git status --short
git diff origin/stage...HEAD --stat
git diff origin/stage...HEAD -- \
  src package.json pnpm-lock.yaml AGENTS.md docs/architecture docs/adr
```

Expected: only the approved migration scope and the untracked local `.superpowers/`
directory are present.

- [ ] **Step 6: Commit verification-only fixes if necessary**

If verification required an in-scope correction, repeat the affected focused test and
all full gates, then commit:

```bash
git add \
  src/app/layout.tsx \
  src/app/providers.tsx \
  src/app/globals.css \
  src/app/mui-bridge-removal.test.ts \
  src/app/login/_components/login-page-content.test.tsx \
  src/features/auth-login/ui/login-form-fields.test.tsx
git commit -m "fix(ui): close MUI removal regressions"
```

Stage only the files that actually changed. If no correction was needed, do not create
an empty commit.

## Final Handoff

Report:

- deleted auth-lab routes;
- simplified root session provider;
- deleted theme and bridge CSS;
- removed five direct dependencies;
- updated active architecture policy;
- exact automated test/build counts;
- browser routes and viewport states checked;
- confirmation that `.superpowers/` stayed untracked.
