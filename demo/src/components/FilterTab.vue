<template>
  <div class="demo-section">
    <h2>Filter &amp; Search</h2>
    <p class="info-text">
      Type to filter the tree. Only matching nodes and their parent paths will be shown.
      Clear the input to show all nodes again.
    </p>
    <div class="filter-controls">
      <input
        v-model="filterQuery"
        type="text"
        placeholder="Type to filter tree..."
        class="filter-input"
        @input="handleFilter"
      >
      <button
        v-if="filterQuery"
        class="clear-button"
        @click="clearFilter"
      >
        Clear
      </button>
    </div>
    <TreeRoot
      ref="filterTreeRef"
      :data="filterData"
      :options="filterOptions"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TreeRoot from '../../../src/components/TreeRoot.vue'
import type { TreeNodeData, TreeOptions } from '../../../src/types'

const filterQuery = ref('')
const filterTreeRef = ref<InstanceType<typeof TreeRoot> | null>(null)

const filterData: TreeNodeData[] = [
  {
    text: 'Programming Languages',
    state: { expanded: true },
    children: [
      {
        text: 'JavaScript',
        state: { expanded: true },
        children: [
          { text: 'React' },
          { text: 'Vue' },
          { text: 'Angular' }
        ]
      },
      {
        text: 'Python',
        state: { expanded: true },
        children: [
          { text: 'Django' },
          { text: 'Flask' },
          { text: 'FastAPI' }
        ]
      },
      {
        text: 'TypeScript',
        state: { expanded: true },
        children: [
          { text: 'Next.js' },
          { text: 'Nest.js' }
        ]
      }
    ]
  },
  {
    text: 'Databases',
    state: { expanded: true },
    children: [
      { text: 'PostgreSQL' },
      { text: 'MongoDB' },
      { text: 'Redis' },
      { text: 'SQLite' }
    ]
  },
  {
    text: 'DevOps Tools',
    state: { expanded: true },
    children: [
      { text: 'Docker' },
      { text: 'Kubernetes' },
      { text: 'Jenkins' },
      { text: 'GitLab CI' }
    ]
  }
]

const filterOptions: TreeOptions = {
  filter: {
    emptyText: 'No matches found',
    showChildren: true
  }
}

const handleFilter = () => {
  if (filterTreeRef.value?.tree) {
    filterTreeRef.value.tree.filter(filterQuery.value)
  }
}

const clearFilter = () => {
  filterQuery.value = ''
  if (filterTreeRef.value?.tree) {
    filterTreeRef.value.tree.clearFilter()
  }
}
</script>

<style scoped>
.filter-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filter-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.filter-input:focus {
  outline: none;
  border-color: #2196f3;
}
</style>
