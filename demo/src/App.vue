<template>
  <div>
    <h1>🌳 Liquor Tree - Vue 3</h1>
    <p>Vue 3 + TypeScript + Composition API migration</p>

    <div class="demo-section">
      <h2>✅ Phase 1 & 2.1 Complete!</h2>
      <ul class="progress-list">
        <li>✅ Core Type System (comprehensive TypeScript)</li>
        <li>✅ Node Class (27 tests passing)</li>
        <li>✅ Tree Class (30 tests passing)</li>
        <li>✅ Selection Class (27 tests passing)</li>
        <li>✅ TreeRoot Component (12 tests passing)</li>
        <li><strong>98/98 tests passing (100%)</strong></li>
      </ul>
    </div>

    <div class="demo-section">
      <h2>Basic Tree Example</h2>
      <TreeRoot :data="basicData" />
    </div>

    <div class="demo-section">
      <h2>Nested Tree Example (Single Selection)</h2>
      <TreeRoot :data="nestedData" :options="treeOptions" />
    </div>

    <div class="demo-section">
      <h2>Multiple Selection Example</h2>
      <p class="info-text">Hold Cmd (Mac) or Ctrl (Windows/Linux) and click to select multiple nodes</p>
      <TreeRoot :data="multiSelectData" :options="multiSelectOptions" />
    </div>
  </div>
</template>

<script setup lang="ts">
import TreeRoot from '../../src/components/TreeRoot.vue'
import type { TreeNodeData, TreeOptions } from '../../src/types'

// Basic tree data
const basicData: TreeNodeData[] = [
  { text: 'Node 1' },
  { text: 'Node 2' },
  { text: 'Node 3' }
]

// Nested tree data
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
  {
    text: 'Root 3'
  }
]

// Tree options - single selection
const treeOptions: TreeOptions = {
  multiple: false,
  checkbox: false
}

// Multi-select tree data
const multiSelectData: TreeNodeData[] = [
  { text: 'Item 1' },
  { text: 'Item 2' },
  { text: 'Item 3' },
  { text: 'Item 4' },
  { text: 'Item 5' }
]

// Multi-select tree options
const multiSelectOptions: TreeOptions = {
  multiple: true,
  checkbox: false
}
</script>

<style scoped>
.demo-section {
  margin: 2rem auto;
  padding: 1.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  max-width: 800px;
  background: white;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

h2 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 2px solid #42b983;
  padding-bottom: 0.5rem;
}

p {
  text-align: center;
  color: #666;
}

.progress-list {
  list-style: none;
  padding: 0;
}

.progress-list li {
  padding: 0.5rem 0;
  color: #333;
}

.info-text {
  margin: 0 0 1rem 0;
  padding: 0.75rem;
  background-color: #e3f2fd;
  border-left: 3px solid #2196f3;
  border-radius: 3px;
  font-size: 0.9rem;
  color: #1565c0;
}
</style>
