# Sorting

Call `tree.sort(compareFn, deep)` to sort the visible nodes in the tree. Without passing `deep: true`, only the top-level root nodes are sorted — child nodes remain in their original order. Pass any comparator function, most commonly one built with `String.prototype.localeCompare` for alphabetical ordering.

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { LiquorTree } from 'liquor-tree'
import type { TreeNodeData } from 'liquor-tree'

const originalData: TreeNodeData[] = [
  {
    text: 'Vegetables',
    state: { expanded: true },
    children: [
      { text: 'Zucchini' },
      { text: 'Carrot' },
      { text: 'Broccoli' },
      { text: 'Asparagus' }
    ]
  },
  {
    text: 'Fruits',
    state: { expanded: true },
    children: [
      { text: 'Watermelon' },
      { text: 'Apple' },
      { text: 'Mango' },
      { text: 'Banana' }
    ]
  },
  {
    text: 'Grains',
    state: { expanded: true },
    children: [
      { text: 'Wheat' },
      { text: 'Rice' },
      { text: 'Oats' },
      { text: 'Quinoa' }
    ]
  }
]

const sortData = ref<TreeNodeData[]>(JSON.parse(JSON.stringify(originalData)))
const sortTreeRef = ref<InstanceType<typeof LiquorTree> | null>(null)

const sortAscending = (deep: boolean) => {
  sortTreeRef.value?.tree?.sort((a, b) => a.text.localeCompare(b.text), deep)
}

const sortDescending = (deep: boolean) => {
  sortTreeRef.value?.tree?.sort((a, b) => b.text.localeCompare(a.text), deep)
}

const resetSort = () => {
  sortData.value = JSON.parse(JSON.stringify(originalData))
}
</script>

<template>
  <div>
    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
      <button @click="sortAscending(false)">Sort A-Z</button>
      <button @click="sortDescending(false)">Sort Z-A</button>
      <button @click="sortAscending(true)">Deep Sort A-Z</button>
      <button @click="sortDescending(true)">Deep Sort Z-A</button>
      <button @click="resetSort">Reset</button>
    </div>

    <LiquorTree ref="sortTreeRef" :data="sortData" />
  </div>
</template>
```

## Tree Method

| Method | Signature | Description |
|--------|-----------|-------------|
| `tree.sort` | `(compareFn: (a: Node, b: Node) => number, deep?: boolean) => void` | Sort visible nodes using a comparator function. When `deep` is `false` (default), only root-level nodes are sorted. When `deep` is `true`, all descendant children are recursively sorted as well. |

## Resetting Sort Order

The tree reactively reflects whatever is in the `:data` binding. Because `tree.sort` mutates the current node order in-place, the simplest way to restore the original order is to reassign the data ref to a fresh deep copy of the original array.

```ts
// Store the original data separately before any sorting occurs
const originalData: TreeNodeData[] = [
  // ... your data
]

// The ref the tree is bound to
const sortData = ref<TreeNodeData[]>(JSON.parse(JSON.stringify(originalData)))

// Reset to original order at any time:
sortData.value = JSON.parse(JSON.stringify(originalData))
```

Reassigning `sortData.value` triggers Vue's reactivity system, causing the tree to re-render with the original node order intact.
