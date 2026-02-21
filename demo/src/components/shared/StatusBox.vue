<template>
  <div
    class="status-box"
    :class="`status-box--${variant}`"
  >
    <strong>Last Action:</strong> {{ message || empty }}
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  message?: string
  empty?: string
  variant?: 'green' | 'blue'
}>(), {
  message: '',
  empty: 'No changes yet',
  variant: 'blue'
})
</script>

<style scoped>
.status-box {
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #f5f5f5;
  border-radius: 3px;
  font-size: 0.9rem;
  color: #333;
}

.status-box--green {
  border-left: 3px solid #42b983;
}

.status-box--blue {
  border-left: 3px solid #2196f3;
}
</style>
