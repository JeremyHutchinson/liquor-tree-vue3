# GitHub Actions CI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a CI workflow that runs lint, type-check, tests, and build on every push and every PR to master.

**Architecture:** A single `.github/workflows/ci.yml` file with one job (`ci`) running sequential steps on `ubuntu-latest` with Node 20. No parallelism — fails fast, simple to read.

**Tech Stack:** GitHub Actions, Node 20, npm, Vitest, vue-tsc, ESLint, Vite

---

### Task 1: Create the CI workflow file

**Files:**
- Create: `.github/workflows/ci.yml`

**Step 1: Create the `.github/workflows/` directory and workflow file**

Create `.github/workflows/ci.yml` with the following content:

```yaml
name: CI

on:
  push:
    branches:
      - '**'
  pull_request:
    branches:
      - master

jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run type-check

      - name: Test
        run: npm test -- --run

      - name: Build
        run: npm run build
```

**Step 2: Verify the file is valid YAML**

Open the file and visually confirm indentation is consistent (2-space indent throughout). GitHub Actions is strict about YAML syntax.

**Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions workflow for lint, type-check, test, and build"
```

**Step 4: Push and verify the workflow triggers**

```bash
git push
```

Then open GitHub → Actions tab and confirm the `CI` workflow appears and runs. All steps should pass green.

---

### Task 2: Merge to master via PR

**Step 1: The workflow runs on the feature branch push (verified above)**

**Step 2: Open or update the existing PR targeting master**

The workflow will automatically run as a PR check. Confirm all steps pass in the PR checks panel before merging.

**Step 3: Merge the PR**

```bash
gh pr merge --merge
```
