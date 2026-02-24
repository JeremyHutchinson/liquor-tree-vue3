# Vue 3 + TypeScript + Vite Migration Plan

## Migration Strategy

**Approach**: Incremental migration with test-driven development
- Move existing Vue 2 code to `.legacy/` directory
- Build new Vue 3 component from scratch using TypeScript
- Start with MVP (minimal viable product) and add features incrementally
- Write tests first for each feature (TDD)
- Maintain working demo app throughout migration

## Key Decisions

- ✅ **Vue 3 Composition API** with `<script setup>`
- ✅ **TypeScript** for type safety
- ✅ **Composables** instead of mixins
- ✅ **Vite** for build tooling and dev server
- ✅ **ESM only** (no UMD) - modern, tree-shakeable
- ✅ **Vitest** for unit testing (Vite-native)
- ✅ **Simple Vite demo app** (replace Storybook)
- ✅ **Maintain API compatibility** where practical, allow breaking changes where beneficial

---

## Phase 0: Project Setup & Preparation

### 0.1 Archive Existing Code
- [ ] Move `src/` to `.legacy/src/`
- [ ] Move `tests/` to `.legacy/tests/`
- [ ] Move `examples/` to `.legacy/examples/`
- [ ] Keep `package.json`, `README.md` at root (will update)
- [ ] Create `.legacy/README.md` with note about legacy code

### 0.2 Initialize New Project Structure
```
liquor-tree-vue3/
├── .agents/               # This directory - plans and docs
├── .legacy/               # Original Vue 2 code
├── src/
│   ├── components/        # Vue 3 components
│   ├── composables/       # Converted from mixins
│   ├── core/              # Core classes (Tree, Node, Selection)
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── index.ts           # Main entry point
├── demo/                  # Vite demo app
│   ├── src/
│   │   ├── App.vue
│   │   └── main.ts
│   ├── index.html
│   └── vite.config.ts
├── tests/                 # Vitest tests
│   ├── unit/
│   └── integration/
├── dist/                  # Build output (ESM)
├── vite.config.ts         # Library build config
├── vitest.config.ts       # Test config
├── tsconfig.json          # TypeScript config
└── package.json           # Updated dependencies
```

### 0.3 Update Dependencies
- [ ] Remove Vue 2 dependencies
- [ ] Add Vue 3 (`vue@^3`)
- [ ] Add Vite (`vite@^5`, `@vitejs/plugin-vue`)
- [ ] Add TypeScript (`typescript`, `vue-tsc`)
- [ ] Add Vitest (`vitest`, `@vue/test-utils@^2`)
- [ ] Remove Rollup, Jest, Storybook dependencies
- [ ] Update package.json scripts:
  - `dev` → run demo app
  - `build` → build library (ESM)
  - `test` → run Vitest
  - `type-check` → run vue-tsc

### 0.4 Configure Build System
- [ ] Create `vite.config.ts` for library build (ESM output)
- [ ] Create `demo/vite.config.ts` for demo app
- [ ] Create `vitest.config.ts` for testing
- [ ] Create `tsconfig.json` with Vue 3 + strict mode
- [ ] Create `tsconfig.node.json` for Node scripts

### 0.5 Set Up Demo App
- [ ] Create `demo/index.html`
- [ ] Create `demo/src/main.ts` with Vue 3 app
- [ ] Create `demo/src/App.vue` with basic tree examples
- [ ] Verify demo runs with `npm run dev`

**Checkpoint**: Can run `npm run dev` and see empty demo app, `npm test` runs (even if no tests yet)

---

## Phase 1: Core Type System & Data Model (MVP Foundation)

**Goal**: Establish TypeScript types and core data structures without UI

### 1.1 Define Core Types
**Test First**: `tests/unit/types.spec.ts`
- [ ] Test type checking with simple tree data objects
- [ ] Test that TreeOptions interface accepts valid options

**Then Implement**: `src/types/index.ts`
- [ ] `TreeNode` interface (id, text, children, state, data)
- [ ] `TreeOptions` interface (all config options)
- [ ] `NodeState` interface (selected, checked, expanded, etc.)
- [ ] `TreeData` type (input data format)
- [ ] Event payload types
- [ ] Filter/Sort function types

### 1.2 Build Node Class
**Test First**: `tests/unit/core/Node.spec.ts`
- [ ] Test Node creation from plain object
- [ ] Test parent/child relationships
- [ ] Test state management (select, check, expand)
- [ ] Test node path traversal (recurseUp, recurseDown)
- [ ] Test node queries (find, states)

**Then Implement**: `src/core/Node.ts`
- [ ] Convert `.legacy/src/lib/Node.js` to TypeScript class
- [ ] Remove Vue 2 reactivity dependencies
- [ ] Add proper type annotations
- [ ] Keep core logic: states, parent/child, recurse methods

### 1.3 Build Tree Class
**Test First**: `tests/unit/core/Tree.spec.ts`
- [ ] Test tree creation from data array
- [ ] Test tree.find() and tree.findAll()
- [ ] Test selection management (select, unselect)
- [ ] Test tree traversal methods
- [ ] Test filtering logic
- [ ] Test sorting logic

**Then Implement**: `src/core/Tree.ts`
- [ ] Convert `.legacy/src/lib/Tree.js` to TypeScript class
- [ ] Remove Vue 2 reactivity, use plain JavaScript
- [ ] Implement selection tracking with Sets
- [ ] Add proper type annotations

### 1.4 Build Selection Class
**Test First**: `tests/unit/core/Selection.spec.ts`
- [ ] Test selection collection operations
- [ ] Test bulk operations on selected nodes

**Then Implement**: `src/core/Selection.ts`
- [ ] Convert `.legacy/src/lib/Selection.js` to TypeScript
- [ ] Simplify to work without Vue 2 Array extensions

**Checkpoint**: All core classes work in Node.js environment with full test coverage

---

## Phase 2: Basic Component Rendering (MVP)

**Goal**: Render a static tree with expand/collapse (no selection, no drag-drop yet)

### 2.1 Create TreeRoot Component
**Test First**: `tests/unit/components/TreeRoot.spec.ts`
- [ ] Test component mounts with data prop
- [ ] Test component creates Tree instance
- [ ] Test component renders root nodes
- [ ] Test reactivity when data changes

**Then Implement**: `src/components/TreeRoot.vue`
- [ ] Basic component with `<script setup lang="ts">`
- [ ] Accept `data` and `options` props
- [ ] Create Tree instance reactively
- [ ] Render list of root TreeNode components
- [ ] Expose tree instance via defineExpose for ref access

### 2.2 Create TreeNode Component
**Test First**: `tests/unit/components/TreeNode.spec.ts`
- [ ] Test node renders with text
- [ ] Test expand/collapse icon shows for nodes with children
- [ ] Test children are rendered when expanded
- [ ] Test children are hidden when collapsed

**Then Implement**: `src/components/TreeNode.vue`
- [ ] Recursive component that accepts node prop
- [ ] Render node text and expand/collapse arrow
- [ ] Recursively render children if expanded
- [ ] Basic styling (can be minimal for now)

### 2.3 Create NodeContent Component
**Test First**: `tests/unit/components/NodeContent.spec.ts`
- [ ] Test renders node text by default
- [ ] Test renders custom content if slot provided

**Then Implement**: `src/components/NodeContent.vue`
- [ ] Simple component that renders node.text
- [ ] Support for slot customization (future)

### 2.4 Add Basic Expand/Collapse
**Test First**: Add to `TreeNode.spec.ts`
- [ ] Test clicking arrow toggles expanded state
- [ ] Test children show/hide appropriately

**Then Implement**: Update `TreeNode.vue`
- [ ] Click handler on expand arrow
- [ ] Update node.expanded state
- [ ] Reactive rendering of children

### 2.5 Wire Up Demo App
- [ ] Update `demo/src/App.vue` with sample tree data
- [ ] Import and use TreeRoot component
- [ ] Add a few example trees (simple, nested, large)
- [ ] Verify expand/collapse works in browser

**Checkpoint**: Can run demo app, see tree, expand/collapse nodes

---

## Phase 3: Selection & Click Interactions

**Goal**: Add node selection (single and multiple) with keyboard support

### 3.1 Single Selection
**Test First**: `tests/unit/selection/single-selection.spec.ts`
- [ ] Test clicking node selects it
- [ ] Test clicking another node deselects previous
- [ ] Test selected node has correct state
- [ ] Test selection event is emitted

**Then Implement**:
- [ ] Update `Node.ts` with select/deselect methods
- [ ] Update `Tree.ts` to track selectedNodes Set
- [ ] Update `TreeNode.vue` to handle click → select
- [ ] Add CSS class for selected state
- [ ] Emit `node:selected` event from TreeRoot

### 3.2 Multiple Selection
**Test First**: Add to selection tests
- [ ] Test Cmd/Ctrl+click adds to selection
- [ ] Test Shift+click range selection
- [ ] Test selection state persistence

**Then Implement**:
- [ ] Add multi-select logic to Tree class
- [ ] Update TreeNode click handler for modifier keys
- [ ] Update demo with multi-select example

### 3.3 Keyboard Navigation Composable
**Test First**: `tests/unit/composables/useKeyboardNav.spec.ts`
- [ ] Test arrow up/down moves focus
- [ ] Test Enter selects focused node
- [ ] Test Space toggles check (future)

**Then Implement**: `src/composables/useKeyboardNav.ts`
- [ ] Convert `.legacy/src/utils/keyboardNavigation.js`
- [ ] Create composable with keyboard event handlers
- [ ] Return reactive activeNode ref

### 3.4 Integrate Keyboard Nav
- [ ] Use keyboard composable in TreeRoot
- [ ] Add tabindex and focus management
- [ ] Test in demo app

**Checkpoint**: Can select nodes with mouse and keyboard, see selection state

---

## Phase 4: Checkbox Support

**Goal**: Add checkboxes with indeterminate states

### 4.1 Checkbox State Management
**Test First**: `tests/unit/core/checkbox.spec.ts`
- [ ] Test checking node updates state
- [ ] Test checking node checks all children
- [ ] Test parent shows indeterminate when some children checked
- [ ] Test unchecking parent unchecks all children

**Then Implement**:
- [ ] Add checkbox logic to Node class
- [ ] Add checkedNodes Set to Tree class
- [ ] Implement indeterminate state calculation

### 4.2 Checkbox UI
**Test First**: `tests/unit/components/checkbox.spec.ts`
- [ ] Test checkbox renders when option enabled
- [ ] Test checkbox reflects checked/indeterminate state
- [ ] Test clicking checkbox updates state

**Then Implement**:
- [ ] Add checkbox to TreeNode.vue
- [ ] Add checkbox styles (checked, indeterminate)
- [ ] Wire up check events
- [ ] Add demo example with checkboxes

**Checkpoint**: Can check/uncheck nodes, parent states update correctly

---

## Phase 5: Filtering & Searching

**Goal**: Filter tree by text, show only matching nodes

### 5.1 Filter Utility
**Test First**: `tests/unit/utils/filter.spec.ts`
- [ ] Test filter marks matching nodes as visible
- [ ] Test filter hides non-matching nodes
- [ ] Test filter keeps parent path of matches visible
- [ ] Test filter with regex
- [ ] Test filter with custom function

**Then Implement**: `src/utils/filter.ts`
- [ ] Convert `.legacy/src/utils/find.js` logic
- [ ] TypeScript implementation
- [ ] Support string, regex, and function filters

### 5.2 Integrate Filtering
**Test First**: Add to TreeRoot tests
- [ ] Test tree.filter() updates visible nodes
- [ ] Test UI only shows filtered nodes

**Then Implement**:
- [ ] Add filter method to Tree class
- [ ] Update TreeNode to check node.states.visible
- [ ] Add filter input to demo app

**Checkpoint**: Can type in filter box, tree shows only matches

---

## Phase 6: Sorting

**Goal**: Sort nodes alphabetically or with custom comparator

### 6.1 Sort Utility
**Test First**: `tests/unit/utils/sort.spec.ts`
- [ ] Test sort reorders children
- [ ] Test recursive sort
- [ ] Test custom comparator
- [ ] Test sort preserves tree structure

**Then Implement**: `src/utils/sort.ts`
- [ ] Convert `.legacy/src/utils/sort.js`
- [ ] TypeScript with proper types

### 6.2 Integrate Sorting
- [ ] Add sort method to Tree class
- [ ] Add sort controls to demo
- [ ] Test sorting updates UI

**Checkpoint**: Can click sort button, tree reorders

---

## Phase 7: Drag & Drop

**Goal**: Drag nodes to reorder or reparent

### 7.1 Drag & Drop Composable
**Test First**: `tests/unit/composables/useDragDrop.spec.ts`
- [ ] Test drag start captures node
- [ ] Test drop updates tree structure
- [ ] Test drop validation (can't drop parent into child)
- [ ] Test drop position (before, after, inside)

**Then Implement**: `src/composables/useDragDrop.ts`
- [ ] Convert `.legacy/src/mixins/DndMixin.js` to composable
- [ ] Use Vue 3 refs for drag state
- [ ] Return drag handlers and state

### 7.2 Integrate Drag & Drop
**Test First**: Integration test
- [ ] Test dragging node in component updates tree

**Then Implement**:
- [ ] Add draggable to TreeNode
- [ ] Add drop zones
- [ ] Create DraggableNode ghost component
- [ ] Add demo with drag-drop enabled

**Checkpoint**: Can drag nodes to reorder/reparent in demo

---

## Phase 8: Async Data & Lazy Loading

**Goal**: Load child nodes on demand

### 8.1 Async Data Composable
**Test First**: `tests/unit/composables/useAsyncData.spec.ts`
- [ ] Test fetchData gets called when node expands
- [ ] Test loading state during fetch
- [ ] Test children populate after fetch
- [ ] Test error handling

**Then Implement**: `src/composables/useAsyncData.ts`
- [ ] Convert `.legacy/src/utils/request.js`
- [ ] Use fetch or axios
- [ ] Handle loading/error states

### 8.2 Integrate Lazy Loading
- [ ] Add lazy-load option to Tree
- [ ] Update TreeNode to fetch on expand
- [ ] Add loading spinner
- [ ] Add demo with async data

**Checkpoint**: Can expand node, see loading, children appear

---

## Phase 9: Advanced Features & Polish

### 9.1 Custom Rendering
- [ ] Support scoped slots for custom node content
- [ ] Support custom node components
- [ ] Add examples to demo

### 9.2 Events System
- [ ] Ensure all events emit properly (node:selected, node:checked, etc.)
- [ ] Document all events
- [ ] Add event examples to demo

### 9.3 State Management Integration
- [ ] Decide: Vuex (Vue 2 compat) or Pinia (Vue 3 native)?
- [ ] Create integration example (if needed)
- [ ] Add to demo (optional)

### 9.4 Accessibility
- [ ] Add proper ARIA attributes
- [ ] Test keyboard navigation thoroughly
- [ ] Test with screen reader
- [ ] Add focus indicators

### 9.5 Performance Optimization
- [ ] Virtual scrolling for large trees (optional)
- [ ] Optimize reactivity (use shallowRef where appropriate)
- [ ] Lazy rendering of children

**Checkpoint**: Full-featured tree component with all original functionality

---

## Phase 10: Documentation & Migration

### 10.1 API Documentation
- [ ] Document all props in TreeRoot
- [ ] Document all options
- [ ] Document all events
- [ ] Document all exposed methods
- [ ] Create API reference markdown

### 10.2 Migration Guide
- [ ] Create `MIGRATION.md`
- [ ] Document breaking changes
- [ ] Provide code examples (Vue 2 → Vue 3)
- [ ] Document new features
- [ ] Note deprecated features

### 10.3 Examples & Demos
- [ ] Create comprehensive demo site
- [ ] Add common use case examples
- [ ] Add advanced examples
- [ ] Deploy demo (Netlify, Vercel, GitHub Pages)

### 10.4 Testing & CI
- [ ] Ensure 80%+ test coverage
- [ ] Set up GitHub Actions for CI
- [ ] Run tests on push
- [ ] Run type checking
- [ ] Run linting

### 10.5 Package & Release
- [ ] Update package.json (version, exports, files)
- [ ] Update README.md
- [ ] Add CHANGELOG.md
- [ ] Test package locally (`npm pack`, install in test project)
- [ ] Publish to npm (when ready)

---

## Testing Strategy

### Test-Driven Development Flow
For each feature:
1. **Write failing test** - describe expected behavior
2. **Run test** - verify it fails (red)
3. **Implement minimal code** - make test pass
4. **Run test** - verify it passes (green)
5. **Refactor** - improve code while keeping tests green
6. **Manual test in demo** - verify UI works

### Test Levels
- **Unit tests** - Individual functions, classes, composables
- **Component tests** - Vue components in isolation with Vue Test Utils
- **Integration tests** - Multiple components working together
- **Manual testing** - Use demo app for each feature

### Coverage Goals
- Core classes: 90%+
- Components: 80%+
- Utilities: 90%+
- Overall: 80%+

---

## Development Workflow

### For Each Phase
1. Work directly in `vue3-take3` branch (already checked out)
2. Write tests first (TDD)
3. Implement feature
4. Verify tests pass: `npm test`
5. Verify types check: `npm run type-check`
6. Test manually in demo: `npm run dev`
7. Commit work: `git commit -m "Phase X: Feature description"`
8. Move to next phase or sub-task

### Branch Strategy
- `main` - stable Vue 2 code
- `vue3-take3` - **main development branch** (current)
- Optional: create sub-branches for experimental features if needed

### Verification at Each Checkpoint
- ✅ All tests pass
- ✅ TypeScript compiles with no errors
- ✅ Demo app runs and shows feature working
- ✅ No console errors

---

## Success Criteria

### MVP Complete (End of Phase 2)
- [ ] Tree renders from data
- [ ] Nodes expand/collapse
- [ ] Demo app works
- [ ] Core tests pass

### Feature Complete (End of Phase 9)
- [ ] All Vue 2 features implemented
- [ ] All tests pass with 80%+ coverage
- [ ] Demo app shows all features
- [ ] Type safety throughout
- [ ] No TypeScript errors

### Production Ready (End of Phase 10)
- [ ] Documentation complete
- [ ] Migration guide written
- [ ] Package builds successfully
- [ ] Demo deployed
- [ ] Ready for npm publish

---

## Estimated Effort by Phase

- **Phase 0**: Setup - 4-6 hours
- **Phase 1**: Core Model - 8-10 hours
- **Phase 2**: Basic Rendering (MVP) - 6-8 hours
- **Phase 3**: Selection - 4-6 hours
- **Phase 4**: Checkboxes - 4-6 hours
- **Phase 5**: Filtering - 3-4 hours
- **Phase 6**: Sorting - 2-3 hours
- **Phase 7**: Drag & Drop - 8-10 hours
- **Phase 8**: Async Loading - 4-6 hours
- **Phase 9**: Polish - 6-8 hours
- **Phase 10**: Docs & Release - 6-8 hours

**Total estimated effort**: 55-75 hours

---

## Notes

- This is an aggressive TDD approach - write tests first, always
- Each phase should leave the project in a working state
- Demo app is your constant verification tool
- Don't skip tests to "move faster" - tests ARE the speed
- Breaking changes are OK if documented in migration guide
- Focus on getting MVP (Phase 0-2) working first, then iterate

---

## Questions & Decisions Log

**Decided**:
- ✅ Composition API over Options API
- ✅ TypeScript over JavaScript
- ✅ Vite over Rollup
- ✅ Vitest over Jest
- ✅ ESM only (no UMD)
- ✅ Simple Vite demo over Storybook
- ✅ Test-driven development approach
- ✅ Move legacy code to `.legacy/`

**Open Questions**:
- Should we use Pinia for state management examples, or just emit events?
- Do we need virtual scrolling for very large trees (1000+ nodes)?
- Should we maintain Vuex integration or deprecate it?

---

## Next Steps

1. **Review this plan** - make sure it aligns with your goals
2. **Start Phase 0** - set up project structure
3. **Get to MVP** - complete Phases 0-2 for basic working tree
4. **Iterate** - add features incrementally with tests

Ready to begin? Start with Phase 0.1: Archive existing code to `.legacy/`
