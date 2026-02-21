<template>
  <div class="demo-section">
    <h2>Sorting</h2>
    <p class="info-text">
      Click buttons to sort the tree alphabetically (A-Z or Z-A). The "Deep Sort" option
      also sorts all nested children, not just the top level.
    </p>
    <div class="sort-controls">
      <button class="sort-button" @click="sortAscending(false)">Sort A-Z</button>
      <button class="sort-button" @click="sortDescending(false)">Sort Z-A</button>
      <button class="sort-button" @click="sortAscending(true)">Deep Sort A-Z</button>
      <button class="sort-button" @click="sortDescending(true)">Deep Sort Z-A</button>
      <button class="sort-button reset-button" @click="resetSort">Reset</button>
    </div>
    <TreeRoot ref="sortTreeRef" :data="sortData" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TreeRoot from '../../../src/components/TreeRoot.vue'
import type { TreeNodeData } from '../../../src/types'

const sortTreeRef = ref<InstanceType<typeof TreeRoot> | null>(null)

const originalSortData: TreeNodeData[] = [
  {
    text: 'Vegetables',
    state: { expanded: true },
    children: [
      { text: 'Zucchini' },
      { text: 'Carrot' },
      { text: 'Broccoli' },
      { text: 'Asparagus' }
    ]
  },
  {
    text: 'Fruits',
    state: { expanded: true },
    children: [
      { text: 'Watermelon' },
      { text: 'Apple' },
      { text: 'Mango' },
      { text: 'Banana' }
    ]
  },
  {
    text: 'Grains',
    state: { expanded: true },
    children: [
      { text: 'Wheat' },
      { text: 'Rice' },
      { text: 'Oats' },
      { text: 'Quinoa' }
    ]
  }
]

const sortData = ref<TreeNodeData[]>(JSON.parse(JSON.stringify(originalSortData)))

const sortAscending = (deep: boolean) => {
  if (sortTreeRef.value?.tree) {
    sortTreeRef.value.tree.sort((a, b) => a.text.localeCompare(b.text), deep)
  }
}

const sortDescending = (deep: boolean) => {
  if (sortTreeRef.value?.tree) {
    sortTreeRef.value.tree.sort((a, b) => b.text.localeCompare(a.text), deep)
  }
}

const resetSort = () => {
  sortData.value = JSON.parse(JSON.stringify(originalSortData))
}
</script>

<style scoped>
.sort-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.sort-button {
  padding: 0.5rem 1rem;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.sort-button:hover {
  background-color: #1976d2;
}

.sort-button.reset-button {
  background-color: #9e9e9e;
}

.sort-button.reset-button:hover {
  background-color: #757575;
}
</style>
