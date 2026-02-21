# Liquor Tree Vue 3 — Documentation

A feature-rich Vue 3 tree component library with support for selection, checkboxes, filtering, sorting, drag & drop, async data loading, and more.

## Installation

```bash
npm install liquor-tree-vue3
```

## Minimal Usage

```vue
<template>
  <TreeRoot :data="items" />
</template>

<script setup lang="ts">
import TreeRoot from 'liquor-tree-vue3'
import type { TreeNodeData } from 'liquor-tree-vue3'

const items: TreeNodeData[] = [
  { text: 'Item 1' },
  { text: 'Item 2', children: [
    { text: 'Item 2.1' },
    { text: 'Item 2.2' }
  ]}
]
</script>
```

## Features

| Feature | Description | Doc |
|---------|-------------|-----|
| [Basic Tree](./basic.md) | Hierarchical data display with expand/collapse | [basic.md](./basic.md) |
| [Selection](./selection.md) | Single and multi-select with keyboard modifiers | [selection.md](./selection.md) |
| [Checkboxes](./checkboxes.md) | Checkbox mode with cascading check and indeterminate state | [checkboxes.md](./checkboxes.md) |
| [Filter](./filter.md) | Real-time search/filter with customizable matcher | [filter.md](./filter.md) |
| [Sorting](./sorting.md) | Sort nodes with a custom comparator, shallow or deep | [sorting.md](./sorting.md) |
| [Keyboard Navigation](./keyboard.md) | Arrow key navigation, expand/collapse, focus | [keyboard.md](./keyboard.md) |
| [Inline Editing](./editing.md) | Double-click or F2 to rename nodes in place | [editing.md](./editing.md) |
| [Drag & Drop](./drag-drop.md) | Reorder and reparent nodes by dragging | [drag-drop.md](./drag-drop.md) |
| [Async Data](./async.md) | Lazy-load children on demand via `fetchData` | [async.md](./async.md) |
| [Custom Rendering](./custom-rendering.md) | Full control over node appearance via scoped slots | [custom-rendering.md](./custom-rendering.md) |
| [Events](./events.md) | Event system reference for all tree interactions | [events.md](./events.md) |
