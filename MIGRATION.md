# Migration Guide: Vue 2 to Vue 3

This guide helps you migrate from Liquor Tree Vue 2 to the Vue 3 version.

## Table of Contents

- [Breaking Changes](#breaking-changes)
- [Code Examples](#code-examples)
- [New Features](#new-features)
- [Deprecated Features](#deprecated-features)
- [Step-by-Step Migration](#step-by-step-migration)

---

## Breaking Changes

### 1. Vue Version Requirement

**Vue 2:**
```json
"peerDependencies": {
  "vue": "^2.x"
}
```

**Vue 3:**
```json
"peerDependencies": {
  "vue": "^3.3.0"
}
```

**Action Required:** Upgrade your project to Vue 3 before installing this package.

---

### 2. Architecture: Options API → Composition API

The component has been completely rewritten using Vue 3's Composition API.

**Impact:** This is mostly internal, but:
- TypeScript support is now first-class
- Better tree-shaking and performance
- More predictable reactivity

---

### 3. Changed Default Options

Several options have different defaults:

| Option | Vue 2 Default | Vue 3 Default | Reasoning |
|--------|---------------|---------------|-----------|
| `multiple` | `true` | `false` | Single selection is more common default |
| `parentSelect` | `false` | `true` | More intuitive behavior |
| `autoCheckChildren` | `true` | `false` | Give users explicit control |

**Migration:**
```javascript
// Vue 2 (relied on defaults)
const options = {}

// Vue 3 (explicitly set if you want old behavior)
const options = {
  multiple: true,
  parentSelect: false,
  autoCheckChildren: true
}
```

---

### 4. Removed Props

#### `filter` Prop (Removed)

**Vue 2:**
```vue
<tree :data="data" :filter="searchQuery" />
```

**Vue 3:**
```vue
<TreeRoot ref="treeRef" :data="data" />

<script setup>
import { ref, watch } from 'vue'

const treeRef = ref()
const searchQuery = ref('')

watch(searchQuery, (query) => {
  treeRef.value?.tree.filter(query)
})
</script>
```

**Why:** Simplifies the component API. Filtering is now done programmatically via the tree instance.

---

#### `tag` Prop (Removed)

**Vue 2:**
```vue
<tree :data="data" tag="section" />
```

**Vue 3:**
```vue
<!-- Always renders as <div> -->
<TreeRoot :data="data" />

<!-- If you need a different tag, wrap it: -->
<section>
  <TreeRoot :data="data" />
</section>
```

**Why:** Simplifies component internals. The wrapping element doesn't affect tree functionality.

---

### 5. Removed Options

The following options have been removed:

- **`direction`** - No longer needed (use CSS for RTL/LTR)
- **`autoDisableChildren`** - Not commonly used
- **`checkDisabledChildren`** - Not commonly used
- **`nodeIndent`** - Use CSS instead: `.tree-node { padding-left: 20px; }`
- **`minFetchDelay`** - Not needed with modern loading states
- **`deletion`** - Use node methods directly: `node.remove()`

**Migration:**

```javascript
// Vue 2
const options = {
  nodeIndent: 32,
  deletion: true,
  direction: 'rtl'
}

// Vue 3
const options = {}

// Use CSS for indentation
<style>
.tree-children .tree-node {
  padding-left: 32px;
}

/* RTL support */
[dir="rtl"] .tree-children .tree-node {
  padding-right: 32px;
  padding-left: 0;
}
</style>

// Deletion is available via node.remove()
node.remove()
```

---

### 6. Module Format Changes

**Vue 2:**
```javascript
import LiquorTree from 'liquor-tree'
// UMD build: liquor-tree.umd.js
```

**Vue 3:**
```javascript
import { TreeRoot } from 'liquor-tree'
// ESM: liquor-tree.js
// UMD: liquor-tree.umd.cjs (note .cjs extension)
```

**Why:** Follows modern JavaScript module standards.

---

### 7. Component Registration

**Vue 2:**
```javascript
import Vue from 'vue'
import LiquorTree from 'liquor-tree'

Vue.use(LiquorTree)
```

**Vue 3:**
```javascript
// Option 1: Import and use directly (recommended)
import { TreeRoot } from 'liquor-tree'

<TreeRoot :data="data" :options="options" />

// Option 2: Global registration
import { createApp } from 'vue'
import { TreeRoot } from 'liquor-tree'

const app = createApp(App)
app.component('TreeRoot', TreeRoot)
// or register as 'tree' to match Vue 2
app.component('tree', TreeRoot)
```

---

### 8. TypeScript

**Vue 2:** JavaScript only, with optional type definitions

**Vue 3:** Full TypeScript rewrite with complete type definitions

**Benefits:**
- IntelliSense autocomplete for all options, methods, and properties
- Compile-time type checking
- Better developer experience in VS Code and other editors

```typescript
import type { TreeOptions, TreeNodeData, Node } from 'liquor-tree'

const options: TreeOptions = {
  multiple: true,
  checkbox: true
}

const data: TreeNodeData[] = [
  { text: 'Node 1' }
]
```

---

### 9. Event Handling

Events are now accessed through the tree instance, not component events.

**Vue 2:**
```vue
<tree
  :data="data"
  @node:selected="onNodeSelected"
/>
```

**Vue 3:**
```vue
<TreeRoot ref="treeRef" :data="data" />

<script setup>
import { ref, onMounted } from 'vue'

const treeRef = ref()

onMounted(() => {
  const tree = treeRef.value?.tree

  tree.$on('node:selected', (node) => {
    console.log('Selected:', node)
  })
})
</script>
```

**Why:** Provides more direct access to the tree instance and its event system.

---

## Code Examples

### Basic Tree Setup

**Vue 2:**
```vue
<template>
  <tree
    :data="treeData"
    :options="options"
    :filter="searchQuery"
    @node:selected="onSelect"
  />
</template>

<script>
import Vue from 'vue'
import LiquorTree from 'liquor-tree'

Vue.use(LiquorTree)

export default {
  data() {
    return {
      treeData: [...],
      searchQuery: '',
      options: {
        multiple: true,
        checkbox: true
      }
    }
  },
  methods: {
    onSelect(node) {
      console.log('Selected:', node.text)
    }
  }
}
</script>
```

**Vue 3:**
```vue
<template>
  <input v-model="searchQuery" @input="handleSearch" />
  <TreeRoot ref="treeRef" :data="treeData" :options="options" />
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { TreeRoot } from 'liquor-tree'
import type { TreeOptions, TreeNodeData } from 'liquor-tree'

const treeRef = ref()
const searchQuery = ref('')

const treeData = ref<TreeNodeData[]>([...])

const options: TreeOptions = {
  multiple: true,
  checkbox: true
}

const handleSearch = () => {
  treeRef.value?.tree.filter(searchQuery.value)
}

onMounted(() => {
  const tree = treeRef.value?.tree

  tree.$on('node:selected', (node) => {
    console.log('Selected:', node.text)
  })
})
</script>
```

---

### Custom Node Rendering

**Vue 2:**
```vue
<tree :data="data">
  <div slot-scope="{ node }">
    <span>{{ node.text }}</span>
    <button @click.stop="deleteNode(node)">Delete</button>
  </div>
</tree>
```

**Vue 3:**
```vue
<TreeRoot :data="data">
  <template #default="{ node }">
    <span>{{ node.text }}</span>
    <button @click.stop="deleteNode(node)">Delete</button>
  </template>
</TreeRoot>
```

---

### Programmatic Node Operations

**Vue 2:**
```javascript
// Via tree instance
this.$refs.tree.tree.findAll(node => node.checked())

// Via node
node.select()
node.check()
node.remove()
```

**Vue 3:**
```typescript
// Via tree instance
const tree = treeRef.value?.tree
const checkedNodes = tree.findAll(node => node.checked())

// Via node (same API)
node.select()
node.check()
node.remove()
```

**Note:** Node methods remain the same!

---

### Drag and Drop

**Vue 2:**
```javascript
const options = {
  dnd: true,
  // Hooks were limited
}
```

**Vue 3:**
```typescript
const options: TreeOptions = {
  dnd: {
    enabled: true,
    onDragStart: (node, event) => {
      console.log('Dragging:', node.text)
      return true // Return false to cancel
    },
    onDragEnd: (node, event) => {
      console.log('Drag ended')
    },
    onDrop: (targetNode, draggedNode, placement) => {
      console.log(`Dropped ${draggedNode.text} ${placement} ${targetNode.text}`)
      return true // Return false to cancel
    }
  }
}
```

**New:** More comprehensive drag-and-drop lifecycle hooks.

---

### Async Data Loading

**Vue 2:**
```javascript
const options = {
  fetchData: '/api/nodes',
  minFetchDelay: 500
}
```

**Vue 3:**
```typescript
const options: TreeOptions = {
  fetchData: async (node) => {
    const response = await fetch(`/api/nodes/${node.id}/children`)
    return response.json()
  },
  onFetchError: (error, node) => {
    console.error('Failed to load children for', node.text, error)
  }
}

// Mark nodes for lazy loading
const data: TreeNodeData[] = [
  {
    text: 'Lazy Parent',
    isBatch: true  // Children will load on expand
  }
]
```

**New:** Function-based fetchData with full control, error handling, and loading states.

---

## New Features

### 1. TypeScript Support

Full TypeScript rewrite with complete type definitions for all APIs.

```typescript
import type { TreeOptions, TreeNodeData, Node, Tree } from 'liquor-tree'
```

### 2. Composition API

Component uses Vue 3's Composition API internally, enabling:
- Better code organization
- Improved tree-shaking
- Enhanced performance

### 3. Enhanced Drag & Drop

More lifecycle hooks for drag-and-drop operations:
- `onDragStart` - Control if drag can begin
- `onDragEnd` - Cleanup after drag
- `onDrop` - Validate and control drop operation

### 4. Better Async Loading

- Function-based `fetchData` with full control
- `onFetchError` callback for error handling
- Loading states (`node.state('loading')`)
- Visual loading indicator

### 5. Improved Keyboard Navigation

- More reliable keyboard navigation
- Better focus management
- Proper activeElement tracking

### 6. Enhanced Filtering

- `clearFilter()` method
- `tree:filtered` event with matched nodes
- Better visibility control

### 7. New Node Methods

- `node.focus()` - Set keyboard focus
- `node.isDraggable()` - Check drag capability
- `node.isDropable()` - Check drop capability
- `node.first()` - Get first child

### 8. Navigation Methods

- `tree.nextVisibleNode(node)` - Get next visible node
- `tree.prevVisibleNode(node)` - Get previous visible node

---

## Deprecated Features

### Removed

These features have been **removed** and have no direct replacement:

- **`direction` option** - Use CSS instead
- **`autoDisableChildren` option** - Implement manually if needed
- **`checkDisabledChildren` option** - Implement manually if needed
- **`minFetchDelay` option** - No longer needed
- **`nodeIndent` option** - Use CSS
- **`deletion` option** - Always available via `node.remove()`
- **`tag` prop** - Wrap component if needed

### Changed API

These features work differently:

- **`filter` prop** → Use `tree.filter(query)` method
- **Component events** → Use `tree.$on('event', handler)`
- **Vue.use()** → Import and use component directly or register globally

---

## Step-by-Step Migration

### Step 1: Upgrade to Vue 3

Follow the [official Vue 3 migration guide](https://v3-migration.vuejs.org/) to upgrade your project.

### Step 2: Update Package

```bash
npm uninstall liquor-tree
npm install liquor-tree@latest
```

### Step 3: Update Component Registration

```javascript
// Before (Vue 2)
import Vue from 'vue'
import LiquorTree from 'liquor-tree'
Vue.use(LiquorTree)

// After (Vue 3)
import { TreeRoot } from 'liquor-tree'
// Use directly in components, or register globally:
app.component('tree', TreeRoot)
```

### Step 4: Update Component Usage

```vue
<!-- Before -->
<tree
  :data="data"
  :options="options"
  :filter="searchQuery"
  @node:selected="onSelect"
/>

<!-- After -->
<TreeRoot
  ref="treeRef"
  :data="data"
  :options="options"
/>
```

### Step 5: Move Event Handlers

```javascript
// Before (in template)
@node:selected="onSelect"

// After (in script setup)
onMounted(() => {
  treeRef.value?.tree.$on('node:selected', onSelect)
})
```

### Step 6: Update Filter Logic

```javascript
// Before (via prop)
:filter="searchQuery"

// After (via method)
watch(searchQuery, (query) => {
  treeRef.value?.tree.filter(query)
})
```

### Step 7: Review Options

Check if you're using any removed or changed options:

```javascript
const options = {
  // Remove these if present
  // direction: 'rtl',
  // nodeIndent: 24,
  // deletion: true,

  // Update these defaults if you want Vue 2 behavior
  multiple: true,       // Was true, now false
  parentSelect: false,  // Was false, now true
  autoCheckChildren: true  // Was true, now false
}
```

### Step 8: Update Styles

If you customized indentation:

```css
/* Before (via option) */
/* options: { nodeIndent: 32 } */

/* After (via CSS) */
.tree-children .tree-node {
  padding-left: 32px;
}
```

### Step 9: Add TypeScript (Optional)

```typescript
// Add type imports
import type { TreeOptions, TreeNodeData, Node } from 'liquor-tree'

// Type your data
const options: TreeOptions = { ... }
const data: TreeNodeData[] = [ ... ]
```

### Step 10: Test Thoroughly

- Test selection (single and multiple)
- Test checkboxes (with and without `autoCheckChildren`)
- Test filtering
- Test drag-and-drop
- Test async loading
- Test keyboard navigation
- Test custom rendering

---

## Common Issues

### Issue: Tree doesn't render

**Cause:** Component not registered or imported incorrectly

**Solution:**
```javascript
// Make sure you're importing correctly
import { TreeRoot } from 'liquor-tree'

// And using it in template
<TreeRoot :data="data" />
```

---

### Issue: Events don't fire

**Cause:** Using `@event` syntax instead of `tree.$on()`

**Solution:**
```javascript
// Don't use @node:selected in template
// Instead, register in script:
onMounted(() => {
  treeRef.value?.tree.$on('node:selected', handler)
})
```

---

### Issue: Filter doesn't work

**Cause:** Using removed `filter` prop

**Solution:**
```javascript
// Don't use :filter prop
// Instead, call method:
treeRef.value?.tree.filter(searchQuery.value)
```

---

### Issue: TypeScript errors

**Cause:** Missing type imports or incorrect types

**Solution:**
```typescript
import type { TreeOptions, TreeNodeData } from 'liquor-tree'

const options: TreeOptions = { ... }
const data: TreeNodeData[] = [ ... ]
```

---

## Need Help?

- [API Documentation](./API.md)
- [GitHub Issues](https://github.com/amsik/liquor-tree/issues)
- [Vue 3 Migration Guide](https://v3-migration.vuejs.org/)

---

## Summary

The Vue 3 version of Liquor Tree is a modern rewrite that:

✅ **Gains:**
- Full TypeScript support
- Better performance (Composition API)
- Enhanced drag-and-drop hooks
- Better async loading
- Improved developer experience

⚠️ **Changes:**
- Event handling moved to tree instance
- Filter is now a method, not a prop
- Some options removed (use CSS or implement manually)
- Different defaults for some options

📦 **Migration Effort:** Small to medium, depending on your usage:
- **Simple usage:** ~30 minutes
- **Advanced features:** ~2-4 hours
- **Full TypeScript conversion:** +2-4 hours

The core API (Node methods, Tree methods) remains largely the same, making migration straightforward.
