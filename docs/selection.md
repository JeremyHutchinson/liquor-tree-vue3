# Selection

Clicking a node selects it and highlights it in the tree. Single-select is the default behaviour — selecting one node automatically deselects the previous one. With `multiple: true` enabled, Ctrl/Cmd+click adds individual nodes to the selection and Shift+click selects a contiguous range between your last click and the current one.

## Single Selection

```vue
<script setup lang="ts">
import { LiquorTree } from 'liquor-tree'
import type { TreeNodeData, TreeOptions } from 'liquor-tree'

const treeData: TreeNodeData[] = [
  {
    text: 'Root 1',
    state: { expanded: true },
    children: [
      {
        text: 'Child 1.1',
        state: { expanded: true },
        children: [
          { text: 'Grandchild 1.1.1' },
          { text: 'Grandchild 1.1.2' }
        ]
      },
      { text: 'Child 1.2' }
    ]
  },
  {
    text: 'Root 2',
    state: { expanded: true },
    children: [
      { text: 'Child 2.1' },
      { text: 'Child 2.2' }
    ]
  },
  { text: 'Root 3' }
]

const options: TreeOptions = {
  multiple: false
}
</script>

<template>
  <LiquorTree :data="treeData" :options="options" />
</template>
```

## Multiple Selection

With `multiple: true`, users can build up a selection by holding Ctrl/Cmd while clicking individual nodes, or hold Shift and click to select all nodes between the previously clicked node and the current one.

```vue
<script setup lang="ts">
import { LiquorTree } from 'liquor-tree'
import type { TreeNodeData, TreeOptions } from 'liquor-tree'

const treeData: TreeNodeData[] = [
  {
    text: 'Frontend',
    state: { expanded: true },
    children: [
      { text: 'React' },
      { text: 'Vue' },
      { text: 'Angular' },
      { text: 'Svelte' }
    ]
  },
  {
    text: 'Backend',
    state: { expanded: true },
    children: [
      { text: 'Node.js' },
      { text: 'Django' },
      { text: 'Rails' },
      { text: 'Spring' }
    ]
  }
]

const options: TreeOptions = {
  multiple: true
}
</script>

<template>
  <LiquorTree :data="treeData" :options="options" />
</template>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `multiple` | `boolean` | `false` | Allow multiple nodes to be selected simultaneously |
| `parentSelect` | `boolean` | `false` | Clicking a parent selects all its children |
| `checkOnSelect` | `boolean` | `false` | Selecting a node also checks its checkbox |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `node:selected` | `node: Node` | Fires when a node is selected |
| `node:unselected` | `node: Node` | Fires when a node is deselected |

## Listening to Events

Use a template ref to access the underlying `tree` instance and subscribe to events via `$on`.

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { LiquorTree } from 'liquor-tree'
import type { Node } from 'liquor-tree'

const treeRef = ref<InstanceType<typeof LiquorTree> | null>(null)

onMounted(() => {
  treeRef.value?.tree.$on('node:selected', (node: Node) => {
    console.log('Selected:', node.text)
  })
  treeRef.value?.tree.$on('node:unselected', (node: Node) => {
    console.log('Unselected:', node.text)
  })
})
</script>

<template>
  <LiquorTree ref="treeRef" :data="treeData" :options="options" />
</template>
```
