# Liquor Tree Vue 3 - API Reference

Complete API documentation for the Liquor Tree Vue 3 component library.

## Table of Contents

- [Component Props](#component-props)
- [Tree Options](#tree-options)
- [Events](#events)
- [Tree Methods](#tree-methods)
- [Node Methods](#node-methods)
- [Node Properties](#node-properties)
- [TypeScript Types](#typescript-types)

---

## Component Props

### TreeRoot Component

The main `<TreeRoot>` component (or registered as `<tree>`) accepts the following props:

#### `data`
- **Type:** `TreeNodeData[]`
- **Default:** `[]`
- **Description:** Array of tree node data to render
- **Example:**
  ```typescript
  const data = [
    { text: 'Node 1' },
    { text: 'Node 2', children: [
      { text: 'Node 2.1' },
      { text: 'Node 2.2' }
    ]}
  ]
  ```

#### `options`
- **Type:** `TreeOptions`
- **Default:** `{}`
- **Description:** Configuration object for tree behavior
- **See:** [Tree Options](#tree-options) for detailed options

---

## Tree Options

Configuration object passed to the `options` prop. All options are optional.

### Selection Options

#### `multiple`
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Allow multiple node selection. When `true`, use Cmd/Ctrl+click to select multiple nodes.

#### `checkbox`
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Show checkboxes next to each node

#### `checkOnSelect`
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Automatically check a node when it's selected

#### `autoCheckChildren`
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Automatically check/uncheck all children when a parent is checked/unchecked

#### `parentSelect`
- **Type:** `boolean`
- **Default:** `true`
- **Description:** Allow parent nodes to be selected

### Interaction Options

#### `keyboardNavigation`
- **Type:** `boolean`
- **Default:** `true`
- **Description:** Enable keyboard navigation (arrow keys, Enter, Space)
  - **Arrow Up/Down:** Navigate between nodes
  - **Arrow Right:** Expand node
  - **Arrow Left:** Collapse node
  - **Enter/Space:** Select/toggle node
  - **Ctrl+A:** Select all (when `multiple: true`)

#### `editing`
- **Type:** `boolean`
- **Default:** `false`
- **Description:** Enable inline editing of node text

#### `dnd`
- **Type:** `boolean | DragAndDropOptions`
- **Default:** `false`
- **Description:** Enable drag-and-drop functionality. Can be a boolean or a configuration object.
- **Example:**
  ```typescript
  dnd: {
    enabled: true,
    onDragStart: (node, event) => {
      console.log('Dragging:', node.text)
      return true // Return false to cancel drag
    },
    onDrop: (targetNode, draggedNode, placement) => {
      console.log('Dropped:', draggedNode.text, placement, targetNode.text)
      return true // Return false to cancel drop
    }
  }
  ```

### Data Options

#### `fetchData`
- **Type:** `string | ((node: Node) => Promise<TreeNodeData[]>)`
- **Default:** `undefined`
- **Description:** URL or function to fetch child nodes lazily. Mark nodes with `isBatch: true` to enable lazy loading.
- **Example:**
  ```typescript
  // Using URL
  fetchData: '/api/tree-nodes'

  // Using function
  fetchData: async (node) => {
    const response = await fetch(`/api/nodes/${node.id}/children`)
    return response.json()
  }
  ```

#### `onFetchError`
- **Type:** `(error: Error, node: Node) => void`
- **Default:** `undefined`
- **Description:** Error handler for async data loading failures

### Display Options

#### `filter`
- **Type:** `FilterOptions`
- **Default:**
  ```typescript
  {
    emptyText: 'Nothing found',
    matcher: (query, node) => node.text.toLowerCase().includes(query.toLowerCase()),
    plainList: false,
    showChildren: true
  }
  ```
- **Description:** Filter configuration
  - **emptyText:** Text shown when no matches found
  - **matcher:** Custom function to match nodes `(query: string, node: Node) => boolean`
  - **plainList:** Show matches as flat list (no hierarchy)
  - **showChildren:** Show children of matched nodes

#### `sort`
- **Type:** `SortOptions`
- **Default:** `undefined`
- **Description:** Sort configuration
  - **comparator:** Custom sort function `(a: Node, b: Node) => number`
  - **deep:** Sort children recursively

#### `propertyNames`
- **Type:** `PropertyNames`
- **Default:** `undefined`
- **Description:** Custom property name mapping for your data structure
- **Example:**
  ```typescript
  propertyNames: {
    text: 'label',      // Use 'label' instead of 'text'
    children: 'items',  // Use 'items' instead of 'children'
    id: 'nodeId'        // Use 'nodeId' instead of 'id'
  }
  ```

#### `emptyText`
- **Type:** `string`
- **Default:** `undefined`
- **Description:** Text to display when tree is empty

---

## Events

All events are emitted through the Tree instance and can be listened to via `tree.$on()`.

### Node Selection Events

#### `node:selected`
- **Payload:** `Node`
- **Description:** Fired when a node is selected
- **Example:**
  ```typescript
  tree.$on('node:selected', (node) => {
    console.log('Selected:', node.text)
  })
  ```

#### `node:unselected`
- **Payload:** `Node`
- **Description:** Fired when a node is unselected

### Node Checkbox Events

#### `node:checked`
- **Payload:** `Node`
- **Description:** Fired when a node is checked

#### `node:unchecked`
- **Payload:** `Node`
- **Description:** Fired when a node is unchecked

### Node Expansion Events

#### `node:expanded`
- **Payload:** `Node`
- **Description:** Fired when a node is expanded. Used for lazy loading.

#### `node:collapsed`
- **Payload:** `Node`
- **Description:** Fired when a node is collapsed

### Node Data Events

#### `node:text:changed`
- **Payload:** `Node, newText: string, oldText: string`
- **Description:** Fired when node text is changed

#### `node:data:changed`
- **Payload:** `Node, data: Record<string, any>`
- **Description:** Fired when node data is updated via `setData()`

### Node Tree Events

#### `node:removed`
- **Payload:** `Node`
- **Description:** Fired when a node is removed from the tree

#### `node:child:added`
- **Payload:** `Node, childNode: Node`
- **Description:** Fired when a child is appended to a node

#### `node:inserted:before`
- **Payload:** `Node, insertedNode: Node`
- **Description:** Fired when a node is inserted before another node

#### `node:inserted:after`
- **Payload:** `Node, insertedNode: Node`
- **Description:** Fired when a node is inserted after another node

#### `node:focused`
- **Payload:** `Node`
- **Description:** Fired when a node receives focus (becomes activeElement)

### Tree Events

#### `tree:filtered`
- **Payload:** `Node[], query: string`
- **Description:** Fired when tree is filtered. Empty array when filter is cleared.

---

## Tree Methods

Access the Tree instance via component ref:

```typescript
<TreeRoot ref="treeRef" :data="data" />

// In setup()
const treeRef = ref()
const tree = computed(() => treeRef.value?.tree)

// Use tree methods
tree.value.select(node)
```

### Selection Methods

#### `select(node: Node, extendSelection?: boolean): void`
Select a node. If `extendSelection` is true and `multiple` is enabled, adds to selection.

#### `unselect(node: Node): void`
Unselect a specific node.

#### `unselectAll(): void`
Unselect all nodes.

### Checkbox Methods

#### `check(node: Node): void`
Check a node (requires `checkbox: true` option).

#### `uncheck(node: Node): void`
Uncheck a specific node.

#### `uncheckAll(): void`
Uncheck all nodes.

### Search Methods

#### `find(query: string | number | ((node: Node) => boolean)): Node | null`
Find a single node by ID or predicate function.

```typescript
// Find by ID
const node = tree.find('node-123')

// Find by predicate
const node = tree.find(node => node.text === 'My Node')
```

#### `findAll(predicate: (node: Node) => boolean): Node[]`
Find all nodes matching a predicate.

```typescript
const selectedNodes = tree.findAll(node => node.selected())
const disabledNodes = tree.findAll(node => node.disabled())
```

### Filtering Methods

#### `filter(query: string): Node[]`
Filter the tree and return matching nodes. Uses the `filter.matcher` option.

```typescript
const matches = tree.filter('search term')
```

#### `clearFilter(): Node[]`
Clear the current filter and show all nodes.

### Sorting Methods

#### `sort(compareFn: (a: Node, b: Node) => number, deep?: boolean): void`
Sort the tree with a custom comparator. If `deep` is true, recursively sorts children.

```typescript
// Sort alphabetically
tree.sort((a, b) => a.text.localeCompare(b.text), true)

// Sort by custom property
tree.sort((a, b) => a.data.priority - b.data.priority)
```

### Navigation Methods

#### `nextVisibleNode(node: Node): Node | null`
Get the next visible node in the tree (respects expanded/collapsed state and filters).

#### `prevVisibleNode(node: Node): Node | null`
Get the previous visible node in the tree.

### Traversal Methods

#### `recurseDown(fn: (node: Node) => void): void`
Traverse all nodes in the tree depth-first.

```typescript
tree.recurseDown(node => {
  console.log(node.text, node.depth)
})
```

### Event Methods

#### `$on(event: string, handler: Function): void`
Register an event handler.

#### `$once(event: string, handler: Function): void`
Register a one-time event handler (auto-removes after first call).

#### `$off(event: string, handler?: Function): void`
Remove an event handler. If no handler specified, removes all handlers for the event.

#### `$emit(event: string, ...args: any[]): void`
Emit a custom event (typically used internally).

### Utility Methods

#### `isNode(obj: any): obj is Node`
Check if an object is a Node instance.

---

## Node Methods

Methods available on each Node instance.

### Selection Methods

#### `select(extendSelection?: boolean): void`
Select this node.

#### `unselect(): void`
Unselect this node.

#### `toggleSelect(): void`
Toggle selection state.

### Expansion Methods

#### `expand(): void`
Expand this node (show children).

#### `collapse(): void`
Collapse this node (hide children).

#### `toggleExpand(): void`
Toggle expand/collapse state.

### Checkbox Methods

#### `check(): void`
Check this node (requires `checkbox: true` option).

#### `uncheck(): void`
Uncheck this node.

### Data Methods

#### `setData(data: Record<string, any>): Record<string, any>`
Merge data into node's data object and emit `node:data:changed` event.

```typescript
node.setData({ priority: 1, color: 'red' })
```

### Tree Manipulation Methods

#### `append(node: Node): void`
Append a node as a child of this node.

#### `insertBefore(node: Node): void`
Insert a node before this node (as sibling).

#### `insertAfter(node: Node): void`
Insert a node after this node (as sibling).

#### `remove(): void`
Remove this node from the tree.

### Traversal Methods

#### `recurseUp(fn: (node: Node) => boolean | void, node?: Node): void`
Traverse up the tree from this node to root. Return `false` from `fn` to stop traversal.

```typescript
// Get all parent IDs
const parentIds = []
node.recurseUp(parent => {
  parentIds.push(parent.id)
})
```

#### `recurseDown(fn: (node: Node) => void, ignoreThis?: boolean): void`
Traverse down the tree from this node. Set `ignoreThis: true` to skip this node.

```typescript
// Count all descendants
let count = 0
node.recurseDown(() => count++, true) // true = skip the node itself
```

#### `getPath(): Node[]`
Get array of nodes from this node to root.

```typescript
const path = node.getPath()
console.log(path.map(n => n.text).join(' > '))
// Output: "Child > Parent > Root"
```

### State Query Methods

#### `selected(): boolean`
Check if node is selected.

#### `checked(): boolean`
Check if node is checked.

#### `expanded(): boolean`
Check if node is expanded.

#### `collapsed(): boolean`
Check if node is collapsed (opposite of expanded).

#### `disabled(): boolean`
Check if node is disabled.

#### `selectable(): boolean`
Check if node can be selected (not disabled and selectable state is not false).

#### `editable(): boolean`
Check if node is editable (not disabled and editable state is true).

#### `indeterminate(): boolean`
Check if node is in indeterminate state (some children checked).

#### `isDraggable(): boolean`
Check if node can be dragged.

#### `isDropable(): boolean`
Check if node can accept drops.

#### `hasChildren(): boolean`
Check if node has children.

### Utility Methods

#### `focus(): void`
Set this node as the active element (keyboard focus).

#### `first(): Node | null`
Get the first child node (or null if no children).

#### `state(name: string): boolean | undefined`
Get a state value.

#### `state(name: string, value: boolean): this`
Set a state value (chainable).

```typescript
node.state('disabled', true)
    .state('selectable', false)
```

---

## Node Properties

### Core Properties

#### `id: string | number`
Unique identifier for the node.

#### `text: string`
Node display text. Setting this property emits `node:text:changed` event.

#### `data: Record<string, any>`
Custom data object attached to the node.

#### `children: Node[]`
Array of child nodes.

#### `parent: Node | null`
Parent node reference (null for root nodes).

#### `tree: Tree`
Reference to the Tree instance.

#### `isBatch: boolean`
Flag indicating this node loads children asynchronously.

#### `isEditing: boolean`
Flag indicating node is currently being edited.

#### `showChildren: boolean`
Flag controlling child visibility (internal use).

### State Properties

Access via `node.state(name)` or `node.state(name, value)`:

- `selected` - Node is selected
- `selectable` - Node can be selected
- `checked` - Node checkbox is checked
- `expanded` - Node is expanded (children visible)
- `collapsed` - Node is collapsed
- `disabled` - Node is disabled (cannot interact)
- `visible` - Node is visible (not filtered out)
- `indeterminate` - Checkbox in indeterminate state
- `matched` - Node matches current filter
- `editable` - Node text can be edited
- `dragging` - Node is currently being dragged
- `draggable` - Node can be dragged
- `dropable` - Node can accept drops
- `loading` - Node is loading children

### Computed Properties

#### `depth: number`
Depth of node in tree (0 for root nodes).

#### `key: string`
Unique key combining id and text (used by Vue for rendering).

---

## TypeScript Types

### TreeNodeData

Input data format for creating tree nodes:

```typescript
interface TreeNodeData {
  id?: string | number
  text: string
  children?: TreeNodeData[]
  state?: Partial<NodeState>
  data?: Record<string, any>
  isBatch?: boolean
  [key: string]: any  // Additional properties allowed
}
```

### TreeOptions

Configuration object (see [Tree Options](#tree-options) for details):

```typescript
interface TreeOptions {
  // Selection
  multiple?: boolean
  checkbox?: boolean
  checkOnSelect?: boolean
  autoCheckChildren?: boolean
  parentSelect?: boolean

  // Interaction
  keyboardNavigation?: boolean
  editing?: boolean
  dnd?: boolean | DragAndDropOptions

  // Data
  fetchData?: string | ((node: Node) => Promise<TreeNodeData[]>)
  onFetchError?: (error: Error, node: Node) => void

  // Display
  filter?: FilterOptions
  sort?: SortOptions
  propertyNames?: PropertyNames
  emptyText?: string

  [key: string]: any  // Additional options allowed
}
```

### DragAndDropOptions

```typescript
interface DragAndDropOptions {
  enabled?: boolean
  onDragStart?: (node: Node, event: DragEvent) => boolean
  onDragEnd?: (node: Node, event: DragEvent) => void
  onDrop?: (targetNode: Node, draggedNode: Node, placement: DropPlacement) => boolean
}

type DropPlacement = 'before' | 'after' | 'inside'
```

### FilterOptions

```typescript
interface FilterOptions {
  emptyText?: string
  matcher?: (query: string, node: Node) => boolean
  plainList?: boolean
  showChildren?: boolean
}
```

### SortOptions

```typescript
interface SortOptions {
  comparator?: (a: Node, b: Node) => number
  deep?: boolean
}
```

### PropertyNames

```typescript
interface PropertyNames {
  text?: string
  children?: string
  state?: string
  data?: string
  id?: string
  [key: string]: string | undefined
}
```

### NodeState

```typescript
interface NodeState {
  selected: boolean
  selectable: boolean
  checked: boolean
  expanded: boolean
  collapsed: boolean
  disabled: boolean
  visible: boolean
  indeterminate: boolean
  matched: boolean
  editable: boolean
  dragging: boolean
  draggable: boolean
  dropable: boolean
  loading: boolean
}
```

---

## Custom Rendering

Use the default slot to customize node rendering:

```vue
<TreeRoot :data="data">
  <template #default="{ node }">
    <span :style="{ color: node.data.color }">
      {{ node.text }}
    </span>
    <button @click.stop="handleAction(node)">Action</button>
  </template>
</TreeRoot>
```

The slot receives a `node` prop containing the Node instance.

---

## Usage Example

Complete example showing common features:

```vue
<template>
  <TreeRoot
    ref="treeRef"
    :data="treeData"
    :options="treeOptions"
  >
    <template #default="{ node }">
      <span>{{ node.text }}</span>
      <span v-if="node.data.badge">{{ node.data.badge }}</span>
    </template>
  </TreeRoot>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { TreeRoot } from 'liquor-tree-vue3'

const treeRef = ref()

const treeData = [
  {
    text: 'Parent 1',
    state: { expanded: true },
    children: [
      { text: 'Child 1.1', data: { badge: '🔥' } },
      { text: 'Child 1.2' }
    ]
  },
  {
    text: 'Parent 2',
    isBatch: true  // Lazy load children
  }
]

const treeOptions = {
  multiple: true,
  checkbox: true,
  autoCheckChildren: true,
  dnd: {
    enabled: true,
    onDrop: (target, dragged, placement) => {
      console.log(`Dropped ${dragged.text} ${placement} ${target.text}`)
      return true
    }
  },
  fetchData: async (node) => {
    const response = await fetch(`/api/nodes/${node.id}/children`)
    return response.json()
  }
}

onMounted(() => {
  const tree = treeRef.value?.tree

  // Listen to events
  tree.$on('node:selected', (node) => {
    console.log('Selected:', node.text)
  })

  // Programmatic operations
  const node = tree.find(n => n.text === 'Child 1.1')
  node?.select()

  // Filter
  tree.filter('Parent')
})
</script>
```

---

For more examples, see the [demo site](https://github.com/your-repo/liquor-tree-vue3) or run `npm run dev`.
