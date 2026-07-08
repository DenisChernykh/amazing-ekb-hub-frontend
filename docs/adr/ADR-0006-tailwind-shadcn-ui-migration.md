# ADR-0006: Tailwind CSS and shadcn/ui Migration

## Status

Accepted

## Context

Frontend started as a Material UI application and still uses MUI as the active toolkit in most routes. We want to migrate gradually without breaking the current visual language or rewriting all screens at once.

## Decision

Use Next.js App Router + FSD + Tailwind CSS + shadcn/ui as the target UI stack for new and migrated UI. Treat Material UI as a legacy bridge until all MUI imports are removed.

## Consequences

1. shadcn/ui components are added through the CLI and live in `src/shared/ui`.
2. Tailwind CSS variables mirror the current app-level MUI visual tokens before any visual redesign.
3. MUI providers, Emotion, and existing MUI components remain in place while unmigrated screens still need them.
4. New shared UI behavior should be encoded in project-owned components, not repeated in feature-level JSX or long prose instructions.
5. Each migration slice must keep a before/after visual check for affected desktop and mobile states.
6. Tailwind preflight is intentionally enabled globally during the bridge period. MUI styles remain isolated through the explicit cascade layer order `theme, base, mui, components, utilities`, and representative legacy MUI pages must stay in the visual check set.

## Migration Plan

The step-by-step migration plan lives in `docs/architecture/mui-to-shadcn-migration-plan.md`.
