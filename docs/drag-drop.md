# Drag & Drop

Enable drag and drop by setting `dnd: { enabled: true }` in the tree options. Drag a node to the top third of a target to insert it before, the bottom third to insert it after, or the middle third to nest it as a child. Return `false` from the `onDrop` callback to cancel a drop and leave the tree unchanged.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LiquorTree } from 'liquor-tree'
import type { TreeNodeData, TreeOptions } from 'liquor-tree'

const status = ref('')

const treeData = ref<TreeNodeData[]>([
  {
    text: 'Team Alpha',
    state: { expanded: true },
    children: [
      { text: 'Alice' },
      { text: 'Bob' },
      { text: 'Charlie' }
    ]
  },
  {
    text: 'Team Beta',
    state: { expanded: true },
    children: [
      { text: 'David' },
      { text: 'Eve' }
    ]
  },
  {
    text: 'Team Gamma',
    state: { expanded: true },
    children: [
      { text: 'Frank' },
      { text: 'Grace' },
      { text: 'Henry' }
    ]
  }
])

const options: TreeOptions = {
  dnd: {
    enabled: true,
    onDrop: (target, dragged, placement) => {
      status.value = `Moved "${dragged.text}" ${placement} "${target.text}"`
      return true
    }
  }
}
</script>

<template>
  <div>
    <p v-if="status">{{ status }}</p>
    <LiquorTree :data="treeData" :options="options" />
  </div>
</template>
```

## Drop Placement

When dragging, the target node is divided into three vertical zones. The zone under the cursor determines how the dragged node is inserted relative to the target.

| Value | Zone | Result |
|-------|------|--------|
| `'before'` | Top third of target node | Inserted as previous sibling |
| `'after'` | Bottom third of target node | Inserted as next sibling |
| `'inside'` | Middle third of target node | Inserted as last child |

## Options

Drag and drop is configured through the `dnd` key of the tree `options` prop.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `dnd.enabled` | `boolean` | `false` | Enable drag and drop |
| `dnd.onDrop` | \`(targetNode: Node, draggedNode: Node, placement: DropPlacement) => boolean\` | — | Called when a node is dropped; return `false` to prevent the move |
| `dnd.onDragStart` | `(node: Node, event: DragEvent) => boolean` | — | Called when a drag begins; return `false` to prevent dragging |
| `dnd.onDragEnd` | `(node: Node, event: DragEvent) => void` | — | Called when a drag ends, whether dropped or cancelled |

`DropPlacement` is `'before' | 'after' | 'inside'`.

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `node:dragstart` | `(node: Node)` | Emitted when a node begins being dragged |
| `node:dropped` | `(dragged: Node, target: Node, placement: DropPlacement)` | Emitted after a successful drop; not emitted if `onDrop` returns `false` |
