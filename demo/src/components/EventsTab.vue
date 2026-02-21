<template>
  <div class="demo-section">
    <h2>Events System</h2>
    <p class="info-text">
      All tree interactions emit events. Monitor the event log below to see events as they happen.
      Try selecting nodes, checking boxes, expanding/collapsing, and dragging.
    </p>

    <div class="events-container">
      <EventLog
        :entries="eventLog"
        @clear="clearEventLog"
      />

      <div class="events-tree">
        <h3>Interactive Tree</h3>
        <p class="events-tree__hint">
          Click, check, expand, and drag nodes to trigger events.
        </p>
        <TreeRoot
          ref="eventsTreeRef"
          :data="eventsData"
          :options="eventsOptions"
        />
      </div>
    </div>

    <div class="events-docs">
      <h3>Available Events</h3>
      <ul class="events-list">
        <li><strong>node:selected</strong> — Node is selected</li>
        <li><strong>node:unselected</strong> — Node is unselected</li>
        <li><strong>node:checked</strong> — Node checkbox is checked</li>
        <li><strong>node:unchecked</strong> — Node checkbox is unchecked</li>
        <li><strong>node:expanded</strong> — Node is expanded</li>
        <li><strong>node:collapsed</strong> — Node is collapsed</li>
        <li><strong>node:focused</strong> — Node receives focus</li>
        <li><strong>node:text:changed</strong> — Node text changes</li>
        <li><strong>node:data:changed</strong> — Node data changes</li>
        <li><strong>node:removed</strong> — Node is removed</li>
        <li><strong>node:dragstart</strong> — Dragging starts</li>
        <li><strong>node:dropped</strong> — Node is dropped</li>
        <li><strong>tree:filtered</strong> — Tree is filtered</li>
      </ul>
      <p style="margin-top: 1rem;">
        See <a
          href="https://github.com/your-repo/liquor-tree-vue3/blob/main/EVENTS.md"
          target="_blank"
        >EVENTS.md</a> for full documentation.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TreeRoot from '../../../src/components/TreeRoot.vue'
import EventLog from './shared/EventLog.vue'
import type { TreeNodeData, TreeOptions } from '../../../src/types'

const eventsTreeRef = ref<InstanceType<typeof TreeRoot> | null>(null)
const eventLog = ref<Array<{ time: string; name: string; details: string; type: string }>>([])

const eventsData: TreeNodeData[] = [
  {
    text: 'Documents',
    state: { expanded: true },
    children: [
      { text: 'Work' },
      { text: 'Personal' }
    ]
  },
  {
    text: 'Photos',
    state: { expanded: true },
    children: [
      { text: '2023' },
      { text: '2024' }
    ]
  },
  { text: 'Downloads' }
]

const eventsOptions: TreeOptions = {
  checkbox: true,
  dnd: { enabled: true }
}

const logEvent = (name: string, details: string, type: string = 'info') => {
  const time = new Date().toLocaleTimeString()
  eventLog.value.unshift({ time, name, details, type })
  if (eventLog.value.length > 50) {
    eventLog.value = eventLog.value.slice(0, 50)
  }
}

const clearEventLog = () => {
  eventLog.value = []
}

onMounted(() => {
  if (eventsTreeRef.value?.tree) {
    const tree = eventsTreeRef.value.tree

    tree.$on('node:selected',   (node) => logEvent('node:selected',   `Selected "${node.text}"`,   'selection'))
    tree.$on('node:unselected', (node) => logEvent('node:unselected', `Unselected "${node.text}"`, 'selection'))
    tree.$on('node:checked',    (node) => logEvent('node:checked',    `Checked "${node.text}"`,    'checkbox'))
    tree.$on('node:unchecked',  (node) => logEvent('node:unchecked',  `Unchecked "${node.text}"`,  'checkbox'))
    tree.$on('node:expanded',   (node) => logEvent('node:expanded',   `Expanded "${node.text}"`,   'state'))
    tree.$on('node:collapsed',  (node) => logEvent('node:collapsed',  `Collapsed "${node.text}"`,  'state'))
    tree.$on('node:focused',    (node) => logEvent('node:focused',    `Focused "${node.text}"`,    'state'))

    tree.$on('node:text:changed', (_node, newText, oldText) =>
      logEvent('node:text:changed', `"${oldText}" → "${newText}"`, 'data'))

    tree.$on('node:data:changed', (node, _data) =>
      logEvent('node:data:changed', `Data updated for "${node.text}"`, 'data'))

    tree.$on('node:removed', (node) =>
      logEvent('node:removed', `Removed "${node.text}"`, 'structure'))

    tree.$on('node:dragstart', (node) =>
      logEvent('node:dragstart', `Started dragging "${node.text}"`, 'dnd'))

    tree.$on('node:dropped', (dragNode, targetNode, placement) =>
      logEvent('node:dropped', `"${dragNode.text}" dropped ${placement} "${targetNode.text}"`, 'dnd'))

    tree.$on('tree:filtered', (matches, query) => {
      if (query) {
        logEvent('tree:filtered', `${matches.length} matches for "${query}"`, 'filter')
      } else {
        logEvent('tree:filtered', 'Filter cleared', 'filter')
      }
    })
  }
})
</script>

<style scoped>
.events-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.events-tree {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.events-tree h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.1rem;
  border-bottom: 2px solid #2196f3;
  padding-bottom: 0.5rem;
}

.events-tree__hint {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 1rem;
}

.events-docs {
  background: #f9f9f9;
  padding: 1.5rem;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.events-docs h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
  border-bottom: 2px solid #42b983;
  padding-bottom: 0.5rem;
}

.events-list {
  list-style: none;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 0.5rem;
}

.events-list li {
  padding: 0.5rem;
  background: white;
  border-radius: 3px;
  border: 1px solid #e0e0e0;
  font-size: 0.9rem;
}

.events-list strong {
  color: #2196f3;
  font-family: monospace;
}

@media (max-width: 768px) {
  .events-container {
    grid-template-columns: 1fr;
  }

  .events-list {
    grid-template-columns: 1fr;
  }
}
</style>
