<template>
  <div class="liquor-tree">
    <!-- Tree component placeholder - will be implemented in Phase 2 -->
    <p>Tree component coming soon...</p>
  </div>
</template>

<script setup lang="ts">
import type { TreeNode, TreeOptions } from '@/types'

interface Props {
  data?: TreeNode[]
  options?: TreeOptions
}

defineProps<Props>()
</script>

<style scoped>
.liquor-tree {
  font-family: sans-serif;
}
</style>
