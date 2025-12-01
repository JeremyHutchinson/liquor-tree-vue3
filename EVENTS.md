# Events Documentation

Liquor Tree emits events for all user interactions and state changes. This allows you to respond to tree changes in your application.

## Table of Contents

- [Listening to Events](#listening-to-events)
- [Selection Events](#selection-events)
- [Checkbox Events](#checkbox-events)
- [Node State Events](#node-state-events)
- [Node Data Events](#node-data-events)
- [Tree Structure Events](#tree-structure-events)
- [Filter Events](#filter-events)
- [Drag & Drop Events](#drag--drop-events)
- [Event Handler Management](#event-handler-management)

## Listening to Events

Access the tree instance via template ref and use `$on` to listen to events:

```vue
<template>
  <TreeRoot ref="treeRef" :data="treeData" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TreeRoot from 'liquor-tree-vue3'

const treeRef = ref(null)

onMounted(() => {
  const tree = treeRef.value.tree

  // Listen to node selection
  tree.$on('node:selected', (node) => {
    console.log('Node selected:', node.text)
  })

  // Listen to node expansion
  tree.$on('node:expanded', (node) => {
    console.log('Node expanded:', node.text)
  })
})
</script>
```

## Selection Events

### `node:selected`

Emitted when a node is selected (clicked).

**Payload:**
- `node` (Node) - The selected node

**Example:**
```javascript
tree.$on('node:selected', (node) => {
  console.log(`Selected: ${node.text}`)
  console.log(`Node ID: ${node.id}`)
})
```

### `node:unselected`

Emitted when a node is explicitly unselected.

**Payload:**
- `node` (Node) - The unselected node

**Example:**
```javascript
tree.$on('node:unselected', (node) => {
  console.log(`Unselected: ${node.text}`)
})
```

**Note:** In single-selection mode, selecting a new node automatically unselects the previous one, but this happens through state management rather than emitting an unselect event for the previous node.

## Checkbox Events

### `node:checked`

Emitted when a node's checkbox is checked.

**Payload:**
- `node` (Node) - The checked node

**Example:**
```javascript
tree.$on('node:checked', (node) => {
  console.log(`Checked: ${node.text}`)

  // Get all checked nodes
  const checked = tree.checkedNodes
  console.log(`Total checked: ${checked.length}`)
})
```

### `node:unchecked`

Emitted when a node's checkbox is unchecked.

**Payload:**
- `node` (Node) - The unchecked node

**Example:**
```javascript
tree.$on('node:unchecked', (node) => {
  console.log(`Unchecked: ${node.text}`)
})
```

## Node State Events

### `node:expanded`

Emitted when a node is expanded (opened to show children).

**Payload:**
- `node` (Node) - The expanded node

**Example:**
```javascript
tree.$on('node:expanded', (node) => {
  console.log(`Expanded: ${node.text}`)
  console.log(`Children count: ${node.children.length}`)
})
```

### `node:collapsed`

Emitted when a node is collapsed (closed to hide children).

**Payload:**
- `node` (Node) - The collapsed node

**Example:**
```javascript
tree.$on('node:collapsed', (node) => {
  console.log(`Collapsed: ${node.text}`)
})
```

### `node:focused`

Emitted when a node receives focus (for keyboard navigation).

**Payload:**
- `node` (Node) - The focused node

**Example:**
```javascript
tree.$on('node:focused', (node) => {
  console.log(`Focused: ${node.text}`)

  // Scroll into view
  const element = document.querySelector(`[data-id="${node.id}"]`)
  element?.scrollIntoView({ block: 'nearest' })
})
```

## Node Data Events

### `node:text:changed`

Emitted when a node's text property changes.

**Payload:**
- `node` (Node) - The node whose text changed
- `newText` (string) - The new text value
- `oldText` (string) - The previous text value

**Example:**
```javascript
tree.$on('node:text:changed', (node, newText, oldText) => {
  console.log(`Text changed from "${oldText}" to "${newText}"`)
})
```

### `node:data:changed`

Emitted when a node's custom data changes via `setData()`.

**Payload:**
- `node` (Node) - The node whose data changed
- `data` (object) - The new data object

**Example:**
```javascript
tree.$on('node:data:changed', (node, data) => {
  console.log(`Data updated for ${node.text}:`, data)
})
```

## Tree Structure Events

### `node:removed`

Emitted when a node is removed from the tree.

**Payload:**
- `node` (Node) - The removed node

**Example:**
```javascript
tree.$on('node:removed', (node) => {
  console.log(`Removed: ${node.text}`)

  // Sync with backend
  await api.deleteNode(node.id)
})
```

**Note:** The `node:child:added`, `node:inserted:before`, and `node:inserted:after` events are available but require Node instances to be created first. See the Tree API documentation for details on programmatic node manipulation.

## Filter Events

### `tree:filtered`

Emitted when the tree is filtered or the filter is cleared.

**Payload:**
- `matches` (Node[]) - Array of nodes that match the filter (empty if filter cleared)
- `query` (string) - The filter query string (empty string if filter cleared)

**Example:**
```javascript
tree.$on('tree:filtered', (matches, query) => {
  if (query) {
    console.log(`Found ${matches.length} matches for "${query}"`)
  } else {
    console.log('Filter cleared')
  }
})
```

## Drag & Drop Events

### `node:dragstart`

Emitted when a node starts being dragged.

**Payload:**
- `node` (Node) - The node being dragged

**Example:**
```javascript
tree.$on('node:dragstart', (node) => {
  console.log(`Started dragging: ${node.text}`)
})
```

### `node:dropped`

Emitted when a dragged node is successfully dropped.

**Payload:**
- `dragNode` (Node) - The node that was dragged
- `targetNode` (Node) - The node it was dropped on/near
- `placement` (string) - Where it was dropped: 'before', 'after', or 'inside'

**Example:**
```javascript
tree.$on('node:dropped', (dragNode, targetNode, placement) => {
  console.log(`Dropped "${dragNode.text}" ${placement} "${targetNode.text}"`)

  // Sync with backend
  await api.moveNode(dragNode.id, targetNode.id, placement)
})
```

## Event Handler Management

### $on(event, handler)

Register an event handler that will be called every time the event is emitted.

```javascript
const handler = (node) => {
  console.log('Node selected:', node.text)
}

tree.$on('node:selected', handler)
```

### $once(event, handler)

Register an event handler that will be called only once, then automatically removed.

```javascript
tree.$once('node:selected', (node) => {
  console.log('First selection:', node.text)
})
```

### $off(event, handler)

Remove a specific event handler.

```javascript
const handler = (node) => {
  console.log('Node selected:', node.text)
}

tree.$on('node:selected', handler)

// Later, remove the handler
tree.$off('node:selected', handler)
```

### $off(event)

Remove all handlers for a specific event.

```javascript
// Remove all 'node:selected' handlers
tree.$off('node:selected')
```

## Complete Example

Here's a comprehensive example showing multiple events in use:

```vue
<template>
  <div class="tree-container">
    <div class="status">
      <p>Selected: {{ selectedNode?.text || 'None' }}</p>
      <p>Checked: {{ checkedCount }}</p>
      <p>Last action: {{ lastAction }}</p>
    </div>

    <TreeRoot
      ref="treeRef"
      :data="treeData"
      :options="{ checkbox: true, dnd: { enabled: true } }"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import TreeRoot from 'liquor-tree-vue3'

const treeRef = ref(null)
const selectedNode = ref(null)
const checkedCount = ref(0)
const lastAction = ref('')

const treeData = [
  {
    text: 'Root 1',
    children: [
      { text: 'Child 1.1' },
      { text: 'Child 1.2' }
    ]
  },
  { text: 'Root 2' }
]

onMounted(() => {
  const tree = treeRef.value.tree

  // Selection
  tree.$on('node:selected', (node) => {
    selectedNode.value = node
    lastAction.value = `Selected "${node.text}"`
  })

  tree.$on('node:unselected', (node) => {
    if (selectedNode.value === node) {
      selectedNode.value = null
    }
    lastAction.value = `Unselected "${node.text}"`
  })

  // Checkboxes
  tree.$on('node:checked', (node) => {
    checkedCount.value = tree.checkedNodes.length
    lastAction.value = `Checked "${node.text}"`
  })

  tree.$on('node:unchecked', (node) => {
    checkedCount.value = tree.checkedNodes.length
    lastAction.value = `Unchecked "${node.text}"`
  })

  // Expansion
  tree.$on('node:expanded', (node) => {
    lastAction.value = `Expanded "${node.text}"`
  })

  tree.$on('node:collapsed', (node) => {
    lastAction.value = `Collapsed "${node.text}"`
  })

  // Drag & Drop
  tree.$on('node:dropped', (dragNode, targetNode, placement) => {
    lastAction.value = `Moved "${dragNode.text}" ${placement} "${targetNode.text}"`

    // Optionally sync with backend
    syncTreeStructure()
  })

  // Filtering
  tree.$on('tree:filtered', (matches, query) => {
    if (query) {
      lastAction.value = `Filtered: ${matches.length} matches`
    } else {
      lastAction.value = 'Filter cleared'
    }
  })
})

async function syncTreeStructure() {
  // Save tree structure to backend
  console.log('Syncing tree structure...')
}
</script>
```

## Event Flow Diagrams

### Selection Flow (Single Selection Mode)
```
User clicks Node B
  ↓
Node B.select() called
  ↓
Tree auto-unselects Node A (if selected)
  ↓
Tree emits 'node:selected' for Node B
  ↓
Your handler executes
```

### Checkbox Flow (with autoCheckChildren)
```
User checks Parent Node
  ↓
Parent.check() called
  ↓
Tree emits 'node:checked' for Parent
  ↓
If autoCheckChildren: Children are checked automatically
  ↓
Parent state updates (indeterminate/checked)
```

### Filter Flow
```
User types in filter input
  ↓
tree.filter(query) called
  ↓
Tree marks matching nodes as visible
  ↓
Tree emits 'tree:filtered' with matches array
  ↓
Component re-renders showing only matches
```

## Best Practices

1. **Always remove event handlers** when your component unmounts to prevent memory leaks:
   ```javascript
   onUnmounted(() => {
     tree.$off('node:selected', myHandler)
   })
   ```

2. **Use $once for initialization** when you only need to handle an event once:
   ```javascript
   tree.$once('node:selected', (node) => {
     // Show welcome tooltip on first selection
     showTooltip('You can select nodes by clicking them')
   })
   ```

3. **Batch updates** when handling multiple events:
   ```javascript
   let updateTimer
   tree.$on('node:checked', () => {
     clearTimeout(updateTimer)
     updateTimer = setTimeout(() => {
       saveCheckedNodes(tree.checkedNodes)
     }, 500) // Debounce by 500ms
   })
   ```

4. **Check node state** before making assumptions:
   ```javascript
   tree.$on('node:selected', (node) => {
     // Good: Check before accessing children
     if (node.hasChildren()) {
       node.expand()
     }
   })
   ```

## TypeScript Support

All events include proper TypeScript types. Import the types for full IDE support:

```typescript
import type { Node, Tree } from 'liquor-tree-vue3'

onMounted(() => {
  const tree: Tree = treeRef.value.tree

  tree.$on('node:selected', (node: Node) => {
    console.log(node.text) // Full autocomplete support
  })

  tree.$on('node:dropped', (
    dragNode: Node,
    targetNode: Node,
    placement: 'before' | 'after' | 'inside'
  ) => {
    // Type-safe event handling
  })
})
```
