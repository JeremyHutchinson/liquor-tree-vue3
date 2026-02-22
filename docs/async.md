# Async Data Loading

Mark nodes with `isBatch: true` to indicate they should load children on demand when expanded. Provide a `fetchData` function in options that receives the node and returns `Promise<TreeNodeData[]>`. A loading spinner appears automatically while fetching; once loaded, children are cached and `fetchData` is not called again on subsequent expands.

## Basic Usage

```vue
<script setup lang="ts">
import { LiquorTree } from 'liquor-tree'
import type { TreeNodeData, TreeOptions } from 'liquor-tree'

const treeData: TreeNodeData[] = [
  { text: 'Products', id: 'products', isBatch: true },
  { text: 'Services', id: 'services', isBatch: true },
  { text: 'Support',  id: 'support',  isBatch: true }
]

const mockData: Record<string, TreeNodeData[]> = {
  products: [
    { text: 'Electronics', id: 'electronics', isBatch: true },
    { text: 'Clothing',    id: 'clothing',    isBatch: true },
    {
      text: 'Books',
      children: [
        { text: 'Fiction' },
        { text: 'Non-Fiction' },
        { text: 'Technical' }
      ]
    }
  ],
  services: [
    { text: 'Consulting', children: [{ text: 'Strategy' }, { text: 'Implementation' }] },
    { text: 'Training',   children: [{ text: 'Online Courses' }, { text: 'Workshops' }] }
  ],
  support: [
    { text: 'Documentation', children: [{ text: 'Getting Started' }, { text: 'API Reference' }] },
    { text: 'Community',     children: [{ text: 'Forums' }, { text: 'Discord' }] }
  ],
  electronics: [{ text: 'Laptops' }, { text: 'Smartphones' }, { text: 'Tablets' }],
  clothing:    [{ text: 'Shirts' },  { text: 'Pants' },       { text: 'Shoes' }]
}

const options: TreeOptions = {
  fetchData: async (node) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return mockData[node.id as string] ?? []
  },
  onFetchError: (error, node) => {
    console.error(`Failed to load children for "${node.text}":`, error)
  }
}
</script>

<template>
  <LiquorTree :data="treeData" :options="options" />
</template>
```

## How It Works

A node with `isBatch: true` renders an expand arrow even when it has no children, signalling that children will be loaded on demand. When the user expands such a node, the tree calls `fetchData(node)` with the `Node` object, and a loading spinner is displayed while the promise is pending. The resolved `TreeNodeData[]` array is appended as the node's children and the node's `isBatch` flag is cleared. On subsequent expands the existing children are shown immediately — `fetchData` is never called again for that node. If `fetchData` throws or the returned promise rejects, the `onFetchError` callback is invoked with the error and the node so the application can surface an appropriate message.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fetchData` | `string \| ((node: Node) => Promise<TreeNodeData[]>)` | — | URL template or async function used to load a node's children. When a string is provided, `{placeholder}` tokens are replaced with matching node properties (e.g. `"/api/nodes/{id}"`). |
| `onFetchError` | `(error: Error, node: Node) => void` | — | Called when `fetchData` throws or its promise rejects, allowing the application to handle or display the error. |

## Node Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `isBatch` | `boolean` | Marks the node for lazy loading. The expand arrow is shown even without children, and `fetchData` is called the first time the node is expanded. |
| `id` | `string \| number` | Identifier available on the `Node` object as `node.id`. Typically used inside `fetchData` to determine which children to return. |
