# Checkboxes

Enable `checkbox: true` in your tree options to add checkboxes to every node. With `autoCheckChildren: true`, checking a parent node automatically checks all of its descendants. When only some children are checked, the parent displays an indeterminate state (−) to reflect the partial selection.

## Basic Usage

```vue
<script setup lang="ts">
import { LiquorTree } from 'liquor-tree'
import type { TreeNodeData, TreeOptions } from 'liquor-tree'

const treeData: TreeNodeData[] = [
  {
    text: 'Project Files',
    state: { expanded: true },
    children: [
      {
        text: 'src',
        state: { expanded: true },
        children: [
          { text: 'index.ts' },
          { text: 'App.vue' },
          { text: 'main.ts' }
        ]
      },
      {
        text: 'tests',
        state: { expanded: true },
        children: [
          { text: 'unit.spec.ts' },
          { text: 'integration.spec.ts' }
        ]
      }
    ]
  },
  {
    text: 'Documentation',
    state: { expanded: true },
    children: [
      { text: 'README.md' },
      { text: 'API.md' },
      { text: 'CHANGELOG.md' }
    ]
  }
]

const options: TreeOptions = {
  checkbox: true,
  autoCheckChildren: true
}
</script>

<template>
  <LiquorTree :data="treeData" :options="options" />
</template>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `checkbox` | `boolean` | `false` | Renders a checkbox beside each node label. |
| `autoCheckChildren` | `boolean` | `false` | When a parent node is checked or unchecked, all descendant nodes follow the same state. Also triggers indeterminate state on ancestors when only some children are checked. |
| `checkOnSelect` | `boolean` | `false` | Checking a node's checkbox also selects it (and vice-versa). Useful when you want checkbox and selection states to stay in sync. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `node:checked` | `node: Node` | Fires when a node's checkbox is checked. |
| `node:unchecked` | `node: Node` | Fires when a node's checkbox is unchecked. |

## Listening to Events

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { LiquorTree } from 'liquor-tree'
import type { Node, TreeOptions } from 'liquor-tree'

const treeRef = ref<InstanceType<typeof LiquorTree> | null>(null)

const options: TreeOptions = {
  checkbox: true,
  autoCheckChildren: true
}

onMounted(() => {
  const tree = treeRef.value?.tree
  if (!tree) return

  tree.$on('node:checked', (node: Node) => {
    console.log('Checked:', node.text)
  })

  tree.$on('node:unchecked', (node: Node) => {
    console.log('Unchecked:', node.text)
  })
})

onUnmounted(() => {
  treeRef.value?.tree?.$off('node:checked')
  treeRef.value?.tree?.$off('node:unchecked')
})
</script>

<template>
  <LiquorTree ref="treeRef" :data="[]" :options="options" />
</template>
```
