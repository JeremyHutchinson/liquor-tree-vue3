# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Liquor Tree is a Vue.js tree component library that provides hierarchically organized data presentation with features like drag & drop, filtering, sorting, keyboard navigation, and Vuex integration. This appears to be a Vue 2.x implementation based on the dependencies.

## Common Commands

### Development
```bash
npm run dev          # Development mode with hot reload (opens browser at localhost:8081)
npm run storybook    # Run Storybook dev server on port 9001 for interactive examples
```

### Building
```bash
npm run build        # Production build - creates UMD and ES module bundles in dist/
```

### Testing
```bash
npm test             # Run all Jest unit tests with coverage
```

To run a single test file:
```bash
npm test -- tests/lib/Node.spec.js
npm test -- tests/utils/objectToNode.spec.js
```

### Linting
```bash
npm run lint         # Run ESLint on the codebase
```

## Architecture

### Core Classes (src/lib/)

**Tree.js** - The main tree controller class that manages:
- The tree data model (hierarchical node structure)
- Selection state (`selectedNodes`, `checkedNodes` as specialized List objects)
- Tree-level operations (filter, sort, expand/collapse, select/unselect)
- Data fetching and lazy loading via `fetchData` option
- Event emission to the Vue component layer

**Node.js** - Represents individual tree nodes with:
- State management (selected, checked, expanded, disabled, etc.)
- Hierarchical relationships (parent, children)
- Node-level operations (select, check, expand, append, remove)
- Data storage and text management
- Path traversal methods (recurseUp, recurseDown)

**Selection.js** - Collection wrapper for operating on multiple nodes simultaneously

### Vue Components (src/components/)

**TreeRoot.vue** - Root component registered as `<tree>`:
- Accepts `data` and `options` props
- Manages the Tree instance lifecycle
- Handles drag-and-drop state via DndMixin
- Renders either filtered matches or full model
- Uses TreeMixin for core tree functionality

**TreeNode.vue** - Recursive component for rendering individual nodes:
- Renders node content, expand/collapse controls, checkboxes
- Handles node interactions (click, double-click, keyboard events)
- Recursively renders children when expanded
- Manages node editing state

**NodeContent.vue** - Renders the actual node content (text/custom content)

**DraggableNode.vue** - Ghost element shown during drag operations

### Mixins (src/mixins/)

**TreeMixin.js** - Core tree functionality and lifecycle management
**DndMixin.js** - Drag-and-drop behavior

### Utilities (src/utils/)

- **treeParser.js** - Converts raw data to Node instances
- **objectToNode.js** - Single object to Node conversion
- **recurse.js** - Tree traversal utilities
- **find.js** - Node search/query functionality
- **sort.js** - Sorting utilities
- **stack.js** - List implementation (extends Array) for selection management
- **keyboardNavigation.js** - Keyboard interaction handling
- **request.js** - HTTP fetching for async data loading
- **fetchDelay.js** - Delays for loading states

### Build System

Uses Rollup for bundling with:
- **rollup-plugin-vue** - Compiles .vue files
- **rollup-plugin-buble** - ES6+ transpilation
- **rollup-plugin-uglify** - Minification in production

Outputs:
- `dist/liquor-tree.esm.js` - ES module format
- `dist/liquor-tree.umd.js` - UMD format (main entry point)

### Data Flow

1. User provides data via `data` prop to `<tree>` component
2. TreeRoot creates Tree instance which parses data into Node instances
3. Tree maintains reactive `model` array of root nodes
4. Nodes maintain their own children arrays (recursive structure)
5. User interactions trigger Node methods which emit events through Tree to component
6. Selection/checked state tracked in specialized List collections on Tree instance

### State Management

Node states are stored in the `states` object on each Node:
- `selected`, `checked`, `indeterminate` - selection states
- `expanded`, `collapsed` - visibility states
- `disabled`, `selectable`, `visible`, `matched` - behavioral/filter states

The Tree instance maintains:
- `selectedNodes` - List of currently selected nodes
- `checkedNodes` - List of currently checked nodes
- `activeElement` - Currently focused node for keyboard nav

### Testing

Tests use Jest with Vue Test Utils. Test files live in `tests/` mirroring the `src/` structure. The jest.config.js is set up to collect coverage from all src files.
