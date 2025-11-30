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
import { ref, watch, onMounted, onUnmounted, nextTick, provide } from 'vue'
import { Tree } from '@/core/Tree'
import TreeNode from './TreeNode.vue'
import { useKeyboardNav, useDragDrop } from '@/composables'
import type { TreeNodeData, TreeOptions } from '@/types'
import type { Node } from '@/core/Node'

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

// Reactive active element for keyboard navigation
const activeElement = ref<Node | null>(null)

// Provide activeElement to child components
provide('activeElement', activeElement)

// Initialize keyboard navigation composable (must be called during setup)
// It will only attach event listeners after the element is available
const keyboardNav = useKeyboardNav(tree, rootEl)

// Initialize drag & drop composable
const dragDrop = useDragDrop(tree, rootEl)

// Provide dragDrop to child components
provide('dragDrop', dragDrop)

// Initialize tree
onMounted(() => {
  tree.value = new Tree(props.options)

  if (props.data && props.data.length > 0) {
    tree.value.setModel(props.data)
  }

  // Sync tree.activeElement with reactive ref
  // Override the activeElement setter to trigger reactivity
  let internalActiveElement = tree.value.activeElement
  Object.defineProperty(tree.value, 'activeElement', {
    get() {
      return internalActiveElement
    },
    set(value: Node | null) {
      internalActiveElement = value
      activeElement.value = value
    },
    enumerable: true,
    configurable: true
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

// Cleanup on unmount
onUnmounted(() => {
  dragDrop.cleanup()
})

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
