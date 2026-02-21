# Keyboard Navigation

Keyboard navigation is enabled by default and requires no additional configuration. Click any node to give it focus, then use the arrow keys to move through the tree. If the `editing` option is enabled, pressing `F2` starts inline editing on the focused node.

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `ArrowUp` | Move focus to the previous visible node |
| `ArrowDown` | Move focus to the next visible node |
| `ArrowLeft` | Collapse the focused node if expanded, or move focus to its parent |
| `ArrowRight` | Expand the focused node if it is collapsed and has children; or move focus to its first child if the node is already expanded; does nothing on leaf nodes |
| `Enter` | Toggle the checkbox on the focused node (requires `checkbox: true`) |
| `Space` | Toggle the checkbox on the focused node (requires `checkbox: true`) |
| `F2` | Start inline editing on the focused node (requires `editing: true`) |
| `Escape` | Cancel inline editing and discard changes (only active while editing) |

Disabled nodes are skipped automatically during `ArrowUp` / `ArrowDown` navigation.

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `keyboardNavigation` | `boolean` | `true` | Enable or disable keyboard navigation for the tree |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `node:focused` | `node: Node` | Fires when a node receives keyboard focus |

## Basic Usage

Keyboard navigation is active out of the box — no special options are required.

```vue
<script setup lang="ts">
import { LiquorTree } from 'liquor-tree'
import type { TreeNodeData, TreeOptions } from 'liquor-tree'

const data: TreeNodeData[] = [
  {
    text: 'Documents',
    state: { expanded: true },
    children: [
      { text: 'Resume.pdf' },
      { text: 'Cover Letter.docx' }
    ]
  },
  {
    text: 'Pictures',
    children: [
      { text: 'Vacation.jpg' },
      { text: 'Profile.png' }
    ]
  },
  { text: 'Notes.txt' }
]

const options: TreeOptions = {
  multiple: false
}
</script>

<template>
  <LiquorTree :data="data" :options="options" />
</template>
```

Click any node to focus it, then navigate with the arrow keys. No additional configuration is needed to enable keyboard navigation.
