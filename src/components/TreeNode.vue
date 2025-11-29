<template>
  <li class="tree-node">
    <div class="tree-content">
      <!-- Expand/collapse toggle -->
      <span
        v-if="node?.hasChildren?.()"
        class="tree-arrow"
        :class="{ 'tree-arrow-expanded': node?.expanded() }"
        @click="toggleExpand"
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
import type { Node } from '@/core/Node'

interface Props {
  node: Node
}

const props = defineProps<Props>()

const toggleExpand = () => {
  props.node?.toggleExpand()
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
}

.tree-content:hover {
  background-color: #f5f5f5;
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
