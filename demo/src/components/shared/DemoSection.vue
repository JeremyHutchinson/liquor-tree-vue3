<template>
  <div class="demo-section">
    <h2>{{ title }}</h2>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>
