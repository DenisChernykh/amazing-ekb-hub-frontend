# ADR-0006: Tailwind CSS and shadcn/ui Migration

## Status

Accepted

## Context

Frontend started as a Material UI application. The migration was performed gradually to preserve behavior and the current visual language while reusable UI moved to Tailwind CSS and project-owned shadcn components.

## Decision

Use Next.js App Router + FSD + Tailwind CSS + shadcn/ui as the application UI stack. Material UI and Emotion are not part of the active frontend architecture.

## Consequences

1. shadcn/ui components are added through the CLI and live in `src/shared/ui`.
2. Tailwind CSS variables preserve the established app-level visual tokens until a separate redesign decision changes them.
3. MUI providers, Emotion, and MUI components are absent from the runtime and direct dependency graph.
4. New shared UI behavior should be encoded in project-owned components, not repeated in feature-level JSX or long prose instructions.
5. Visible UI changes keep desktop and mobile visual checks for affected states.
6. Tailwind preflight is enabled globally with the explicit cascade layer order `theme, base, components, utilities`.

## Migration Plan

The step-by-step migration plan lives in `docs/architecture/mui-to-shadcn-migration-plan.md`.

## Final Outcome

The bridge period ended after the production login migration. The internal auth lab was
deleted, the root MUI/Emotion providers and theme were removed, and the direct MUI and
Emotion dependencies were uninstalled. Tailwind CSS and project-owned shadcn components
are now the only application UI foundation; `SessionProvider` remains as an
application-owned client context boundary.
