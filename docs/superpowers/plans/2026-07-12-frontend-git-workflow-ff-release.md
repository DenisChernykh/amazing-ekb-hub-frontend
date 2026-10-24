# Frontend Git Workflow and Stage Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align frontend release documentation with the backend fast-forward release process and deploy the current `stage` ref without creating a merge commit in `main`.

**Architecture:** Keep frontend-specific quality commands and deployment workflow details, but adopt the backend branch contract: ordinary feature PR merges into `stage`, then `main` advances only by fast-forward. Deploy the resulting `stage` ref through the existing production workflow without modifying `main`.

**Tech Stack:** Git, GitHub Actions, pnpm, Next.js, Docker Compose.

## Global Constraints

- Do not rewrite historical merge commits.
- Do not create a merge commit in `main`.
- Keep the active user checkout on its original branch.
- Use frontend commands that exist in `package.json`.

---

### Task 1: Align release documentation

**Files:**

- Modify: `docs/GIT_WORKFLOW.md`
- Modify: `AGENTS.md`

- [ ] Replace the frontend release contract with the backend model: ordinary PR merge into `stage`, `git merge --ff-only stage` for `main`, and explicit failure when fast-forward is impossible.
- [ ] Keep frontend-specific checks: `format:check`, `lint:strict`, `test:unit`, `typecheck`, and `build`.
- [ ] Document that production deploy of the current `stage` may use `workflow_dispatch` and does not modify `main`.
- [ ] Search the frontend docs for contradictory squash-only or merge-commit release instructions.

### Task 2: Verify and publish the documentation change

**Files:**

- Verify: `docs/GIT_WORKFLOW.md`
- Verify: `AGENTS.md`

- [ ] Run `pnpm exec prettier --check docs/GIT_WORKFLOW.md AGENTS.md`.
- [ ] Run the frontend quality gates sequentially: `pnpm run format:check`, `pnpm run lint:strict`, `pnpm run test:unit`, `pnpm run typecheck`, and `pnpm run build`.
- [ ] Commit the documentation change with a Conventional Commit.
- [ ] Push the feature branch and merge it into `stage` using the documented ordinary PR merge path.

### Task 3: Deploy stage and verify production

**Files:**

- Verify: `.github/workflows/deploy-production.yml`

- [ ] Dispatch `deploy-production` with ref `stage` after the documentation commit is present in `stage`.
- [ ] Verify `quality`, `build-image`, and `deploy` jobs succeed.
- [ ] Verify frontend `/` and `/v1/health/live` smoke tests.
- [ ] Restore the original checkout and verify its branch and clean status.
