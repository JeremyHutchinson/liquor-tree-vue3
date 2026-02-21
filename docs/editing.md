# Inline Editing

With `editing: true`, users can double-click any node to rename it inline directly within the tree. Press `Enter` or click away to save the new text. Press `Escape` to cancel and revert the node back to its original text.

## Keyboard Shortcuts

| Trigger | Action |
|---------|--------|
| Double-click | Start editing the clicked node |
| `F2` | Start editing the currently focused node |
| `Enter` | Save and exit editing |
| `Escape` | Cancel editing and revert to original text |
| Click outside | Save and exit editing |

## Basic Usage

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { LiquorTree } from 'liquor-tree'
import type { TreeOptions, TreeNodeData, Node } from 'liquor-tree'

const treeRef = ref<InstanceType<typeof LiquorTree> | null>(null)
const renameStatus = ref('')

const treeData: TreeNodeData[] = [
  {
    text: 'Project Alpha',
    state: { expanded: true },
    children: [
      {
        text: 'Planning',
        state: { expanded: true },
        children: [
          { text: 'Requirements' },
          { text: 'Architecture' },
          { text: 'Timeline' }
        ]
      },
      {
        text: 'Development',
        state: { expanded: true },
        children: [
          { text: 'Frontend' },
          { text: 'Backend' },
          { text: 'Database' }
        ]
      }
    ]
  },
  {
    text: 'Project Beta',
    state: { expanded: true },
    children: [
      { text: 'Research' },
      { text: 'Prototype' },
      { text: 'Review' }
    ]
  }
]

const options: TreeOptions = {
  editing: true
}

function onTextChanged(_node: Node, newText: string, oldText: string) {
  renameStatus.value = `Renamed "${oldText}" → "${newText}"`
}

onMounted(() => {
  if (treeRef.value?.tree) {
    treeRef.value.tree.$on('node:text:changed', onTextChanged)
  }
})

onUnmounted(() => {
  if (treeRef.value?.tree) {
    treeRef.value.tree.$off('node:text:changed', onTextChanged)
  }
})
</script>

<template>
  <div>
    <p v-if="renameStatus">{{ renameStatus }}</p>
    <p v-else>No changes yet — double-click a node to rename it.</p>

    <LiquorTree
      ref="treeRef"
      :data="treeData"
      :options="options"
    />
  </div>
</template>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `editing` | `boolean` | `false` | Enable inline node text editing |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `node:text:changed` | `(node: Node, newText: string, oldText: string)` | Fires after edited text is saved |
| `node:editing:start` | `node: Node` | Fires when inline editing begins |
| `node:editing:stop` | `node: Node` | Fires when editing ends (save or cancel) |
