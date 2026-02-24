<template>
  <div
    ref="rootEl"
    class="liquor-tree"
    tabindex="0"
  >
    <ul
      v-if="tree"
      class="tree-root"
      role="tree"
    >
      <TreeNode
        v-for="node in tree.model"
        :key="node.id"
        :node="node"
      >
        <!-- Forward the default slot to TreeNode -->
        <template
          v-if="$slots.default"
          #default="slotProps"
        >
          <slot v-bind="slotProps" />
        </template>
      </TreeNode>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, provide } from 'vue'
import { Tree } from '@/core/Tree'
import TreeNode from './TreeNode.vue'
import { useKeyboardNav, useDragDrop, useAsyncData } from '@/composables'
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
useKeyboardNav(tree, rootEl)

// Initialize drag & drop composable
const dragDrop = useDragDrop(tree, rootEl)

// Provide dragDrop to child components
provide('dragDrop', dragDrop)

// Async data loader (will be initialized after tree is created)
let asyncData: ReturnType<typeof useAsyncData> | null = null

// Stored handler reference so it can be removed with $off
let nodeExpandedHandler: ((node: Node) => Promise<void>) | null = null

function teardownTree(): void {
  if (tree.value && nodeExpandedHandler) {
    tree.value.$off('node:expanded', nodeExpandedHandler)
    nodeExpandedHandler = null
  }
}

function initTree(options: TreeOptions, data: TreeNodeData[]): void {
  teardownTree()

  tree.value = new Tree(options)

  if (data && data.length > 0) {
    tree.value.setModel(data)
  }

  // Initialize async data loading
  asyncData = useAsyncData(tree.value, options)

  // Store handler reference so it can be removed on teardown
  nodeExpandedHandler = async (node: Node) => {
    if (node.isBatch && asyncData) {
      await asyncData.loadChildren(node)
    }
  }
  tree.value.$on('node:expanded', nodeExpandedHandler)

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
}

onMounted(() => {
  initTree(props.options, props.data)
})

// Watch for data changes
watch(() => props.data, (newData) => {
  if (newData && tree.value) {
    tree.value.setModel(newData)
  }
}, { deep: true })

// Watch for options changes - re-initialize all tree wiring
watch(() => props.options, (newOptions) => {
  if (newOptions) {
    initTree(newOptions, props.data)
  }
}, { deep: true })

// Cleanup on unmount
onUnmounted(() => {
  teardownTree()
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
