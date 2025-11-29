<template>
  <div class="liquor-tree">
    <ul class="tree-root">
      <TreeNode
        v-for="node in tree.model"
        :key="node.id"
        :node="node"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Tree } from '@/core/Tree'
import TreeNode from './TreeNode.vue'
import type { TreeNodeData, TreeOptions } from '@/types'

interface Props {
  data?: TreeNodeData[]
  options?: TreeOptions
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  options: () => ({})
})

// Create the tree instance
const tree = ref(new Tree(props.options))

// Initialize tree with data
if (props.data && props.data.length > 0) {
  tree.value.setModel(props.data)
}

// Watch for data changes
watch(() => props.data, (newData) => {
  if (newData) {
    tree.value.setModel(newData)
  }
}, { deep: true })

// Watch for options changes
watch(() => props.options, (newOptions) => {
  if (newOptions) {
    tree.value = new Tree(newOptions)
    if (props.data) {
      tree.value.setModel(props.data)
    }
  }
}, { deep: true })

// Expose tree instance for parent component access via ref
defineExpose({
  tree: tree.value
})
</script>

<style scoped>
.liquor-tree {
  font-family: sans-serif;
}

.tree-root {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
