# Vue 3 + Vite + TypeScript Upgrade Plan

Goal

- Migrate the library from Vue 2 + Rollup + JS to Vue 3 + Vite + TypeScript.
- Adopt the Composition API with <script setup> across SFCs.
- Convert the two mixins (src/mixins/TreeMixin.js, src/mixins/DndMixin.js) into composables.
- Update the demo (currently Storybook under docs/storybook) to a Vue 3 + Vite-based workflow.
- Establish a comprehensive, fast unit test suite (Vitest + @vue/test-utils v2).
- Preserve the public API where reasonable; document intentional breaking changes.

Non-goals (for this phase)

- No feature additions beyond those required by the migration.
- No redesign of component UI/UX.

Phasing overview

1) Toolchain and scaffolding
2) Core library migration (types, events, composables)
3) Component SFC migration (<script setup>)
4) Demo upgrade (Storybook for Vue 3 with Vite builder)
5) Testing migration and expansion (Vitest)
6) Cleanup and deprecation/removal of legacy artifacts
7) Sign-off and release prep

---

Phase 1 — Toolchain and scaffolding

- Node and package baseline
  - Require Node 18+.
  - Switch package manager commands to npm (retain compatibility with Windows pwsh).
- Add core dependencies/devDependencies
  - vue@^3, vue-router (if needed later), @vue/test-utils@^2.
  - vite, @vitejs/plugin-vue, typescript, vue-tsc.
  - vitest, jsdom, @vitest/coverage-v8.
  - eslint@^9, eslint-plugin-vue@^9, @typescript-eslint/parser, @typescript-eslint/eslint-plugin, prettier and configs.
- Project scaffolding
  - Add tsconfig.json (strict mode) and configure paths/types for Vue SFCs.
  - Add vite.config.ts with library mode (ESM + UMD/IIFE as needed). Externalize vue, set globals: Vue.
  - Add scripts to package.json:
    - dev: vite
    - build: vite build
    - preview: vite preview
    - test: vitest run
    - test:watch: vitest
    - lint: eslint .
    - type-check: vue-tsc --noEmit -p tsconfig.json
  - Remove Rollup from build scripts after migration completes (keep temporarily during transition if needed).

Deliverables

- vite.config.ts (library mode output to dist/).
- tsconfig.json.
- Updated package.json scripts and devDependencies.

Acceptance criteria

- vite build produces dist/liquor-tree.[esm|umd].js equivalents with Vue externalized.
- type-check passes.

---

Phase 2 — Core library migration (types, events, composables foundation)

- Convert core classes to TypeScript
  - src/lib/Tree.js -> src/lib/Tree.ts
  - src/lib/Node.js -> src/lib/Node.ts
  - src/lib/Selection.js -> src/lib/Selection.ts
  - src/utils/*.js -> src/utils/*.ts (as appropriate: request, recurse, find, sort, stack, treeParser, uuidV4, keyboardNavigation, etc.).
- Event system refactor (Vue 3 removed $on/$off on component instances)
  - Replace reliance on component instance as an event bus inside Tree with an internal emitter (e.g., mitt).
  - Tree exposes on/off/emit that proxy to the emitter.
  - Components subscribe and re-emit via defineEmits where appropriate (for v-model and node/tree events).
- Public API considerations
  - Maintain node:*and tree:* event semantics, but document that events are emitted from the component via emits rather than $emit on an injected vm.
  - Evaluate v-model changes: in Vue 3, prefer modelValue/update:modelValue. Provide mapping for legacy consumers if feasible.

Deliverables

- TypeScript class implementations with appropriate interfaces/types for Node state, options, and Tree parsing.
- Internal event emitter integrated; no direct vm.$on/$emit in core classes.

Acceptance criteria

- TypeScript builds pass; unit tests for core classes (ported from existing Jest tests) pass under Vitest.

---

Phase 3 — Convert mixins to composables and migrate SFCs to <script setup>

- Mixins -> composables
  - src/mixins/TreeMixin.js -> src/composables/useTree.ts
    - Responsibilities: initialize Tree instance, wire keyboard navigation, model syncing (selected/checked), optional store integration, expose imperative methods (append, prepend, find, etc.).
  - src/mixins/DndMixin.js -> src/composables/useDnd.ts
    - Responsibilities: DnD lifecycle (start, move, finish), drop-target detection, class helper updates, callback hooks (onDragStart/onDragOn/onDragFinish).
- Provide/inject
  - Use a typed injection key (e.g., const TreeKey = Symbol('Tree');) for providing the Tree instance from the root component to descendants.
- SFC migration
  - Components to migrate: src/components/TreeRoot.vue, TreeNode.vue, NodeContent.vue, DraggableNode.vue.
  - Replace options API with <script setup lang="ts"> and Composition API patterns:
    - defineProps/defineEmits; computed, reactive, watch, onMounted.
    - Replace watchers and lifecycle hooks accordingly.
    - Replace this.$scopedSlots usage with slots.default?.
  - v-model API
    - Implement modelValue/update:modelValue for selected/checked data exposure. Optionally provide a compatibility prop/emits layer if required.
  - Render-time HTML
    - NodeContent currently uses render() and innerHTML. Convert to template-based rendering with v-html fallback and a default slot for customization.
  - Accessibility and keyboard navigation
    - Port keyboard handling to Composition API.

Deliverables

- useTree.ts and useDnd.ts composables.
- All components using <script setup lang="ts"> with typed props/emits.

Acceptance criteria

- Dev build runs; component renders with basic interactions (select/expand/check) functioning.

---

Phase 4 — Demo upgrade (Storybook + Vite for Vue 3)

- Replace docs/storybook (Storybook 5) with a Vue 3 + Vite builder setup (Storybook 8 or 7 with @storybook/vue3-vite).
- Create .storybook/ configuration with vite builder.
- Update stories to use Vue 3 patterns (CSF) and ensure they import the library build or local source via Vite alias.
- Ensure stories cover:
  - Basic usage, single/multiple selection, checkbox mode, default node states.
  - Options: parentSelect, checkOnSelect, autoCheckChildren, keyboard navigation, async data (fetchData).
  - v-model usage for selected/checked.
  - DnD examples.

Deliverables

- .storybook/ with Vue 3 + Vite config.
- Updated stories under stories/ (moved from docs/storybook/stories).

Acceptance criteria

- Storybook starts with npm run storybook and renders all examples without console errors.

---

Phase 5 — Testing migration and expansion

- Migrate test runner
  - Replace Jest with Vitest; configure jsdom environment.
  - Update @vue/test-utils to v2 for Vue 3.
- Port existing unit tests
  - tests/lib/Node.spec.js -> tests/lib/Node.spec.ts
  - tests/utils/objectToNode.spec.js -> tests/utils/objectToNode.spec.ts
  - tests/utils/stack.spec.js -> tests/utils/stack.spec.ts
- Expand coverage to comprehensive suite
  - Core classes (Tree/Node/Selection): selection, checking, indeterminate propagation, expand/collapse, insert/remove, traversal, sorting, filtering, async loadChildren.
  - Composables: useTree (model syncing, store connector if retained), useDnd (drag lifecycle, drop positions, callbacks).
  - Components: TreeRoot/TreeNode/NodeContent/DraggableNode visual/behavioral tests (rendering, keyboard navigation, v-model, checkbox, parentSelect, checkOnSelect, batch load, DnD interactions with safe simulation).
- Coverage targets
  - 90%+ statements/branches for core logic.

Deliverables

- Vitest config (within vite config or separate), updated tests in TypeScript.
- npm scripts: test, test:watch, coverage.

Acceptance criteria

- test and test:watch pass locally; coverage meets threshold.

---

Phase 6 — Cleanup and package polish

- Remove Rollup config and @vue/cli-service dependencies after parity is confirmed.
- Update package.json fields
  - main/module/types fields for library outputs.
  - exports map for ESM consumers.
  - peerDependencies: vue ">=3".
  - Side effects flag as appropriate ("sideEffects": false if tree-shakeable).
- Linting and formatting
  - ESLint + Prettier clean pass.
- Type checks
  - vue-tsc passes for SFCs and TS files.

Deliverables

- Finalized package.json and removal of obsolete files (rollup.config.js, jest.config.js, docs/storybook/* if fully replaced).

Acceptance criteria

- clean install/build/test pass; library can be consumed in a fresh Vue 3 + Vite sandbox.

---

Phase 7 — Release prep

- Semver decision
  - Publish under new major (e.g., 1.0.0 or next major) due to breaking changes (Vue 3, event API).
- Migration guide (CHANGELOG/UPGRADE.md)
  - Document breaking changes: Vue 3 requirement, event bus changes, v-model API updates, Storybook location, TS types.
- Tag and release draft notes.

---

Key design decisions and notes

- Eventing: Replace reliance on vm.$on/$emit in Tree with an internal emitter (mitt). Components use defineEmits to bridge Tree events to consumers. This isolates core logic from the component instance API.
- v-model: Prefer modelValue/update:modelValue; expose selected/checked model as needed. Consider a single model for checkbox mode mirroring the previous API, but adopt Vue 3 conventions.
- Composables naming: useTree and useDnd; colocate under src/composables/.
- Library build: Vite library mode with Rollup under the hood; externalize vue; generate ESM + UMD.
- Types: Introduce NodeState, TreeOptions, FilterOptions, DndOptions, etc., and narrow any usage of any.
- DnD: Continue using mouse listeners with composedPath; verify compatibility across browsers; keep helpers for drop classes.

Breaking changes to communicate

- Vue 3 only.
- Removal of $on/$off usage; consumers should rely on component-emitted events and props.
- v-model event name differences (modelValue/update:modelValue) if consumers previously bound to input.

Work breakdown and PR plan

- PR1: Tooling scaffolding (Vite + TS), parallel to existing build; no functional changes.
- PR2: Core classes to TS + mitt; adapt minimal component glue (behind a compatibility layer) to keep stories/tests passing.
- PR3: Mixins -> composables; TreeRoot/TreeNode to <script setup>.
- PR4: NodeContent/DraggableNode to <script setup>; slot and edit behavior update.
- PR5: Storybook upgrade to Vue 3 + Vite; port stories.
- PR6: Test migration to Vitest + expansions for coverage.
- PR7: Cleanup (remove Rollup/Jest), package polish, docs, and release prep.

Command reference (pwsh-friendly)

- Dev: npm run dev
- Build: npm run build
- Type check: npm run type-check
- Lint: npm run lint
- Test (watch): npm run test:watch
- Test (CI): npm test
- Storybook: npm run storybook (after setup in Phase 4)

Risk & mitigation

- Event system divergence: Adopt mitt early (Phase 2) to decouple core from Vue instance; add adapter layer in components.
- DnD regressions: Add focused tests for drop positions and class toggling; validate in Storybook.
- Async loading differences: Mock fetch and timers in Vitest; ensure minFetchDelay logic persists.
- Bundle format changes: Validate UMD global name and externals; verify tree-shaking in ESM.

Acceptance criteria (overall)

- All phases’ acceptance criteria met.
- Demo (Storybook) covers core scenarios and works on Vue 3.
- Comprehensive tests with high coverage; type and lint checks clean.
- Clear migration guide; version published under a new major.
