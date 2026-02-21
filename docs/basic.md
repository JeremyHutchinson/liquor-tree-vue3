# Basic Tree

A tree component displays hierarchical data as a nested, expandable list. Each node can be expanded or collapsed to reveal or hide its children. Initial expand, selection, and other visual states are set via the `state` field on each node in your data.

## Basic Usage

```vue
<script setup lang="ts">
import { LiquorTree } from 'liquor-tree'
import type { TreeNodeData } from 'liquor-tree'

const treeData: TreeNodeData[] = [
  {
    text: 'Design System',
    state: { expanded: true },
    children: [
      {
        text: 'Components',
        state: { expanded: true },
        children: [
          {
            text: 'Inputs',
            children: [
              { text: 'Button' },
              { text: 'Text Field' },
              { text: 'Checkbox' }
            ]
          },
          {
            text: 'Layout',
            children: [
              { text: 'Grid' },
              { text: 'Stack' }
            ]
          }
        ]
      },
      {
        text: 'Tokens',
        children: [
          { text: 'Colors' },
          { text: 'Typography' },
          { text: 'Spacing' }
        ]
      }
    ]
  },
  {
    text: 'Platform',
    children: [
      {
        text: 'Web',
        children: [
          { text: 'React' },
          { text: 'Vue' },
          { text: 'Angular' }
        ]
      },
      {
        text: 'Mobile',
        children: [
          { text: 'iOS' },
          { text: 'Android' }
        ]
      }
    ]
  }
]
</script>

<template>
  <LiquorTree :data="treeData" />
</template>
```

## Data Format

Each item in the `data` array must conform to the `TreeNodeData` shape:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | `string` | Yes | Display label shown for the node |
| `id` | `string \| number` | No | Unique identifier (used with async loading) |
| `children` | `TreeNodeData[]` | No | Child nodes rendered beneath this node |
| `state` | `Partial<NodeState>` | No | Initial visual/behavioral state (see below) |
| `data` | `Record<string, any>` | No | Arbitrary metadata accessible in scoped slots |
| `isBatch` | `boolean` | No | If true, children are loaded on demand — see [Async Data](./async.md) |

## Initial State

The optional `state` field accepts any subset of `NodeState` fields. Omitted fields use their defaults.

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `expanded` | `boolean` | `false` | Node is open and children are visible |
| `selected` | `boolean` | `false` | Node is selected on initial render |
| `checked` | `boolean` | `false` | Checkbox is checked on initial render |
| `disabled` | `boolean` | `false` | Node is non-interactive |
| `selectable` | `boolean` | `true` | Node can be selected by the user |
| `visible` | `boolean` | `true` | Node is shown in the tree |
| `draggable` | `boolean` | `true` | Node can be dragged |
| `dropable` | `boolean` | `true` | Node accepts drops from other nodes |

For handling expand and collapse events at runtime, see [Events](./events.md).
