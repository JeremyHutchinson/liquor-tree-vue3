<template>
  <div class="demo-section">
    <h2>Async Data Loading</h2>
    <p class="info-text">
      Click the expand arrow on nodes with a ⏳ to load their children asynchronously.
      The hourglass icon indicates a node that will fetch data when expanded.
    </p>

    <h3>Simulated API Fetch</h3>
    <p class="info-text">
      These nodes simulate API calls with a 1-second delay. Watch the loading spinner appear while data is being fetched!
    </p>
    <TreeRoot
      :data="asyncData"
      :options="asyncOptions"
    />
  </div>
</template>

<script setup lang="ts">
import TreeRoot from '../../../src/components/TreeRoot.vue'
import type { TreeNodeData, TreeOptions } from '../../../src/types'

const asyncData: TreeNodeData[] = [
  { text: 'Products', id: 'products', isBatch: true },
  { text: 'Services', id: 'services', isBatch: true },
  { text: 'Support',  id: 'support',  isBatch: true }
]

const mockAsyncData: Record<string, TreeNodeData[]> = {
  products: [
    { text: 'Electronics', id: 'electronics', isBatch: true },
    { text: 'Clothing',    id: 'clothing',    isBatch: true },
    {
      text: 'Books',
      id: 'books',
      children: [
        { text: 'Fiction' },
        { text: 'Non-Fiction' },
        { text: 'Technical' }
      ]
    }
  ],
  services: [
    {
      text: 'Consulting',
      id: 'consulting',
      children: [
        { text: 'Strategy' },
        { text: 'Implementation' }
      ]
    },
    {
      text: 'Training',
      id: 'training',
      children: [
        { text: 'Online Courses' },
        { text: 'Workshops' }
      ]
    }
  ],
  support: [
    {
      text: 'Documentation',
      children: [
        { text: 'Getting Started' },
        { text: 'API Reference' },
        { text: 'Examples' }
      ]
    },
    {
      text: 'Community',
      children: [
        { text: 'Forums' },
        { text: 'Discord' },
        { text: 'Stack Overflow' }
      ]
    }
  ],
  electronics: [
    { text: 'Laptops' },
    { text: 'Smartphones' },
    { text: 'Tablets' }
  ],
  clothing: [
    { text: 'Shirts' },
    { text: 'Pants' },
    { text: 'Shoes' }
  ]
}

const asyncOptions: TreeOptions = {
  fetchData: async (node) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return mockAsyncData[node.id as string] || []
  },
  onFetchError: (error, node) => {
    console.error(`Error loading children for ${node.text}:`, error)
  }
}
</script>
