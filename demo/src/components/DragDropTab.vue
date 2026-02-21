<template>
  <div class="demo-section">
    <h2>Drag &amp; Drop</h2>
    <p class="info-text">
      Click and drag nodes to reorder them. Drag to the top/bottom third of a node to insert before/after,
      or to the middle third to make it a child.
    </p>
    <StatusBox :message="dndStatus" empty="No actions yet" variant="blue" />
    <TreeRoot :data="dndData" :options="dndOptions" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TreeRoot from '../../../src/components/TreeRoot.vue'
import StatusBox from './shared/StatusBox.vue'
import type { TreeNodeData, TreeOptions } from '../../../src/types'

const dndStatus = ref('')

const dndData = ref<TreeNodeData[]>([
  {
    text: 'Team Alpha',
    state: { expanded: true },
    children: [
      { text: 'Alice' },
      { text: 'Bob' },
      { text: 'Charlie' }
    ]
  },
  {
    text: 'Team Beta',
    state: { expanded: true },
    children: [
      { text: 'David' },
      { text: 'Eve' }
    ]
  },
  {
    text: 'Team Gamma',
    state: { expanded: true },
    children: [
      { text: 'Frank' },
      { text: 'Grace' },
      { text: 'Henry' }
    ]
  }
])

const dndOptions: TreeOptions = {
  dnd: {
    enabled: true,
    onDrop: (targetNode, draggedNode, placement) => {
      dndStatus.value = `Moved "${draggedNode.text}" ${placement} "${targetNode.text}"`
      return true
    }
  }
}
</script>
