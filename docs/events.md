# Events

All tree interactions emit events through the `Tree` instance. Access the instance via a template ref: `treeRef.value?.tree`. Listen with `tree.$on(eventName, handler)` and clean up with `tree.$off(eventName, handler)`. This approach gives you full control over subscription lifecycle and avoids unintended side effects between components.

## Listening to Events

```vue
<template>
  <LiquorTree ref="treeRef" :data="items" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { LiquorTree } from 'liquor-tree'
import type { TreeNodeData, Node } from 'liquor-tree'

const items: TreeNodeData[] = [{ text: 'Item 1' }, { text: 'Item 2' }]
const treeRef = ref<InstanceType<typeof LiquorTree> | null>(null)

onMounted(() => {
  const tree = treeRef.value?.tree
  if (!tree) return

  const handler = (node: Node) => console.log('Selected:', node.text)
  tree.$on('node:selected', handler)
  onUnmounted(() => tree.$off('node:selected', handler))
})
</script>
```

## Events Reference

### Selection Events

| Event | Payload | Description |
|-------|---------|-------------|
| `node:selected` | `node: Node` | Fired when a node is selected. |
| `node:unselected` | `node: Node` | Fired when a node is unselected. |

### Checkbox Events

| Event | Payload | Description |
|-------|---------|-------------|
| `node:checked` | `node: Node` | Fired when a node's checkbox is checked. Requires the `checkbox` option to be enabled. |
| `node:unchecked` | `node: Node` | Fired when a node's checkbox is unchecked. Requires the `checkbox` option to be enabled. |

### Expand / Collapse Events

| Event | Payload | Description |
|-------|---------|-------------|
| `node:expanded` | `node: Node` | Fired when a node is expanded to reveal its children. |
| `node:collapsed` | `node: Node` | Fired when a node is collapsed to hide its children. |

### Focus Event

| Event | Payload | Description |
|-------|---------|-------------|
| `node:focused` | `node: Node` | Fired when a node receives focus, for example via keyboard navigation. |

### Inline Editing Events

| Event | Payload | Description |
|-------|---------|-------------|
| `node:editing` | `node: Node` | Fired when a node enters inline edit mode. Requires the `editing` option to be enabled. |
| `node:editing:stopped` | `node: Node` | Fired when a node exits inline edit mode, whether the edit was saved or cancelled. |
| `node:text:changed` | `node: Node, newText: string, oldText: string` | Fired after a node's text is committed. `newText` is the updated label; `oldText` is the previous value. |

### Data Events

| Event | Payload | Description |
|-------|---------|-------------|
| `node:data:changed` | `node: Node, data: Record<string, any>` | Fired when a node's custom `data` payload is updated via `node.setData()`. |

### Structure Events

| Event | Payload | Description |
|-------|---------|-------------|
| `node:removed` | `node: Node` | Fired after a node is removed from the tree. |
| `node:child:added` | `parentNode: Node, childNode: Node` | Fired on the parent node after a child is appended via `node.append()`. |
| `node:inserted:before` | `parentNode: Node, insertedNode: Node` | Fires when a node is inserted before another node |
| `node:inserted:after` | `parentNode: Node, insertedNode: Node` | Fires when a node is inserted after another node |

### Drag-and-Drop Events

Drag-and-drop events are only emitted when the `dnd` option is enabled.

| Event | Payload | Description |
|-------|---------|-------------|
| `node:dragstart` | `node: Node` | Fired when a drag operation begins on a node. |
| `node:dropped` | `dragNode: Node, targetNode: Node, placement: 'before' \| 'after' \| 'inside'` | Fired after a node is successfully dropped. `dragNode` is the node that was dragged; `targetNode` is the node it was dropped onto; `placement` indicates the drop position relative to the target. |

### Filter Events

| Event | Payload | Description |
|-------|---------|-------------|
| `tree:filtered` | `matches: Node[], query: string` | Fired whenever the filter is applied or cleared. When `query` is an empty string the filter has been cleared and `matches` will be an empty array. |

## Cleanup

Always call `tree.$off(eventName, handler)` with the same handler reference in `onUnmounted` to prevent memory leaks. The handler reference must be the same function instance used when calling `$on` — avoid passing inline arrow functions directly to `$on` if you need to remove them later. Calling `tree.$off(eventName)` without a handler reference removes ALL listeners for that event, which can silently break other components that have registered their own handlers for the same event.

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { LiquorTree } from 'liquor-tree'
import type { Node } from 'liquor-tree'

const treeRef = ref<InstanceType<typeof LiquorTree> | null>(null)

// Store handler references so $off can target them precisely
const onSelected  = (node: Node) => console.log('selected:', node.text)
const onCollapsed = (node: Node) => console.log('collapsed:', node.text)

onMounted(() => {
  const tree = treeRef.value?.tree
  if (!tree) return

  tree.$on('node:selected',  onSelected)
  tree.$on('node:collapsed', onCollapsed)
})

onUnmounted(() => {
  const tree = treeRef.value?.tree
  if (!tree) return

  tree.$off('node:selected',  onSelected)
  tree.$off('node:collapsed', onCollapsed)
})
</script>
```
