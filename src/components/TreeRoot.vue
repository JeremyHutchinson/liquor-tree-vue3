<template>
  <div ref="rootEl" class="liquor-tree" tabindex="0">
    <ul v-if="tree" class="tree-root">
      <TreeNode
        v-for="node in tree.model"
        :key="node.id"
        :node="node"
      />
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, nextTick } from 'vue'
import { Tree } from '@/core/Tree'
import TreeNode from './TreeNode.vue'
import { useKeyboardNav } from '@/composables'
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
const tree = ref<Tree | null>(null)

// Root element ref
const rootEl = ref<HTMLElement | null>(null)

// Initialize tree
onMounted(() => {
  tree.value = new Tree(props.options)

  if (props.data && props.data.length > 0) {
    tree.value.setModel(props.data)
  }

  // Initialize keyboard navigation if enabled and root element is available
  nextTick(() => {
    if (tree.value?.options.keyboardNavigation !== false && rootEl.value) {
      useKeyboardNav(tree, rootEl.value)
    }
  })
})

// Watch for data changes
watch(() => props.data, (newData) => {
  if (newData && tree.value) {
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
  tree
})
</script>

<style scoped>
.liquor-tree {
  font-family: sans-serif;
}

.liquor-tree:focus {
  outline: none;
}

.tree-root {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
