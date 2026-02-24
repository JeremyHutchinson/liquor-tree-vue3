# Demo Site Refactor Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Break `demo/src/App.vue` (1,396 lines) into per-tab components with shared sub-components, and move global/shared CSS into `style.css`.

**Architecture:** `App.vue` becomes a ~50-line shell that renders the header, tab bar, and dynamically swaps the active tab component. Eleven tab components own their data and logic. Four shared components handle repeated UI patterns. Global styles and shared utility classes live in `style.css`; per-component styles stay as `<style scoped>` blocks.

**Tech Stack:** Vue 3 Composition API (`<script setup lang="ts">`), TypeScript, Vite dev server (`npm run dev` in the `demo/` directory — run as `vite --config demo/vite.config.ts` or via the root `npm run dev`).

**Verify the dev server works before starting:** `npm run dev` — confirm the demo loads in the browser at `http://localhost:8081`.

---

## Task 1: Fix `style.css` and extract global/shared CSS

**Files:**
- Modify: `demo/src/style.css`

The current `style.css` has Vite scaffold defaults (dark background, vertically-centered body) that fight against the demo's light design. Replace it entirely with global styles pulled from `App.vue`'s `<style scoped>` block.

**Step 1: Replace `demo/src/style.css` with this content**

```css
:root {
  font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  line-height: 1.5;
  font-weight: 400;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  background: #f5f5f5;
  color: #333;
}

/* App shell */
.app-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.app-header {
  background: white;
  padding: 2rem;
  text-align: center;
  border-bottom: 1px solid #e0e0e0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.app-header p {
  margin: 0;
  color: #666;
}

.tabs-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 2px solid #e0e0e0;
  flex-wrap: wrap;
}

.tab {
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 1rem;
  color: #666;
  transition: all 0.2s;
  position: relative;
  bottom: -2px;
}

.tab:hover {
  color: #2196f3;
  background: #f5f5f5;
}

.tab-active {
  color: #2196f3;
  border-bottom-color: #2196f3;
  font-weight: 600;
}

.tab-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.demo-section {
  padding: 2rem;
}

.demo-section h2 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 2px solid #42b983;
  padding-bottom: 0.5rem;
}

.demo-section h3 {
  color: #2c3e50;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

/* Shared utility classes used across multiple tabs */

.info-text {
  margin: 0 0 1rem 0;
  padding: 0.75rem;
  background-color: #e3f2fd;
  border-left: 3px solid #2196f3;
  border-radius: 3px;
  font-size: 0.9rem;
  color: #1565c0;
}

.clear-button {
  padding: 0.5rem 1rem;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.clear-button:hover {
  background-color: #d32f2f;
}
```

**Step 2: Verify the dev server still loads**

Run `npm run dev` and confirm the demo page loads (styles will look slightly different — shell colors OK, component-specific styles still inside App.vue for now).

**Step 3: Commit**

```bash
git add demo/src/style.css
git commit -m "refactor(demo): replace vite scaffold styles with app globals"
```

---

## Task 2: Create shared component — `InfoText.vue`

**Files:**
- Create: `demo/src/components/shared/InfoText.vue`

This wraps the recurring blue info-box pattern.

**Step 1: Create `demo/src/components/shared/InfoText.vue`**

```vue
<template>
  <p class="info-text">
    <slot />
  </p>
</template>
```

No `<style>` block needed — `.info-text` is now global in `style.css`.

**Step 2: No test needed (pure presentational passthrough). Commit.**

```bash
git add demo/src/components/shared/InfoText.vue
git commit -m "refactor(demo): add shared InfoText component"
```

---

## Task 3: Create shared component — `DemoSection.vue`

**Files:**
- Create: `demo/src/components/shared/DemoSection.vue`

Wraps each demo with an `h2` heading inside the `.demo-section` container.

**Step 1: Create `demo/src/components/shared/DemoSection.vue`**

```vue
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
```

**Step 2: Commit**

```bash
git add demo/src/components/shared/DemoSection.vue
git commit -m "refactor(demo): add shared DemoSection component"
```

---

## Task 4: Create shared component — `StatusBox.vue`

**Files:**
- Create: `demo/src/components/shared/StatusBox.vue`

Used by EditingTab (green accent) and DragDropTab (blue accent).

**Step 1: Create `demo/src/components/shared/StatusBox.vue`**

```vue
<template>
  <div class="status-box" :class="`status-box--${variant}`">
    <strong>Last Action:</strong> {{ message || empty }}
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  message?: string
  empty?: string
  variant?: 'green' | 'blue'
}>(), {
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
```

**Step 2: Commit**

```bash
git add demo/src/components/shared/StatusBox.vue
git commit -m "refactor(demo): add shared StatusBox component"
```

---

## Task 5: Create shared component — `EventLog.vue`

**Files:**
- Create: `demo/src/components/shared/EventLog.vue`

The scrollable color-coded event log used by the Events tab. Accepts `entries` prop, emits `clear`.

**Step 1: Create `demo/src/components/shared/EventLog.vue`**

```vue
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
```

**Step 2: Commit**

```bash
git add demo/src/components/shared/EventLog.vue
git commit -m "refactor(demo): add shared EventLog component"
```

---

## Task 6: Extract `BasicTab.vue`

**Files:**
- Create: `demo/src/components/BasicTab.vue`

**Step 1: Create `demo/src/components/BasicTab.vue`**

Copy the `basicData` const and the `v-if="activeTab === 'basic'"` div from App.vue:

```vue
<template>
  <div class="demo-section">
    <h2>Basic Tree Example</h2>
    <p class="info-text">Simple tree with expand/collapse functionality.</p>
    <TreeRoot :data="basicData" />
  </div>
</template>

<script setup lang="ts">
import TreeRoot from '../../../src/components/TreeRoot.vue'
import type { TreeNodeData } from '../../../src/types'

const basicData: TreeNodeData[] = [
  {
    text: 'Design System',
    state: { expanded: true },
    children: [
      {
        text: 'Components',
        state: { expanded: true },
        children: [
          {
            text: 'Inputs',
            children: [
              { text: 'Button' },
              { text: 'Text Field' },
              { text: 'Checkbox' },
              { text: 'Radio' }
            ]
          },
          {
            text: 'Layout',
            children: [
              { text: 'Grid' },
              { text: 'Stack' },
              { text: 'Divider' }
            ]
          },
          {
            text: 'Feedback',
            children: [
              { text: 'Alert' },
              { text: 'Toast' },
              { text: 'Progress' }
            ]
          }
        ]
      },
      {
        text: 'Tokens',
        children: [
          { text: 'Colors' },
          { text: 'Typography' },
          { text: 'Spacing' },
          { text: 'Shadows' }
        ]
      },
      {
        text: 'Guidelines',
        children: [
          { text: 'Accessibility' },
          { text: 'Motion' },
          { text: 'Writing' }
        ]
      }
    ]
  },
  {
    text: 'Platform',
    children: [
      {
        text: 'Web',
        children: [
          { text: 'React' },
          { text: 'Vue' },
          { text: 'Angular' }
        ]
      },
      {
        text: 'Mobile',
        children: [
          { text: 'iOS' },
          { text: 'Android' }
        ]
      }
    ]
  }
]
</script>
```

**Step 2: Commit**

```bash
git add demo/src/components/BasicTab.vue
git commit -m "refactor(demo): extract BasicTab component"
```

---

## Task 7: Extract `SelectionTab.vue`

**Files:**
- Create: `demo/src/components/SelectionTab.vue`

**Step 1: Create `demo/src/components/SelectionTab.vue`**

```vue
<template>
  <div class="demo-section">
    <h2>Selection Examples</h2>

    <h3>Single Selection</h3>
    <p class="info-text">Click a node to select it. Selecting another node will deselect the previous one.</p>
    <TreeRoot :data="nestedData" :options="treeOptions" />

    <h3 style="margin-top: 2rem;">Multiple Selection</h3>
    <p class="info-text">
      <strong>Cmd/Ctrl + click</strong> to add individual nodes to the selection.
      <strong>Shift + click</strong> to select a contiguous range of nodes between your last click and the current one.
    </p>
    <TreeRoot :data="multiSelectData" :options="multiSelectOptions" />
  </div>
</template>

<script setup lang="ts">
import TreeRoot from '../../../src/components/TreeRoot.vue'
import type { TreeNodeData, TreeOptions } from '../../../src/types'

const nestedData: TreeNodeData[] = [
  {
    text: 'Root 1',
    state: { expanded: true },
    children: [
      {
        text: 'Child 1.1',
        state: { expanded: true },
        children: [
          { text: 'Grandchild 1.1.1' },
          { text: 'Grandchild 1.1.2' }
        ]
      },
      { text: 'Child 1.2' }
    ]
  },
  {
    text: 'Root 2',
    state: { expanded: true },
    children: [
      { text: 'Child 2.1' },
      { text: 'Child 2.2' }
    ]
  },
  { text: 'Root 3' }
]

const treeOptions: TreeOptions = {
  multiple: false,
  checkbox: false
}

const multiSelectData: TreeNodeData[] = [
  {
    text: 'Frontend',
    state: { expanded: true },
    children: [
      { text: 'React' },
      { text: 'Vue' },
      { text: 'Angular' },
      { text: 'Svelte' }
    ]
  },
  {
    text: 'Backend',
    state: { expanded: true },
    children: [
      { text: 'Node.js' },
      { text: 'Django' },
      { text: 'Rails' },
      { text: 'Spring' }
    ]
  },
  {
    text: 'Mobile',
    state: { expanded: true },
    children: [
      { text: 'React Native' },
      { text: 'Flutter' },
      { text: 'Swift' }
    ]
  }
]

const multiSelectOptions: TreeOptions = {
  multiple: true,
  checkbox: false
}
</script>
```

**Step 2: Commit**

```bash
git add demo/src/components/SelectionTab.vue
git commit -m "refactor(demo): extract SelectionTab component"
```

---

## Task 8: Extract `CheckboxTab.vue`

**Files:**
- Create: `demo/src/components/CheckboxTab.vue`

**Step 1: Create `demo/src/components/CheckboxTab.vue`**

```vue
<template>
  <div class="demo-section">
    <h2>Checkbox Example</h2>
    <p class="info-text">
      Click checkboxes to check/uncheck nodes. With autoCheckChildren enabled,
      checking a parent automatically checks all children. Parent checkboxes show
      an indeterminate state (−) when some but not all children are checked.
    </p>
    <TreeRoot :data="checkboxData" :options="checkboxOptions" />
  </div>
</template>

<script setup lang="ts">
import TreeRoot from '../../../src/components/TreeRoot.vue'
import type { TreeNodeData, TreeOptions } from '../../../src/types'

const checkboxData: TreeNodeData[] = [
  {
    text: 'Project Files',
    state: { expanded: true },
    children: [
      {
        text: 'src',
        state: { expanded: true },
        children: [
          { text: 'index.ts' },
          { text: 'App.vue' },
          { text: 'main.ts' }
        ]
      },
      {
        text: 'tests',
        state: { expanded: true },
        children: [
          { text: 'unit.spec.ts' },
          { text: 'integration.spec.ts' }
        ]
      }
    ]
  },
  {
    text: 'Documentation',
    state: { expanded: true },
    children: [
      { text: 'README.md' },
      { text: 'API.md' },
      { text: 'CHANGELOG.md' }
    ]
  }
]

const checkboxOptions: TreeOptions = {
  checkbox: true,
  autoCheckChildren: true
}
</script>
```

**Step 2: Commit**

```bash
git add demo/src/components/CheckboxTab.vue
git commit -m "refactor(demo): extract CheckboxTab component"
```

---

## Task 9: Extract `FilterTab.vue`

**Files:**
- Create: `demo/src/components/FilterTab.vue`

**Step 1: Create `demo/src/components/FilterTab.vue`**

```vue
<template>
  <div class="demo-section">
    <h2>Filter &amp; Search</h2>
    <p class="info-text">
      Type to filter the tree. Only matching nodes and their parent paths will be shown.
      Clear the input to show all nodes again.
    </p>
    <div class="filter-controls">
      <input
        v-model="filterQuery"
        type="text"
        placeholder="Type to filter tree..."
        class="filter-input"
        @input="handleFilter"
      />
      <button v-if="filterQuery" class="clear-button" @click="clearFilter">Clear</button>
    </div>
    <TreeRoot ref="filterTreeRef" :data="filterData" :options="filterOptions" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TreeRoot from '../../../src/components/TreeRoot.vue'
import type { TreeNodeData, TreeOptions } from '../../../src/types'

const filterQuery = ref('')
const filterTreeRef = ref<InstanceType<typeof TreeRoot> | null>(null)

const filterData: TreeNodeData[] = [
  {
    text: 'Programming Languages',
    state: { expanded: true },
    children: [
      {
        text: 'JavaScript',
        state: { expanded: true },
        children: [
          { text: 'React' },
          { text: 'Vue' },
          { text: 'Angular' }
        ]
      },
      {
        text: 'Python',
        state: { expanded: true },
        children: [
          { text: 'Django' },
          { text: 'Flask' },
          { text: 'FastAPI' }
        ]
      },
      {
        text: 'TypeScript',
        state: { expanded: true },
        children: [
          { text: 'Next.js' },
          { text: 'Nest.js' }
        ]
      }
    ]
  },
  {
    text: 'Databases',
    state: { expanded: true },
    children: [
      { text: 'PostgreSQL' },
      { text: 'MongoDB' },
      { text: 'Redis' },
      { text: 'SQLite' }
    ]
  },
  {
    text: 'DevOps Tools',
    state: { expanded: true },
    children: [
      { text: 'Docker' },
      { text: 'Kubernetes' },
      { text: 'Jenkins' },
      { text: 'GitLab CI' }
    ]
  }
]

const filterOptions: TreeOptions = {
  filter: {
    emptyText: 'No matches found',
    showChildren: true
  }
}

const handleFilter = () => {
  if (filterTreeRef.value?.tree) {
    filterTreeRef.value.tree.filter(filterQuery.value)
  }
}

const clearFilter = () => {
  filterQuery.value = ''
  if (filterTreeRef.value?.tree) {
    filterTreeRef.value.tree.clearFilter()
  }
}
</script>

<style scoped>
.filter-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.filter-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.filter-input:focus {
  outline: none;
  border-color: #2196f3;
}
</style>
```

**Step 2: Commit**

```bash
git add demo/src/components/FilterTab.vue
git commit -m "refactor(demo): extract FilterTab component"
```

---

## Task 10: Extract `SortingTab.vue`

**Files:**
- Create: `demo/src/components/SortingTab.vue`

**Step 1: Create `demo/src/components/SortingTab.vue`**

```vue
<template>
  <div class="demo-section">
    <h2>Sorting</h2>
    <p class="info-text">
      Click buttons to sort the tree alphabetically (A-Z or Z-A). The "Deep Sort" option
      also sorts all nested children, not just the top level.
    </p>
    <div class="sort-controls">
      <button class="sort-button" @click="sortAscending(false)">Sort A-Z</button>
      <button class="sort-button" @click="sortDescending(false)">Sort Z-A</button>
      <button class="sort-button" @click="sortAscending(true)">Deep Sort A-Z</button>
      <button class="sort-button" @click="sortDescending(true)">Deep Sort Z-A</button>
      <button class="sort-button reset-button" @click="resetSort">Reset</button>
    </div>
    <TreeRoot ref="sortTreeRef" :data="sortData" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TreeRoot from '../../../src/components/TreeRoot.vue'
import type { TreeNodeData } from '../../../src/types'

const sortTreeRef = ref<InstanceType<typeof TreeRoot> | null>(null)

const originalSortData: TreeNodeData[] = [
  {
    text: 'Vegetables',
    state: { expanded: true },
    children: [
      { text: 'Zucchini' },
      { text: 'Carrot' },
      { text: 'Broccoli' },
      { text: 'Asparagus' }
    ]
  },
  {
    text: 'Fruits',
    state: { expanded: true },
    children: [
      { text: 'Watermelon' },
      { text: 'Apple' },
      { text: 'Mango' },
      { text: 'Banana' }
    ]
  },
  {
    text: 'Grains',
    state: { expanded: true },
    children: [
      { text: 'Wheat' },
      { text: 'Rice' },
      { text: 'Oats' },
      { text: 'Quinoa' }
    ]
  }
]

const sortData = ref<TreeNodeData[]>(JSON.parse(JSON.stringify(originalSortData)))

const sortAscending = (deep: boolean) => {
  if (sortTreeRef.value?.tree) {
    sortTreeRef.value.tree.sort((a, b) => a.text.localeCompare(b.text), deep)
  }
}

const sortDescending = (deep: boolean) => {
  if (sortTreeRef.value?.tree) {
    sortTreeRef.value.tree.sort((a, b) => b.text.localeCompare(a.text), deep)
  }
}

const resetSort = () => {
  sortData.value = JSON.parse(JSON.stringify(originalSortData))
}
</script>

<style scoped>
.sort-controls {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.sort-button {
  padding: 0.5rem 1rem;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.sort-button:hover {
  background-color: #1976d2;
}

.sort-button.reset-button {
  background-color: #9e9e9e;
}

.sort-button.reset-button:hover {
  background-color: #757575;
}
</style>
```

**Step 2: Commit**

```bash
git add demo/src/components/SortingTab.vue
git commit -m "refactor(demo): extract SortingTab component"
```

---

## Task 11: Extract `KeyboardTab.vue`

**Files:**
- Create: `demo/src/components/KeyboardTab.vue`

**Step 1: Create `demo/src/components/KeyboardTab.vue`**

```vue
<template>
  <div class="demo-section">
    <h2>Keyboard Navigation</h2>
    <p class="info-text">
      Click a node to focus it, then use keyboard shortcuts:
    </p>
    <ul class="keyboard-list">
      <li><kbd>↑</kbd> / <kbd>↓</kbd> — Navigate up/down through visible nodes</li>
      <li><kbd>←</kbd> — Collapse node or move to parent</li>
      <li><kbd>→</kbd> — Expand node or move to first child</li>
      <li><kbd>Enter</kbd> / <kbd>Space</kbd> — Toggle checkbox (if enabled)</li>
    </ul>
    <TreeRoot :data="nestedData" :options="treeOptions" />
  </div>
</template>

<script setup lang="ts">
import TreeRoot from '../../../src/components/TreeRoot.vue'
import type { TreeNodeData, TreeOptions } from '../../../src/types'

const nestedData: TreeNodeData[] = [
  {
    text: 'Root 1',
    state: { expanded: true },
    children: [
      {
        text: 'Child 1.1',
        state: { expanded: true },
        children: [
          { text: 'Grandchild 1.1.1' },
          { text: 'Grandchild 1.1.2' }
        ]
      },
      { text: 'Child 1.2' }
    ]
  },
  {
    text: 'Root 2',
    state: { expanded: true },
    children: [
      { text: 'Child 2.1' },
      { text: 'Child 2.2' }
    ]
  },
  { text: 'Root 3' }
]

const treeOptions: TreeOptions = {
  multiple: false,
  checkbox: false
}
</script>

<style scoped>
.keyboard-list {
  list-style: none;
  padding: 0;
  margin: 1rem 0 2rem 0;
}

.keyboard-list li {
  padding: 0.5rem 0;
  color: #333;
}

.keyboard-list kbd {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
</style>
```

**Step 2: Commit**

```bash
git add demo/src/components/KeyboardTab.vue
git commit -m "refactor(demo): extract KeyboardTab component"
```

---

## Task 12: Extract `EditingTab.vue`

**Files:**
- Create: `demo/src/components/EditingTab.vue`

**Step 1: Create `demo/src/components/EditingTab.vue`**

```vue
<template>
  <div class="demo-section">
    <h2>Inline Node Editing</h2>
    <p class="info-text">
      <strong>Double-click</strong> any node to edit its text inline.
      Press <kbd>Enter</kbd> or click away to save. Press <kbd>Escape</kbd> to cancel.
      You can also press <kbd>F2</kbd> to start editing the focused node via keyboard.
    </p>

    <StatusBox :message="editingStatus" empty="No changes yet" variant="green" />

    <TreeRoot ref="editingTreeRef" :data="editingData" :options="editingOptions" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TreeRoot from '../../../src/components/TreeRoot.vue'
import StatusBox from './shared/StatusBox.vue'
import type { TreeNodeData, TreeOptions } from '../../../src/types'

const editingTreeRef = ref<InstanceType<typeof TreeRoot> | null>(null)
const editingStatus = ref('')

const editingData: TreeNodeData[] = [
  {
    text: 'Project Alpha',
    state: { expanded: true },
    children: [
      {
        text: 'Planning',
        state: { expanded: true },
        children: [
          { text: 'Requirements' },
          { text: 'Architecture' },
          { text: 'Timeline' }
        ]
      },
      {
        text: 'Development',
        state: { expanded: true },
        children: [
          { text: 'Frontend' },
          { text: 'Backend' },
          { text: 'Database' }
        ]
      }
    ]
  },
  {
    text: 'Project Beta',
    state: { expanded: true },
    children: [
      { text: 'Research' },
      { text: 'Prototype' },
      { text: 'Review' }
    ]
  }
]

const editingOptions: TreeOptions = {
  editing: true
}

onMounted(() => {
  if (editingTreeRef.value?.tree) {
    editingTreeRef.value.tree.$on('node:text:changed', (_node, newText, oldText) => {
      editingStatus.value = `Renamed "${oldText}" → "${newText}"`
    })
  }
})
</script>

<style scoped>
kbd {
  display: inline-block;
  padding: 0.1rem 0.3rem;
  background: #f5f5f5;
  border: 1px solid #ccc;
  border-radius: 3px;
  font-family: monospace;
  font-size: 0.9em;
}
</style>
```

**Step 2: Commit**

```bash
git add demo/src/components/EditingTab.vue
git commit -m "refactor(demo): extract EditingTab component"
```

---

## Task 13: Extract `DragDropTab.vue`

**Files:**
- Create: `demo/src/components/DragDropTab.vue`

**Step 1: Create `demo/src/components/DragDropTab.vue`**

```vue
<template>
  <div class="demo-section">
    <h2>Drag &amp; Drop</h2>
    <p class="info-text">
      Click and drag nodes to reorder them. Drag to the top/bottom third of a node to insert before/after,
      or to the middle third to make it a child.
    </p>
    <StatusBox :message="dndStatus" empty="No actions yet" variant="blue" />
    <TreeRoot :data="dndData" :options="dndOptions" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import TreeRoot from '../../../src/components/TreeRoot.vue'
import StatusBox from './shared/StatusBox.vue'
import type { TreeNodeData, TreeOptions } from '../../../src/types'

const dndStatus = ref('')

const dndData = ref<TreeNodeData[]>([
  {
    text: 'Team Alpha',
    state: { expanded: true },
    children: [
      { text: 'Alice' },
      { text: 'Bob' },
      { text: 'Charlie' }
    ]
  },
  {
    text: 'Team Beta',
    state: { expanded: true },
    children: [
      { text: 'David' },
      { text: 'Eve' }
    ]
  },
  {
    text: 'Team Gamma',
    state: { expanded: true },
    children: [
      { text: 'Frank' },
      { text: 'Grace' },
      { text: 'Henry' }
    ]
  }
])

const dndOptions: TreeOptions = {
  dnd: {
    enabled: true,
    onDrop: (targetNode, draggedNode, placement) => {
      dndStatus.value = `Moved "${draggedNode.text}" ${placement} "${targetNode.text}"`
      return true
    }
  }
}
</script>
```

**Step 2: Commit**

```bash
git add demo/src/components/DragDropTab.vue
git commit -m "refactor(demo): extract DragDropTab component"
```

---

## Task 14: Extract `AsyncTab.vue`

**Files:**
- Create: `demo/src/components/AsyncTab.vue`

**Step 1: Create `demo/src/components/AsyncTab.vue`**

```vue
<template>
  <div class="demo-section">
    <h2>Async Data Loading</h2>
    <p class="info-text">
      Click the expand arrow on nodes with a ⏳ to load their children asynchronously.
      The hourglass icon indicates a node that will fetch data when expanded.
    </p>

    <h3>Simulated API Fetch</h3>
    <p class="info-text">
      These nodes simulate API calls with a 1-second delay. Watch the loading spinner appear while data is being fetched!
    </p>
    <TreeRoot :data="asyncData" :options="asyncOptions" />
  </div>
</template>

<script setup lang="ts">
import TreeRoot from '../../../src/components/TreeRoot.vue'
import type { TreeNodeData, TreeOptions } from '../../../src/types'

const asyncData: TreeNodeData[] = [
  { text: 'Products', id: 'products', isBatch: true },
  { text: 'Services', id: 'services', isBatch: true },
  { text: 'Support',  id: 'support',  isBatch: true }
]

const mockAsyncData: Record<string, TreeNodeData[]> = {
  products: [
    { text: 'Electronics', id: 'electronics', isBatch: true },
    { text: 'Clothing',    id: 'clothing',    isBatch: true },
    {
      text: 'Books',
      id: 'books',
      children: [
        { text: 'Fiction' },
        { text: 'Non-Fiction' },
        { text: 'Technical' }
      ]
    }
  ],
  services: [
    {
      text: 'Consulting',
      id: 'consulting',
      children: [
        { text: 'Strategy' },
        { text: 'Implementation' }
      ]
    },
    {
      text: 'Training',
      id: 'training',
      children: [
        { text: 'Online Courses' },
        { text: 'Workshops' }
      ]
    }
  ],
  support: [
    {
      text: 'Documentation',
      children: [
        { text: 'Getting Started' },
        { text: 'API Reference' },
        { text: 'Examples' }
      ]
    },
    {
      text: 'Community',
      children: [
        { text: 'Forums' },
        { text: 'Discord' },
        { text: 'Stack Overflow' }
      ]
    }
  ],
  electronics: [
    { text: 'Laptops' },
    { text: 'Smartphones' },
    { text: 'Tablets' }
  ],
  clothing: [
    { text: 'Shirts' },
    { text: 'Pants' },
    { text: 'Shoes' }
  ]
}

const asyncOptions: TreeOptions = {
  fetchData: async (node) => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return mockAsyncData[node.id as string] || []
  },
  onFetchError: (error, node) => {
    console.error(`Error loading children for ${node.text}:`, error)
  }
}
</script>
```

**Step 2: Commit**

```bash
git add demo/src/components/AsyncTab.vue
git commit -m "refactor(demo): extract AsyncTab component"
```

---

## Task 15: Extract `CustomRenderingTab.vue`

**Files:**
- Create: `demo/src/components/CustomRenderingTab.vue`

**Step 1: Create `demo/src/components/CustomRenderingTab.vue`**

```vue
<template>
  <div class="demo-section">
    <h2>Custom Rendering with Scoped Slots</h2>
    <p class="info-text">
      Use scoped slots to completely customize how nodes are rendered. Access the full node object
      with all its data, methods, and state.
    </p>

    <h3>Example 1: Icons and Badges</h3>
    <p class="info-text">Custom rendering with emoji icons and count badges.</p>
    <TreeRoot :data="customData1">
      <template #default="{ node }">
        <span class="icon-node">
          <span class="icon-node__icon">{{ node.data?.icon || '📄' }}</span>
          <span>{{ node.text }}</span>
          <span v-if="node.data?.count !== undefined" class="badge">
            {{ node.data.count }}
          </span>
        </span>
      </template>
    </TreeRoot>

    <h3 style="margin-top: 2rem;">Example 2: Rich Content</h3>
    <p class="info-text">Complex HTML with multiple interactive elements.</p>
    <TreeRoot :data="customData2">
      <template #default="{ node }">
        <div class="rich-node">
          <span
            class="status-dot"
            :class="`status-dot--${node.data?.status || 'offline'}`"
          ></span>
          <strong>{{ node.text }}</strong>
          <span v-if="node.data?.role" class="rich-node__role">
            ({{ node.data.role }})
          </span>
          <span v-if="node.data?.email" class="rich-node__email">
            {{ node.data.email }}
          </span>
        </div>
      </template>
    </TreeRoot>

    <h3 style="margin-top: 2rem;">Example 3: Conditional Styling</h3>
    <p class="info-text">Apply different styles based on node properties and state.</p>
    <TreeRoot :data="customData3" :options="{ checkbox: true }">
      <template #default="{ node }">
        <span
          :class="[
            'priority-node',
            node.data?.priority && `priority-node--${node.data.priority}`,
            { 'priority-node--completed': node.data?.completed }
          ]"
        >
          {{ node.text }}
          <span v-if="node.data?.dueDate" class="priority-node__due">
            📅 {{ node.data.dueDate }}
          </span>
        </span>
      </template>
    </TreeRoot>
  </div>
</template>

<script setup lang="ts">
import TreeRoot from '../../../src/components/TreeRoot.vue'
import type { TreeNodeData } from '../../../src/types'

const customData1: TreeNodeData[] = [
  {
    text: 'Inbox',
    data: { icon: '📥', count: 12 },
    state: { expanded: true },
    children: [
      { text: 'Work',     data: { icon: '💼', count: 5 } },
      { text: 'Personal', data: { icon: '👤', count: 7 } }
    ]
  },
  {
    text: 'Sent',
    data: { icon: '📤', count: 42 },
    state: { expanded: true },
    children: [
      { text: 'Recent',  data: { icon: '🕐', count: 8  } },
      { text: 'Archive', data: { icon: '📦', count: 34 } }
    ]
  },
  { text: 'Drafts', data: { icon: '✏️', count: 3 } }
]

const customData2: TreeNodeData[] = [
  {
    text: 'Engineering Team',
    state: { expanded: true },
    children: [
      { text: 'Alice Johnson', data: { status: 'online',  role: 'Frontend Dev', email: 'alice@example.com' } },
      { text: 'Bob Smith',     data: { status: 'away',    role: 'Backend Dev',  email: 'bob@example.com'   } },
      { text: 'Carol Williams',data: { status: 'online',  role: 'DevOps',       email: 'carol@example.com' } }
    ]
  },
  {
    text: 'Design Team',
    state: { expanded: true },
    children: [
      { text: 'David Chen',  data: { status: 'offline', role: 'UI Designer', email: 'david@example.com' } },
      { text: 'Eve Martinez',data: { status: 'online',  role: 'UX Designer', email: 'eve@example.com'   } }
    ]
  }
]

const customData3: TreeNodeData[] = [
  {
    text: 'Sprint Tasks',
    state: { expanded: true },
    children: [
      { text: 'Implement user authentication', data: { priority: 'high',   dueDate: 'Dec 1', completed: false } },
      { text: 'Fix responsive layout',          data: { priority: 'medium', dueDate: 'Dec 3', completed: false } },
      { text: 'Update documentation',           data: { priority: 'low',    dueDate: 'Dec 5', completed: true  } }
    ]
  },
  {
    text: 'Backlog',
    state: { expanded: true },
    children: [
      { text: 'Add dark mode support',    data: { priority: 'medium', completed: false } },
      { text: 'Performance optimization', data: { priority: 'high',   completed: false } }
    ]
  }
]
</script>

<style scoped>
/* Example 1 */
.icon-node {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon-node__icon {
  font-size: 1.2em;
}

.badge {
  background: #2196f3;
  color: white;
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  font-size: 0.75em;
}

/* Example 2 */
.rich-node {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}

.status-dot--online  { background: #4caf50; }
.status-dot--away    { background: #ff9800; }
.status-dot--offline { background: #9e9e9e; }

.rich-node__role  { color: #666; font-size: 0.85em; }
.rich-node__email { color: #999; font-size: 0.8em; margin-left: auto; }

/* Example 3 */
.priority-node {
  color: #333;
}

.priority-node--high   { color: #f44336; font-weight: bold; }
.priority-node--medium { color: #ff9800; }

.priority-node--completed {
  color: #999;
  text-decoration: line-through;
}

.priority-node__due {
  font-size: 0.85em;
  margin-left: 0.5rem;
}
</style>
```

**Step 2: Commit**

```bash
git add demo/src/components/CustomRenderingTab.vue
git commit -m "refactor(demo): extract CustomRenderingTab component"
```

---

## Task 16: Extract `EventsTab.vue`

**Files:**
- Create: `demo/src/components/EventsTab.vue`

**Step 1: Create `demo/src/components/EventsTab.vue`**

```vue
<template>
  <div class="demo-section">
    <h2>Events System</h2>
    <p class="info-text">
      All tree interactions emit events. Monitor the event log below to see events as they happen.
      Try selecting nodes, checking boxes, expanding/collapsing, and dragging.
    </p>

    <div class="events-container">
      <EventLog :entries="eventLog" @clear="clearEventLog" />

      <div class="events-tree">
        <h3>Interactive Tree</h3>
        <p class="events-tree__hint">
          Click, check, expand, and drag nodes to trigger events.
        </p>
        <TreeRoot ref="eventsTreeRef" :data="eventsData" :options="eventsOptions" />
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
        See <a href="https://github.com/your-repo/liquor-tree-vue3/blob/main/EVENTS.md" target="_blank">EVENTS.md</a> for full documentation.
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
```

**Step 2: Commit**

```bash
git add demo/src/components/EventsTab.vue
git commit -m "refactor(demo): extract EventsTab component"
```

---

## Task 17: Rewrite `App.vue` as the shell

**Files:**
- Modify: `demo/src/App.vue`

Replace the entire file. App.vue should only know about tabs and rendering — no data, no demo logic.

**Step 1: Replace `demo/src/App.vue` with**

```vue
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
```

**Step 2: Verify the dev server works**

Run `npm run dev` and manually click through all 11 tabs to confirm each renders correctly. Test:
- Basic: tree expands/collapses
- Selection: single and multi-select work
- Checkboxes: parent/child checking + indeterminate state
- Filter: typing filters the tree, Clear button works
- Sorting: all four sort buttons work, Reset restores original order
- Keyboard: arrow keys navigate the tree
- Editing: double-click edits a node, status bar updates
- Drag & Drop: drag a node, status bar updates
- Async: expand a node, loading spinner appears then children load
- Custom Rendering: icons, status dots, and priority styles display correctly
- Events: interact with the tree, events appear in the log

**Step 3: Commit**

```bash
git add demo/src/App.vue
git commit -m "refactor(demo): reduce App.vue to shell with dynamic tab routing"
```

---

## Task 18: Final cleanup and verification

**Step 1: Check for any leftover unused imports or dead code**

```bash
npm run lint
```

Fix any lint errors reported.

**Step 2: Confirm build succeeds**

```bash
npm run build
```

Expected: successful build with no errors.

**Step 3: Final commit if lint/build changes were needed**

```bash
git add -A
git commit -m "refactor(demo): fix lint issues after component extraction"
```

---

## Summary of files created/modified

| Action | Path |
|--------|------|
| Modified | `demo/src/style.css` |
| Modified | `demo/src/App.vue` |
| Created  | `demo/src/components/BasicTab.vue` |
| Created  | `demo/src/components/SelectionTab.vue` |
| Created  | `demo/src/components/CheckboxTab.vue` |
| Created  | `demo/src/components/FilterTab.vue` |
| Created  | `demo/src/components/SortingTab.vue` |
| Created  | `demo/src/components/KeyboardTab.vue` |
| Created  | `demo/src/components/EditingTab.vue` |
| Created  | `demo/src/components/DragDropTab.vue` |
| Created  | `demo/src/components/AsyncTab.vue` |
| Created  | `demo/src/components/CustomRenderingTab.vue` |
| Created  | `demo/src/components/EventsTab.vue` |
| Created  | `demo/src/components/shared/InfoText.vue` |
| Created  | `demo/src/components/shared/DemoSection.vue` |
| Created  | `demo/src/components/shared/StatusBox.vue` |
| Created  | `demo/src/components/shared/EventLog.vue` |
