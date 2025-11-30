<template>
  <li class="tree-node">
    <div
      class="tree-content"
      :class="{
        'tree-content-selected': node?.selected(),
        'tree-content-focused': isActiveElement
      }"
      @click="handleClick"
    >
      <!-- Expand/collapse toggle -->
      <span
        v-if="node?.hasChildren?.()"
        class="tree-arrow"
        :class="{ 'tree-arrow-expanded': node?.expanded() }"
        @click.stop="toggleExpand"
      >
        ▶
      </span>
      <span v-else class="tree-arrow-placeholder"></span>

      <span class="tree-text">{{ node?.text || 'N/A' }}</span>
    </div>

    <!-- Recursively render children (only when expanded) -->
    <ul v-if="node?.hasChildren?.() && node?.expanded()" class="tree-children">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Node } from '@/core/Node'

interface Props {
  node: Node
}

const props = defineProps<Props>()

const isActiveElement = computed(() => {
  return props.node?.tree?.activeElement === props.node
})

const toggleExpand = () => {
  props.node?.toggleExpand()
}

const handleClick = (event: MouseEvent) => {
  // Select the node on click
  if (props.node) {
    // Check if Cmd (Mac) or Ctrl (Windows/Linux) is pressed for multi-select
    const extendSelection = event.metaKey || event.ctrlKey
    props.node.select(extendSelection)
    // Also set as active element for keyboard navigation
    props.node.focus()
  }
}
</script>

<style scoped>
.tree-node {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tree-content {
  padding: 4px 8px;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.tree-content:hover {
  background-color: #f5f5f5;
}

.tree-content-selected {
  background-color: #e3f2fd;
  border-left: 3px solid #2196f3;
  padding-left: 5px;
}

.tree-content-selected:hover {
  background-color: #bbdefb;
}

.tree-content-focused {
  outline: 2px solid #2196f3;
  outline-offset: -2px;
}

.tree-arrow {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  color: #666;
}

.tree-arrow:hover {
  color: #333;
}

.tree-arrow-expanded {
  transform: rotate(90deg);
}

.tree-arrow-placeholder {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

.tree-text {
  font-size: 14px;
  color: #333;  /* Ensure dark text color regardless of color scheme */
}

.tree-children {
  list-style: none;
  margin: 0;
  padding-left: 20px;
}
</style>
