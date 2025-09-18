<template>
  <span v-if="!node.isEditing" v-html="node.text" />
  <input
    v-else
    ref="editCtrl"
    v-model="nodeText"
    type="text"
    class="tree-input"
    @blur="stopEditing"
    @keyup.enter="stopEditing"
    @mouseup.stop
  />
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { Node as INode } from '../types'

// Props
interface Props {
  node: INode
}

const props = defineProps<Props>()

// Reactive data
const nodeText = ref(props.node.text)
const editCtrl = ref<HTMLInputElement | null>(null)

// Methods
const stopEditing = () => {
  props.node.stopEditing(nodeText.value)
}

// Watch for editing state changes
watch(
  () => props.node.isEditing,
  (isEditing) => {
    if (isEditing) {
      nodeText.value = props.node.text
      nextTick(() => {
        editCtrl.value?.focus()
      })
    }
  }
)

// Watch for node text changes
watch(
  () => props.node.text,
  (newText) => {
    nodeText.value = newText
  }
)

// Define component name
defineOptions({
  name: 'NodeContent'
})
</script>
