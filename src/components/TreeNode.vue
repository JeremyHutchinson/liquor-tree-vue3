<template>
  <li class="tree-node">
    <div class="tree-content">
      <span class="tree-text">{{ node.text }}</span>
    </div>
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

.tree-text {
  font-size: 14px;
}
</style>
