<template>
  <div class="demo-section">
    <h2>Inline Node Editing</h2>
    <p class="info-text">
      <strong>Double-click</strong> any node to edit its text inline.
      Press <kbd>Enter</kbd> or click away to save. Press <kbd>Escape</kbd> to cancel.
      You can also press <kbd>F2</kbd> to start editing the focused node via keyboard.
    </p>

    <StatusBox
      :message="editingStatus"
      empty="No changes yet"
      variant="green"
    />

    <TreeRoot
      ref="editingTreeRef"
      :data="editingData"
      :options="editingOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TreeRoot from '../../../src/components/TreeRoot.vue'
import StatusBox from './shared/StatusBox.vue'
import type { TreeNodeData, TreeOptions } from '../../../src/types'

const editingTreeRef = ref<InstanceType<typeof TreeRoot> | null>(null)
const editingStatus = ref('')

const editingData: TreeNodeData[] = [
  {
    text: 'Project Alpha',
    state: { expanded: true },
    children: [
      {
        text: 'Planning',
        state: { expanded: true },
        children: [
          { text: 'Requirements' },
          { text: 'Architecture' },
          { text: 'Timeline' }
        ]
      },
      {
        text: 'Development',
        state: { expanded: true },
        children: [
          { text: 'Frontend' },
          { text: 'Backend' },
          { text: 'Database' }
        ]
      }
    ]
  },
  {
    text: 'Project Beta',
    state: { expanded: true },
    children: [
      { text: 'Research' },
      { text: 'Prototype' },
      { text: 'Review' }
    ]
  }
]

const editingOptions: TreeOptions = {
  editing: true
}

onMounted(() => {
  if (editingTreeRef.value?.tree) {
    editingTreeRef.value.tree.$on('node:text:changed', (_node, newText, oldText) => {
      editingStatus.value = `Renamed "${oldText}" → "${newText}"`
    })
  }
})
</script>

<style scoped>
kbd {
  display: inline-block;
  padding: 0.1rem 0.3rem;
  background: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}
</style>
