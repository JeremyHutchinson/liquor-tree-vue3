<template>
  <div class="event-log">
    <div class="event-log__header">
      <h3>Event Log</h3>
      <button class="clear-button" @click="$emit('clear')">Clear Log</button>
    </div>
    <div class="log-entries">
      <div
        v-for="(entry, index) in entries"
        :key="index"
        class="log-entry"
        :class="`log-${entry.type}`"
      >
        <span class="log-time">{{ entry.time }}</span>
        <span class="log-name">{{ entry.name }}</span>
        <span class="log-details">{{ entry.details }}</span>
      </div>
      <div v-if="entries.length === 0" class="log-empty">
        No events yet. Interact with the tree to see events.
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  entries: Array<{ time: string; name: string; details: string; type: string }>
}>()

defineEmits<{
  clear: []
}>()
</script>

<style scoped>
.event-log {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.event-log__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.event-log h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
  border-bottom: 2px solid #2196f3;
  padding-bottom: 0.5rem;
  flex: 1;
}

.log-entries {
  max-height: 400px;
  overflow-y: auto;
  font-family: monospace;
  font-size: 0.85rem;
}

.log-entry {
  padding: 0.5rem;
  margin-bottom: 0.25rem;
  border-left: 3px solid #ccc;
  background: white;
  border-radius: 2px;
}

.log-entry.log-selection { border-left-color: #2196f3; background: #e3f2fd; }
.log-entry.log-checkbox  { border-left-color: #4caf50; background: #e8f5e9; }
.log-entry.log-state     { border-left-color: #ff9800; background: #fff3e0; }
.log-entry.log-data      { border-left-color: #9c27b0; background: #f3e5f5; }
.log-entry.log-structure { border-left-color: #f44336; background: #ffebee; }
.log-entry.log-dnd       { border-left-color: #00bcd4; background: #e0f7fa; }
.log-entry.log-filter    { border-left-color: #ffc107; background: #fff8e1; }

.log-time    { color: #666; margin-right: 0.5rem; font-size: 0.8em; }
.log-name    { font-weight: bold; color: #2c3e50; margin-right: 0.5rem; }
.log-details { color: #555; }

.log-empty {
  padding: 2rem;
  text-align: center;
  color: #999;
  font-style: italic;
}
</style>
