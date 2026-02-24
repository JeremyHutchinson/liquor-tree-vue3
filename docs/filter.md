# Filter & Search

Call `tree.filter(query)` to show only matching nodes and their ancestors. Call `tree.clearFilter()` to restore the full tree. A custom `matcher` function can replace the default substring match to implement any filtering logic.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LiquorTree } from 'liquor-tree'
import type { TreeNodeData, TreeOptions } from 'liquor-tree'

const filterQuery = ref('')
const filterTreeRef = ref<InstanceType<typeof LiquorTree> | null>(null)

const treeData: TreeNodeData[] = [
  {
    text: 'Programming Languages',
    state: { expanded: true },
    children: [
      {
        text: 'JavaScript',
        state: { expanded: true },
        children: [
          { text: 'React' },
          { text: 'Vue' },
          { text: 'Angular' }
        ]
      },
      {
        text: 'Python',
        state: { expanded: true },
        children: [
          { text: 'Django' },
          { text: 'Flask' },
          { text: 'FastAPI' }
        ]
      },
      {
        text: 'TypeScript',
        state: { expanded: true },
        children: [
          { text: 'Next.js' },
          { text: 'Nest.js' }
        ]
      }
    ]
  },
  {
    text: 'Databases',
    state: { expanded: true },
    children: [
      { text: 'PostgreSQL' },
      { text: 'MongoDB' },
      { text: 'Redis' },
      { text: 'SQLite' }
    ]
  },
  {
    text: 'DevOps Tools',
    state: { expanded: true },
    children: [
      { text: 'Docker' },
      { text: 'Kubernetes' },
      { text: 'Jenkins' },
      { text: 'GitLab CI' }
    ]
  }
]

const options: TreeOptions = {
  filter: {
    emptyText: 'No matches found',
    showChildren: true
  }
}

const handleFilter = () => {
  if (filterTreeRef.value?.tree) {
    filterTreeRef.value.tree.filter(filterQuery.value)
  }
}

const clearFilter = () => {
  filterQuery.value = ''
  if (filterTreeRef.value?.tree) {
    filterTreeRef.value.tree.clearFilter()
  }
}
</script>

<template>
  <div>
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
      <input
        v-model="filterQuery"
        type="text"
        placeholder="Type to filter tree..."
        @input="handleFilter"
      />
      <button v-if="filterQuery" @click="clearFilter">Clear</button>
    </div>

    <LiquorTree
      ref="filterTreeRef"
      :data="treeData"
      :options="options"
    />
  </div>
</template>
```

## Tree Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `tree.filter` | `(query: string) => Node[]` | Apply a filter — shows only matching nodes and their ancestors; returns the matched nodes |
| `tree.clearFilter` | `() => Node[]` | Remove the active filter, show all nodes, and return an empty array |

## Options

These options are nested under the `filter` key in the `options` prop.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `filter.emptyText` | `string` | `'Nothing found'` | Message shown when no nodes match the current query |
| `filter.showChildren` | `boolean` | `true` | Also show all children of matched nodes, not just ancestors |
| `filter.plainList` | `boolean` | `false` | Display matches as a flat list instead of preserving tree hierarchy |
| `filter.matcher` | `(query: string, node: Node) => boolean` | substring match | Custom function to determine whether a node matches the query |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `tree:filtered` | `(matches: Node[], query: string)` | Fires after each filter operation; `query` is an empty string when the filter is cleared |

## Custom Matcher

Supply a `matcher` function to filter on any node property. The example below matches nodes whose `data.tags` array contains the query string.

```vue
<script setup lang="ts">
import { LiquorTree } from 'liquor-tree'
import type { TreeNodeData, TreeOptions } from 'liquor-tree'
import type { Node } from 'liquor-tree'

const treeData: TreeNodeData[] = [
  { text: 'Vue',  data: { tags: ['frontend', 'javascript'] } },
  { text: 'Django', data: { tags: ['backend', 'python'] } },
  { text: 'FastAPI', data: { tags: ['backend', 'python', 'async'] } }
]

const options: TreeOptions = {
  filter: {
    emptyText: 'No matches found',
    matcher: (query: string, node: Node): boolean => {
      const tags: string[] = node.data?.tags ?? []
      return tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    }
  }
}
</script>

<template>
  <LiquorTree :data="treeData" :options="options" />
</template>
```
