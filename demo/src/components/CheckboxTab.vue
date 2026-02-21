<template>
  <div class="demo-section">
    <h2>Checkbox Example</h2>
    <p class="info-text">
      Click checkboxes to check/uncheck nodes. With autoCheckChildren enabled,
      checking a parent automatically checks all children. Parent checkboxes show
      an indeterminate state (−) when some but not all children are checked.
    </p>
    <TreeRoot :data="checkboxData" :options="checkboxOptions" />
  </div>
</template>

<script setup lang="ts">
import TreeRoot from '../../../src/components/TreeRoot.vue'
import type { TreeNodeData, TreeOptions } from '../../../src/types'

const checkboxData: TreeNodeData[] = [
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

const checkboxOptions: TreeOptions = {
  checkbox: true,
  autoCheckChildren: true
}
</script>
