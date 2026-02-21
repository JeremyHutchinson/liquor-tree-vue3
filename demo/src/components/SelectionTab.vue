<template>
  <div class="demo-section">
    <h2>Selection Examples</h2>

    <h3>Single Selection</h3>
    <p class="info-text">Click a node to select it. Selecting another node will deselect the previous one.</p>
    <TreeRoot :data="nestedData" :options="treeOptions" />

    <h3 style="margin-top: 2rem;">Multiple Selection</h3>
    <p class="info-text">
      <strong>Cmd/Ctrl + click</strong> to add individual nodes to the selection.
      <strong>Shift + click</strong> to select a contiguous range of nodes between your last click and the current one.
    </p>
    <TreeRoot :data="multiSelectData" :options="multiSelectOptions" />
  </div>
</template>

<script setup lang="ts">
import TreeRoot from '../../../src/components/TreeRoot.vue'
import type { TreeNodeData, TreeOptions } from '../../../src/types'

const nestedData: TreeNodeData[] = [
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

const treeOptions: TreeOptions = {
  multiple: false,
  checkbox: false
}

const multiSelectData: TreeNodeData[] = [
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
  },
  {
    text: 'Mobile',
    state: { expanded: true },
    children: [
      { text: 'React Native' },
      { text: 'Flutter' },
      { text: 'Swift' }
    ]
  }
]

const multiSelectOptions: TreeOptions = {
  multiple: true,
  checkbox: false
}
</script>
