<template>
  <div
    class="tree-dragnode"
    :style="style"
  >
    {{ target.node.text }}
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

// Props
interface Props {
  target: {
    top?: number
    left?: number
    node: any
  }
}

const props = defineProps<Props>()

// Computed
const style = computed(() => {
  if (props.target.top === undefined) {
    return 'display: none'
  }

  return `top: ${props.target.top}px; left: ${props.target.left}px`
})

// Define component name
defineOptions({
  name: 'DraggableNode'
})
</script>

<style>
  .tree-dragnode {
    padding: 10px;
    border: 1px solid #e7eef7;
    position: fixed;
    border-radius: 8px;
    background: #fff;
    transform: translate(-50%, -110%);
    z-index: 10;
  }
</style>
