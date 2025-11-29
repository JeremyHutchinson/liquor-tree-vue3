<template>
  <li class="tree-node">
    <div class="tree-content">
      <span class="tree-text">{{ node.text }}</span>
    </div>

    <!-- Recursively render children -->
    <ul v-if="node.hasChildren()" class="tree-children">
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

defineProps<Props>()
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
}

.tree-content:hover {
  background-color: #f5f5f5;
}

.tree-text {
  font-size: 14px;
}

.tree-children {
  list-style: none;
  margin: 0;
  padding-left: 20px;
}
</style>
