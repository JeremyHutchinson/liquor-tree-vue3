# Developer Documentation Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a complete `docs/` folder with an index and 11 feature-specific markdown files documenting every feature shown in the demo app, written for library consumers integrating liquor-tree-vue3 into Vue 3 apps.

**Architecture:** One markdown file per demo tab, each with: overview, working Vue 3 code example (from demo tab source), options reference table, and events reference table. A `docs/README.md` index links all of them. The root `README.md` is updated to point there.

**Tech Stack:** Markdown, Vue 3 `<script setup>` syntax, TypeScript types from `src/types/index.ts`

**Key source files to read before writing:**
- `demo/src/components/<Tab>.vue` — actual working code to adapt into examples
- `src/types/index.ts` — authoritative options and type definitions

---

### Task 1: Create `docs/README.md` — The Navigation Index

**Files:**
- Create: `docs/README.md`

**Step 1: Write the file**

```markdown
# Liquor Tree Vue 3 — Documentation

A Vue 3 tree component with drag & drop, filtering, sorting, keyboard navigation, async data, and more.

## Installation

```bash
npm install liquor-tree-vue3
```

## Minimal Usage

```vue
<template>
  <TreeRoot :data="items" />
</template>

<script setup lang="ts">
import TreeRoot from 'liquor-tree-vue3'
import type { TreeNodeData } from 'liquor-tree-vue3'

const items: TreeNodeData[] = [
  { text: 'Item 1' },
  { text: 'Item 2', children: [
    { text: 'Item 2.1' },
    { text: 'Item 2.2' }
  ]}
]
</script>
```

## Features

| Feature | Description | Doc |
|---------|-------------|-----|
| [Basic Tree](./basic.md) | Hierarchical data display with expand/collapse | [basic.md](./basic.md) |
| [Selection](./selection.md) | Single and multi-select with keyboard modifiers | [selection.md](./selection.md) |
| [Checkboxes](./checkboxes.md) | Checkbox mode with cascading check and indeterminate state | [checkboxes.md](./checkboxes.md) |
| [Filter](./filter.md) | Real-time search/filter with customizable matcher | [filter.md](./filter.md) |
| [Sorting](./sorting.md) | Sort nodes with a custom comparator, shallow or deep | [sorting.md](./sorting.md) |
| [Keyboard Navigation](./keyboard.md) | Arrow key navigation, expand/collapse, focus | [keyboard.md](./keyboard.md) |
| [Inline Editing](./editing.md) | Double-click or F2 to rename nodes in place | [editing.md](./editing.md) |
| [Drag & Drop](./drag-drop.md) | Reorder and reparent nodes by dragging | [drag-drop.md](./drag-drop.md) |
| [Async Data](./async.md) | Lazy-load children on demand via `fetchData` | [async.md](./async.md) |
| [Custom Rendering](./custom-rendering.md) | Full control over node appearance via scoped slots | [custom-rendering.md](./custom-rendering.md) |
| [Events](./events.md) | Event system reference for all tree interactions | [events.md](./events.md) |
```

**Step 2: Verify**

Open the file and confirm:
- All 11 feature links are present
- Getting-started snippet uses `<script setup>` with TypeScript
- Installation command is correct

**Step 3: Commit**

```bash
git add docs/README.md
git commit -m "docs: add documentation index with feature table and getting started"
```

---

### Task 2: Create `docs/basic.md` — Basic Tree Usage

**Files:**
- Create: `docs/basic.md`
- Reference: `demo/src/components/BasicTab.vue`, `src/types/index.ts`

**Step 1: Write the file**

Content to include:

1. **Overview** — A tree displays hierarchical data. Nodes can be expanded/collapsed. Initial state (expanded, selected, etc.) is set via the `state` field.

2. **Basic Usage** — Adapt from `BasicTab.vue`. Show `TreeNodeData[]` with `text`, `children`, `state: { expanded: true }`.

3. **TreeNodeData shape** — Full interface table:

| Field | Type | Description |
|-------|------|-------------|
| `text` | `string` | Display label (required) |
| `id` | `string \| number` | Optional unique identifier |
| `children` | `TreeNodeData[]` | Child nodes |
| `state` | `Partial<NodeState>` | Initial visual/behavioral state |
| `data` | `Record<string, any>` | Arbitrary metadata accessible in slots |
| `isBatch` | `boolean` | If true, children are loaded async (see Async doc) |

4. **NodeState fields** table:

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `expanded` | `boolean` | `false` | Node is open, children visible |
| `selected` | `boolean` | `false` | Node is selected |
| `checked` | `boolean` | `false` | Checkbox is checked |
| `disabled` | `boolean` | `false` | Node is non-interactive |
| `selectable` | `boolean` | `true` | Node can be selected |
| `visible` | `boolean` | `true` | Node is shown |
| `draggable` | `boolean` | `true` | Node can be dragged |
| `dropable` | `boolean` | `true` | Node accepts drops |

5. **No events specific** — expansion events are covered in the Events doc; link to it.

**Step 2: Verify** — Check the code example is complete and runnable on its own.

**Step 3: Commit**

```bash
git add docs/basic.md
git commit -m "docs: add basic tree usage documentation"
```

---

### Task 3: Create `docs/selection.md` — Selection

**Files:**
- Create: `docs/selection.md`
- Reference: `demo/src/components/SelectionTab.vue`

**Step 1: Write the file**

1. **Overview** — Nodes can be selected by clicking. Single-select is default. With `multiple: true`, users can Ctrl/Cmd+click to add to selection or Shift+click for range selection.

2. **Single Selection example** — From `SelectionTab.vue` `treeOptions = { multiple: false }`.

3. **Multiple Selection example** — From `SelectionTab.vue` `multiSelectOptions = { multiple: true }`. Include the keyboard modifier instructions.

4. **Options table:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `multiple` | `boolean` | `false` | Allow multiple nodes selected simultaneously |
| `parentSelect` | `boolean` | `false` | Clicking a parent also selects all children |
| `checkOnSelect` | `boolean` | `false` | Selecting a node also checks its checkbox |

5. **Events table:**

| Event | Payload | Description |
|-------|---------|-------------|
| `node:selected` | `node: Node` | Fires when a node is selected |
| `node:unselected` | `node: Node` | Fires when a node is deselected |

6. **Listening to events example** — Short snippet using `ref="treeRef"` and `treeRef.value?.tree.$on(...)`.

**Step 2: Verify** — Confirm options table matches `src/types/index.ts` `TreeOptions`.

**Step 3: Commit**

```bash
git add docs/selection.md
git commit -m "docs: add selection feature documentation"
```

---

### Task 4: Create `docs/checkboxes.md` — Checkboxes

**Files:**
- Create: `docs/checkboxes.md`
- Reference: `demo/src/components/CheckboxTab.vue`

**Step 1: Write the file**

1. **Overview** — Enable `checkbox: true` to show checkboxes on every node. With `autoCheckChildren: true`, checking a parent checks all its descendants. Parents show an indeterminate state (−) when only some children are checked.

2. **Basic example** — From `CheckboxTab.vue`. Show both `checkbox: true` and `autoCheckChildren: true` in `options`.

3. **Options table:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `checkbox` | `boolean` | `false` | Show checkboxes on all nodes |
| `autoCheckChildren` | `boolean` | `false` | Checking a parent auto-checks all descendants |
| `checkOnSelect` | `boolean` | `false` | Selecting a node also checks its checkbox |

4. **Events table:**

| Event | Payload | Description |
|-------|---------|-------------|
| `node:checked` | `node: Node` | Fires when a node's checkbox is checked |
| `node:unchecked` | `node: Node` | Fires when a node's checkbox is unchecked |

**Step 2: Verify** — Confirm `autoCheckChildren` is spelled correctly in types.

**Step 3: Commit**

```bash
git add docs/checkboxes.md
git commit -m "docs: add checkboxes feature documentation"
```

---

### Task 5: Create `docs/filter.md` — Filter & Search

**Files:**
- Create: `docs/filter.md`
- Reference: `demo/src/components/FilterTab.vue`

**Step 1: Write the file**

1. **Overview** — Call `tree.filter(query)` to show only matching nodes and their ancestors. Call `tree.clearFilter()` to restore the full tree. A custom `matcher` function can replace the default text-match logic.

2. **Basic example** — From `FilterTab.vue`. Show the `ref="filterTreeRef"` pattern, `handleFilter` and `clearFilter` functions, and `filterOptions` with `filter.emptyText` and `filter.showChildren`.

3. **Options table (`filter` key):**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `filter.emptyText` | `string` | `'No results'` | Message shown when no nodes match |
| `filter.showChildren` | `boolean` | `false` | Also show children of matched nodes |
| `filter.plainList` | `boolean` | `false` | Display matches as a flat list instead of tree |
| `filter.matcher` | `(query: string, node: Node) => boolean` | text substring match | Custom match function |

4. **Tree methods:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `tree.filter` | `(query: string \| RegExp \| Function) => void` | Apply filter |
| `tree.clearFilter` | `() => void` | Remove filter and show all nodes |

5. **Events table:**

| Event | Payload | Description |
|-------|---------|-------------|
| `tree:filtered` | `(matches: Node[], query: string)` | Fires after each filter operation |

6. **Custom matcher example** — A short snippet showing a `matcher` that matches on `node.data` fields.

**Step 2: Verify** — Check `FilterOptions` interface in `src/types/index.ts`.

**Step 3: Commit**

```bash
git add docs/filter.md
git commit -m "docs: add filter and search feature documentation"
```

---

### Task 6: Create `docs/sorting.md` — Sorting

**Files:**
- Create: `docs/sorting.md`
- Reference: `demo/src/components/SortingTab.vue`

**Step 1: Write the file**

1. **Overview** — Call `tree.sort(comparator, deep)` to sort the tree. Without `deep: true`, only top-level nodes are sorted. Pass any comparator function — typically using `String.localeCompare`.

2. **Basic example** — From `SortingTab.vue`. Show the four button patterns (A-Z shallow, Z-A shallow, A-Z deep, Z-A deep).

3. **Tree method:**

| Method | Signature | Description |
|--------|-----------|-------------|
| `tree.sort` | `(comparator: (a: Node, b: Node) => number, deep?: boolean) => void` | Sort tree nodes |

4. **Note on reactivity** — Resetting to original order requires re-setting `:data` binding (show the `JSON.parse(JSON.stringify(original))` pattern from the demo).

**Step 2: Verify** — Confirm `sort` method exists on Tree in `src/core/Tree.ts`.

**Step 3: Commit**

```bash
git add docs/sorting.md
git commit -m "docs: add sorting feature documentation"
```

---

### Task 7: Create `docs/keyboard.md` — Keyboard Navigation

**Files:**
- Create: `docs/keyboard.md`
- Reference: `demo/src/components/KeyboardTab.vue`

**Step 1: Write the file**

1. **Overview** — Keyboard navigation is enabled by default. Click any node to give it focus, then use keyboard shortcuts to navigate.

2. **Keyboard reference table:**

| Key | Action |
|-----|--------|
| `↑` | Move focus to previous visible node |
| `↓` | Move focus to next visible node |
| `←` | Collapse focused node; or move focus to parent |
| `→` | Expand focused node; or move focus to first child |
| `Enter` / `Space` | Toggle checkbox (if `checkbox: true`) |
| `F2` | Start inline editing (if `editing: true`) |

3. **Options table:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `keyboardNavigation` | `boolean` | `true` | Enable/disable keyboard navigation |

4. **Events table:**

| Event | Payload | Description |
|-------|---------|-------------|
| `node:focused` | `node: Node` | Fires when a node receives keyboard focus |

5. **Note** — Keyboard navigation works across all currently visible nodes (respects filter state and collapsed nodes).

**Step 2: Verify** — Check `KeyboardTab.vue` to confirm the listed keys are accurate.

**Step 3: Commit**

```bash
git add docs/keyboard.md
git commit -m "docs: add keyboard navigation documentation"
```

---

### Task 8: Create `docs/editing.md` — Inline Editing

**Files:**
- Create: `docs/editing.md`
- Reference: `demo/src/components/EditingTab.vue`

**Step 1: Write the file**

1. **Overview** — With `editing: true`, users can double-click any node to edit its text inline. Press Enter or click away to save; press Escape to cancel. The `F2` key also triggers editing on the focused node.

2. **Basic example** — From `EditingTab.vue`. Show `options = { editing: true }` and the `node:text:changed` event listener using `treeRef.value?.tree.$on(...)`.

3. **Options table:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `editing` | `boolean` | `false` | Enable inline node text editing |

4. **Events table:**

| Event | Payload | Description |
|-------|---------|-------------|
| `node:text:changed` | `(node: Node, newText: string, oldText: string)` | Fires after text is saved |
| `node:editing:start` | `node: Node` | Fires when editing begins |
| `node:editing:stop` | `node: Node` | Fires when editing ends (save or cancel) |

5. **Keyboard shortcuts:**

| Key | Action |
|-----|--------|
| `Enter` | Save the edited text |
| `Escape` | Cancel and revert to original text |
| `F2` | Start editing the focused node |
| Double-click | Start editing the clicked node |

**Step 2: Verify** — Confirm `editing` option is in `TreeOptions` in types file.

**Step 3: Commit**

```bash
git add docs/editing.md
git commit -m "docs: add inline editing documentation"
```

---

### Task 9: Create `docs/drag-drop.md` — Drag & Drop

**Files:**
- Create: `docs/drag-drop.md`
- Reference: `demo/src/components/DragDropTab.vue`

**Step 1: Write the file**

1. **Overview** — Enable `dnd.enabled: true` to allow nodes to be dragged and dropped. Drag to the top third of a node to insert before it, the bottom third to insert after, or the middle third to make the dragged node a child.

2. **Basic example** — From `DragDropTab.vue`. Show `dndOptions` with `dnd.enabled` and `dnd.onDrop` callback.

3. **Options table (`dnd` key):**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dnd.enabled` | `boolean` | `false` | Enable drag and drop |
| `dnd.onDrop` | `(target: Node, dragged: Node, placement: DropPlacement) => boolean` | — | Called on drop; return `false` to cancel |
| `dnd.onDragStart` | `(node: Node, event: DragEvent) => boolean` | — | Called when drag starts; return `false` to prevent |
| `dnd.onDragEnd` | `(node: Node, event: DragEvent) => void` | — | Called when drag ends |

4. **DropPlacement values:**

| Value | Description |
|-------|-------------|
| `'before'` | Insert as the previous sibling |
| `'after'` | Insert as the next sibling |
| `'inside'` | Insert as a child |

5. **Events table:**

| Event | Payload | Description |
|-------|---------|-------------|
| `node:dragstart` | `node: Node` | Fires when dragging begins |
| `node:dropped` | `(dragNode: Node, targetNode: Node, placement: DropPlacement)` | Fires after a successful drop |

**Step 2: Verify** — Check `DragAndDropOptions` interface in `src/types/index.ts`.

**Step 3: Commit**

```bash
git add docs/drag-drop.md
git commit -m "docs: add drag and drop documentation"
```

---

### Task 10: Create `docs/async.md` — Async Data Loading

**Files:**
- Create: `docs/async.md`
- Reference: `demo/src/components/AsyncTab.vue`

**Step 1: Write the file**

1. **Overview** — Mark nodes with `isBatch: true` to indicate their children should be loaded on demand. Provide a `fetchData` function in options; it receives the node and must return a `Promise<TreeNodeData[]>`. A loading spinner is shown automatically while fetching.

2. **Basic example** — Adapt from `AsyncTab.vue`. Show `isBatch: true` on root nodes, the `asyncOptions.fetchData` async function with simulated delay, and `onFetchError` handler.

3. **Options table:**

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fetchData` | `string \| ((node: Node) => Promise<TreeNodeData[]>)` | — | URL or async function to load children |
| `onFetchError` | `(error: Error, node: Node) => void` | — | Called when `fetchData` throws |

4. **TreeNodeData fields for async:**

| Field | Type | Description |
|-------|------|-------------|
| `isBatch` | `boolean` | Mark node for lazy loading; children fetched on expand |
| `id` | `string \| number` | Passed to `fetchData` via `node.id` so you can identify which node to load |

5. **Note** — A node with `isBatch: true` shows an expand arrow even with no `children` array. Once loaded, the children are cached and `fetchData` is not called again for that node.

**Step 2: Verify** — Confirm the `fetchData` option type matches `src/types/index.ts`.

**Step 3: Commit**

```bash
git add docs/async.md
git commit -m "docs: add async data loading documentation"
```

---

### Task 11: Create `docs/custom-rendering.md` — Custom Rendering

**Files:**
- Create: `docs/custom-rendering.md`
- Reference: `demo/src/components/CustomRenderingTab.vue`

**Step 1: Write the file**

1. **Overview** — Use the `#default` scoped slot to replace the default node label with any HTML. The slot receives the `node` object, giving access to `node.text`, `node.data`, `node.states`, and all node methods.

2. **Slot signature:**

```vue
<TreeRoot :data="items">
  <template #default="{ node }">
    <!-- your custom content here -->
    {{ node.text }}
  </template>
</TreeRoot>
```

3. **Node object in the slot:**

| Property | Type | Description |
|----------|------|-------------|
| `node.text` | `string` | The node's display text |
| `node.data` | `Record<string, any>` | Arbitrary metadata set in `TreeNodeData.data` |
| `node.states` | `NodeState` | All state flags (selected, checked, expanded, etc.) |
| `node.id` | `string \| number` | Node identifier |
| `node.children` | `Node[]` | Child nodes |
| `node.parent` | `Node \| null` | Parent node (null for root nodes) |

4. **Three examples** adapted from `CustomRenderingTab.vue`:
   - **Icons and badges** — emoji icon + count badge from `node.data`
   - **Rich content** — status dot + name + role + email
   - **Conditional styling** — CSS classes bound to `node.data.priority`, `node.data.completed`

5. **Note** — The slot replaces only the label area. The expand/collapse toggle, checkbox, and indent are still rendered by the component.

**Step 2: Verify** — Confirm the slot name is `#default` by checking `src/components/TreeNode.vue` or `NodeContent.vue`.

**Step 3: Commit**

```bash
git add docs/custom-rendering.md
git commit -m "docs: add custom rendering with scoped slots documentation"
```

---

### Task 12: Create `docs/events.md` — Events Reference

**Files:**
- Create: `docs/events.md`
- Reference: `demo/src/components/EventsTab.vue`, `src/types/index.ts`

**Step 1: Write the file**

1. **Overview** — All tree interactions emit events through the `Tree` instance. Access it via a template ref on `<TreeRoot>`. Listen using `tree.$on(eventName, handler)`.

2. **How to listen — pattern:**

```vue
<TreeRoot ref="treeRef" :data="items" :options="opts" />

<script setup>
import { ref, onMounted } from 'vue'
const treeRef = ref(null)

onMounted(() => {
  const tree = treeRef.value?.tree
  if (!tree) return

  tree.$on('node:selected', (node) => {
    console.log('Selected:', node.text)
  })
})
</script>
```

3. **Full events table:**

| Event | Payload | Trigger |
|-------|---------|---------|
| `node:selected` | `node: Node` | Node is selected by click |
| `node:unselected` | `node: Node` | Node is deselected |
| `node:checked` | `node: Node` | Checkbox is checked |
| `node:unchecked` | `node: Node` | Checkbox is unchecked |
| `node:expanded` | `node: Node` | Node is expanded |
| `node:collapsed` | `node: Node` | Node is collapsed |
| `node:focused` | `node: Node` | Node receives keyboard focus |
| `node:text:changed` | `(node, newText, oldText)` | Inline edit saved |
| `node:editing:start` | `node: Node` | Inline editing begins |
| `node:editing:stop` | `node: Node` | Inline editing ends |
| `node:data:changed` | `(node, data)` | Node data updated |
| `node:added` | `node: Node` | Node added to tree |
| `node:removed` | `node: Node` | Node removed from tree |
| `node:dragstart` | `node: Node` | Dragging starts |
| `node:dropped` | `(dragNode, targetNode, placement)` | Node dropped |
| `tree:filtered` | `(matches: Node[], query: string)` | Filter applied or cleared |

4. **Note** — `tree.$on` uses a simple event emitter pattern. Call `tree.$off(eventName, handler)` to remove a specific listener. Clean up in `onUnmounted` to avoid memory leaks.

5. **Cleanup example:**

```js
onMounted(() => {
  const handler = (node) => console.log(node.text)
  tree.$on('node:selected', handler)
  onUnmounted(() => tree.$off('node:selected', handler))
})
```

**Step 2: Verify** — Cross-reference the event list against `EventsTab.vue` and `src/types/index.ts` `TreeEventName`.

**Step 3: Commit**

```bash
git add docs/events.md
git commit -m "docs: add complete events reference documentation"
```

---

### Task 13: Update Root `README.md`

**Files:**
- Modify: `README.md`

**Step 1: Read the current README**

The current README references `npm run storybook` and an old Hexo docs site. Both are outdated.

**Step 2: Replace the stale sections**

Replace the "Live Playground" section and the stale docs link with:

```markdown
## Documentation

Full feature documentation is in the [`docs/`](./docs/README.md) folder:

- [Basic Tree](./docs/basic.md)
- [Selection](./docs/selection.md)
- [Checkboxes](./docs/checkboxes.md)
- [Filter & Search](./docs/filter.md)
- [Sorting](./docs/sorting.md)
- [Keyboard Navigation](./docs/keyboard.md)
- [Inline Editing](./docs/editing.md)
- [Drag & Drop](./docs/drag-drop.md)
- [Async Data](./docs/async.md)
- [Custom Rendering](./docs/custom-rendering.md)
- [Events](./docs/events.md)

## Live Demo

```bash
git clone <repo>
npm install
npm run dev   # opens demo at http://localhost:8081
```
```

Also update the `Usage` section to use Vue 3 `<script setup>` syntax instead of the old Vue 2 Options API example.

**Step 3: Verify** — Read the updated README to confirm no stale references remain.

**Step 4: Commit**

```bash
git add README.md
git commit -m "docs: update README with Vue 3 usage and link to docs folder"
```

---

## Completion Check

After all 13 tasks:

```bash
ls docs/
# Should show: README.md basic.md selection.md checkboxes.md filter.md
#              sorting.md keyboard.md editing.md drag-drop.md
#              async.md custom-rendering.md events.md
#              plans/
```

Run the demo to cross-reference any examples you wrote against actual behavior:

```bash
npm run dev
```
