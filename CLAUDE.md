# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Liquor Tree is a Vue 3 tree component library written in TypeScript. It provides hierarchically organized data presentation with features like drag & drop, filtering, sorting, keyboard navigation, and lazy loading. The core logic is framework-agnostic TypeScript classes connected to Vue 3 via Composition API composables.

## Common Commands

### Development
```bash
npm run dev          # Development mode with Vite HMR (opens browser at localhost:5173)
```

### Building
```bash
npm run build        # Production build - creates ESM and UMD bundles + TypeScript declarations in dist/
npm run type-check   # Run vue-tsc type checking without emitting files
```

### Testing
```bash
npm test             # Run all Vitest unit tests
npm run test:ui      # Run tests with Vitest UI
npm run test:coverage # Run tests with coverage report
```

To run a single test file:
```bash
npm test -- tests/unit/core/Node.spec.ts
npm test -- tests/unit/utils/objectToNode.spec.ts
```

### Linting
```bash
npm run lint         # Run ESLint on the codebase
```

## Architecture

### Core Classes (src/core/)

**Tree.ts** - The main tree controller class that manages:
- The tree data model (hierarchical node structure)
- Selection state (`selectedNodes`, `checkedNodes` as Selection arrays)
- Tree-level operations (filter, sort, expand/collapse, select/unselect, selectRange)
- Data fetching and lazy loading via `fetchData` option
- Internal event bus (`$on`, `$off`, `$emit`) — not Vue events
- Active element tracking for keyboard navigation

**Node.ts** - Represents individual tree nodes with:
- State management (selected, checked, expanded, disabled, visible, matched, etc.)
- Hierarchical relationships (parent, children)
- Node-level operations (select, check, expand, collapse, append, remove, edit)
- Drag-and-drop support (isDraggable, isDropable)
- Path traversal methods (recurseUp, recurseDown)

**Selection.ts** - Utility class extending Array for bulk operations on multiple nodes (select, check, expand, disable, etc.)

### Type Definitions (src/types/index.ts)

Comprehensive TypeScript interfaces for the public API:
- `TreeNodeData` - input data format
- `NodeState` - all node state flags
- `TreeOptions` - configuration (multiple, checkbox, dnd, fetchData, filter, sort, etc.)
- `DragAndDropOptions`, `FilterOptions`, `SortOptions`
- `TreeEventName` - union type of all valid event names

### Vue Components (src/components/)

All components use Vue 3 `<script setup lang="ts">`.

**TreeRoot.vue** - Root component registered as `<tree>`:
- Accepts `data` (TreeNodeData[]) and `options` (TreeOptions) props
- Initializes Tree instance in `onMounted`
- Provides `activeElement` and `dragDrop` to child components via `provide`
- Watches props for reactive updates
- Exposes tree instance via `defineExpose()`
- Wires up `useKeyboardNav()`, `useDragDrop()`, and `useAsyncData()` composables

**TreeNode.vue** - Recursive component for rendering individual nodes:
- Renders checkbox, expand/collapse arrow, node text, or inline editor
- Computes ARIA attributes (ariaLevel, ariaExpanded, ariaChecked)
- Handles click, double-click, mousedown, and keyboard events
- Inline editing with auto-focus and Escape/Enter handling
- Drag-and-drop integration via injected `dragDrop` composable
- Slot support for custom node rendering

### Composables (src/composables/)

Replaces Vue 2 mixins with reusable Composition API functions.

**useKeyboardNav.ts** - Keyboard navigation:
- Arrow keys: navigate up/down/left/right through visible nodes
- Space/Enter: toggle checkbox or selection
- F2: start inline editing
- Manages `tree.activeElement` for focus tracking

**useDragDrop.ts** - Drag-and-drop behavior:
- Tracks dragging state and drop position (ABOVE/BELOW/ON)
- Movement threshold (5px) before drag starts
- Validates drops (prevents self-drop, parent-into-child)
- Applies visual feedback CSS classes on drag target
- Emits `node:dragstart` and `node:dropped` events
- Performs tree manipulation: insertBefore, insertAfter, append

**useAsyncData.ts** - Lazy loading:
- Handles nodes marked with `isBatch: true`
- Supports URL template string (`"/api/{id}"`) or custom function (`fetchData(node)`)
- Manages loading state and prevents duplicate fetches
- Calls `onFetchError()` callback on failure

### Utilities (src/utils/)

- **uuid.ts** - UUID v4 generator for node IDs when not provided

### Build System

Uses Vite in library mode:
- Entry: `src/index.ts`
- Outputs:
  - `dist/liquor-tree.js` - ES module format
  - `dist/liquor-tree.umd.cjs` - UMD format
  - `dist/index.d.ts` - TypeScript declarations (generated via `vue-tsc --emitDeclarationOnly`)
- Vue is a peer dependency (externalized from bundle)

### Data Flow

1. User provides data via `data` prop to `<tree>` component
2. TreeRoot creates Tree instance which parses data into Node instances
3. Tree maintains reactive `model` array of root nodes
4. Nodes maintain their own children arrays (recursive structure)
5. User interactions trigger Node methods which emit events through Tree's internal event bus
6. Selection/checked state tracked in Selection arrays on Tree instance
7. Vue reactivity bridges component rendering to Tree/Node state changes

### State Management

Node states are stored in the `states` object on each Node:
- `selected`, `checked`, `indeterminate` - selection states
- `expanded`, `collapsed` - visibility states
- `disabled`, `selectable`, `visible`, `matched` - behavioral/filter states

The Tree instance maintains:
- `selectedNodes` - Selection array of currently selected nodes
- `checkedNodes` - Selection array of currently checked nodes
- `activeElement` - Currently focused node for keyboard nav

### Testing

Tests use Vitest with `@vue/test-utils` v2. Test files live in `tests/unit/` mirroring the `src/` structure. Run with `npm test`.
