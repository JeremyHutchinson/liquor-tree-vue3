<template>
  <div class="app-container">
    <header class="app-header">
      <h1>🌳 Liquor Tree - Vue 3</h1>
      <p>Vue 3 + TypeScript + Composition API migration</p>
    </header>

    <div class="tabs-container">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          :class="['tab', { 'tab-active': activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="tab-content">
        <component :is="activeComponent" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BasicTab           from './components/BasicTab.vue'
import SelectionTab       from './components/SelectionTab.vue'
import CheckboxTab        from './components/CheckboxTab.vue'
import FilterTab          from './components/FilterTab.vue'
import SortingTab         from './components/SortingTab.vue'
import KeyboardTab        from './components/KeyboardTab.vue'
import EditingTab         from './components/EditingTab.vue'
import DragDropTab        from './components/DragDropTab.vue'
import AsyncTab           from './components/AsyncTab.vue'
import CustomRenderingTab from './components/CustomRenderingTab.vue'
import EventsTab          from './components/EventsTab.vue'

const tabs = [
  { id: 'basic',    label: 'Basic',            component: BasicTab           },
  { id: 'selection',label: 'Selection',        component: SelectionTab       },
  { id: 'checkbox', label: 'Checkboxes',       component: CheckboxTab        },
  { id: 'filter',   label: 'Filter',           component: FilterTab          },
  { id: 'sorting',  label: 'Sorting',          component: SortingTab         },
  { id: 'keyboard', label: 'Keyboard',         component: KeyboardTab        },
  { id: 'editing',  label: 'Editing',          component: EditingTab         },
  { id: 'dragdrop', label: 'Drag & Drop',      component: DragDropTab        },
  { id: 'async',    label: 'Async Data',       component: AsyncTab           },
  { id: 'custom',   label: 'Custom Rendering', component: CustomRenderingTab },
  { id: 'events',   label: 'Events',           component: EventsTab          },
]

const activeTab = ref('basic')

const activeComponent = computed(
  () => tabs.find(t => t.id === activeTab.value)?.component ?? BasicTab
)
</script>
