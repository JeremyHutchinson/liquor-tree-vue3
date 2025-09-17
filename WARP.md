# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Common commands
- Install dependencies (uses npm; package-lock.json present):
  - npm ci
  - or: npm install
- Build the library (Rollup):
  - npm run build
- Develop with watch (Rollup dev server on 8081 serving dist/ and demo/):
  - npm run dev
- Lint (Vue CLI Service + ESLint):
  - npm run lint
- Run all unit tests (Jest via Vue CLI Service):
  - npm test
- Run a single test file:
  - npx vue-cli-service test:unit tests/utils/stack.spec.js
- Run tests filtered by name/pattern:
  - npx vue-cli-service test:unit -t "node selection"
- Storybook (requires a fresh build because stories import dist output):
  - npm run build && npm run storybook
  - Opens http://localhost:9001 (stories in docs/storybook/stories)

Notes:
- Commands are the same on Windows PowerShell (pwsh).

## What this project is
A Vue 2 component library providing a feature-rich tree view (drag & drop, selection, checkbox mode, filtering, keyboard navigation, async loading). Distribution bundles are produced to dist/ as ESM and UMD files (liquor-tree.esm.js, liquor-tree.umd.js).

## High-level architecture (big picture)
- Entry point and registration:
  - src/main.js registers the root component as Vue component name "Tree" (TreeRoot.vue) and supports global install when window.Vue is present.
- Rendering layer (Vue SFCs):
  - TreeRoot.vue orchestrates rendering the tree, applies options with internal defaults (direction, multiple, checkbox, parentSelect, keyboardNavigation, nodeIndent, dnd/editing flags, fetchData hooks, filter behavior), provides the tree instance to descendants, handles top-level filtering and drag state, and exposes computed visibleModel/visibleMatches.
  - TreeNode.vue renders a single node row (arrow, optional checkbox, label). It handles selection semantics (single/multiple, parentSelect, checkOnSelect), expanding/collapsing, and integrates with drag-and-drop.
  - NodeContent.vue is the label renderer: shows inline edit input when node.isEditing, otherwise renders HTML text or a default slot.
  - DraggableNode.vue renders the floating drag preview.
- Core domain model and controller (plain JS):
  - lib/Tree.js is the controller for the component instance: event bus passthrough ($on/$emit), maintains the tree model, selectedNodes and checkedNodes (List from utils/stack), activeElement, filter state, and implements operations: find, (un)select, (un)check, expand/collapse/toggle, sort, add/remove/insert, recurse traversal, and lazy-loading. It normalizes options.fetchData (string template -> function) and parses incoming data via TreeParser + objectToNode. It can fetch initial data when no prop data is provided. Emits tree:* and node:* events back to the component and supports optional external store integration.
  - lib/Node.js represents a single node with id, states, data, children, and parent. It encapsulates behavior: select/unselect (with multiple selection support), check/uncheck (with autoCheckChildren and indeterminate propagation), expand/collapse (including lazy batch loading via Tree.loadChildren), enable/disable (with optional autoDisableChildren), edit start/stop, drag handling (start/finish with above/below/on placement), navigation (next/prev/first/last), and JSON cloning/serialization. Emits node:* events via its Tree context.
  - lib/Selection.js is an Array subclass enabling batched operations across multiple nodes (select, unselect, check, uncheck, expand, collapse, disable, enable).
- Behavior mixins and utilities:
  - mixins/TreeMixin.js wires a Tree instance into the Vue component lifecycle, initializes keyboard navigation (utils/keyboardNavigation), binds node/checkbox events to v-model-style emissions, and optionally connects to an external store via provided getter/dispatcher.
  - mixins/DndMixin.js implements drag-and-drop across nodes using global mouse listeners. Calculates drop positions (above/below/on), updates helper classes, and calls optional user-provided dnd callbacks (onDragStart/onDragOn/onDragFinish) from options.dnd.
  - Parsing/model helpers: utils/treeParser.js converts incoming arbitrary-shaped data to the standard node shape using configurable property name mapping; utils/objectToNode.js creates Node instances with merged default states and recursively wires parents/children.
  - Additional helpers used throughout: utils/find.js, utils/recurse.js, utils/request.js (string-template URLs and GET helper), utils/fetchDelay.js (UI delay for loading spinners), utils/stack.js (List), utils/sort.js, utils/uuidV4.js, utils/keyboardNavigation.js.
- Build and tooling:
  - Rollup (rollup.config.js) builds ESM and UMD bundles with rollup-plugin-vue (Vue 2 SFCs), buble, alias, and uglify for production; dev mode can serve dist/ (and demo/) on port 8081. Vue CLI Service is used for linting and unit tests only.
- Testing:
  - Jest configured via jest.config.js (preset @vue/cli-plugin-unit-jest). Tests live under tests/, with setupTests.js providing requestAnimationFrame. Coverage is enabled by default and reports to stdout.
- Demos/Docs:
  - Storybook v5 config in docs/storybook loads the built ESM bundle from dist/. Run a build before launching storybook.

## Key repo references
- Scripts (package.json): lint, test, dev (rollup -w), build (rollup -c), storybook.
- README highlights: Live Playground steps (npm install, npm run build, npm run storybook, open http://localhost:9001) and feature list.

## Notes
- No CLAUDE/Cursor/Copilot instruction files found in this repo.
- User’s personal rule about Python virtual environments is not applicable to this JavaScript/Vue project.