<template>
  <div class="demo-section">
    <h2>Keyboard Navigation</h2>
    <p class="info-text">
      Click a node to focus it, then use keyboard shortcuts:
    </p>
    <ul class="keyboard-list">
      <li><kbd>↑</kbd> / <kbd>↓</kbd> — Navigate up/down through visible nodes</li>
      <li><kbd>←</kbd> — Collapse node or move to parent</li>
      <li><kbd>→</kbd> — Expand node or move to first child</li>
      <li><kbd>Enter</kbd> / <kbd>Space</kbd> — Toggle checkbox (if enabled)</li>
    </ul>
    <TreeRoot
      :data="nestedData"
      :options="treeOptions"
    />
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
</script>

<style scoped>
.keyboard-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0 2rem 0;
}

.keyboard-list li {
  padding: 0.5rem 0;
  color: #333;
}

.keyboard-list kbd {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>
