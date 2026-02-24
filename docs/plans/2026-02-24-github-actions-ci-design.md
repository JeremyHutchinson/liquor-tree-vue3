# GitHub Actions CI — Design

**Date:** 2026-02-24

## Goal

Run automated checks on every push and every pull request to `master` to catch lint errors, type errors, test failures, and broken builds before they land.

## Triggers

- Push to any branch
- Pull request targeting `master`

## Workflow

**File:** `.github/workflows/ci.yml`
**Job:** `ci` — runs on `ubuntu-latest`, Node 20

### Steps (sequential, fails fast)

| Step | Command |
|------|---------|
| Checkout | `actions/checkout@v4` |
| Setup Node 20 | `actions/setup-node@v4` with npm cache |
| Install | `npm ci` |
| Lint | `npm run lint` |
| Type check | `npm run type-check` |
| Test | `npm test -- --run` |
| Build | `npm run build` |

## Decisions

- **Single job, sequential** — simple, fails fast, no redundant `npm install` overhead from parallel jobs
- **Node 20** — current LTS
- **`--run` flag** — runs Vitest in non-watch (CI) mode
- **npm cache** — speeds up installs on repeated runs
