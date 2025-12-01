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
        <!-- Basic Example Tab -->
        <div v-if="activeTab === 'basic'" class="demo-section">
          <h2>Basic Tree Example</h2>
          <p class="info-text">Simple tree with expand/collapse functionality.</p>
          <TreeRoot :data="basicData" />
        </div>

        <!-- Selection Tab -->
        <div v-if="activeTab === 'selection'" class="demo-section">
          <h2>Selection Examples</h2>

          <h3>Single Selection</h3>
          <p class="info-text">Click a node to select it. Selecting another node will deselect the previous one.</p>
          <TreeRoot :data="nestedData" :options="treeOptions" />

          <h3 style="margin-top: 2rem;">Multiple Selection</h3>
          <p class="info-text">Hold Cmd (Mac) or Ctrl (Windows/Linux) and click to select multiple nodes.</p>
          <TreeRoot :data="multiSelectData" :options="multiSelectOptions" />
        </div>

        <!-- Checkbox Tab -->
        <div v-if="activeTab === 'checkbox'" class="demo-section">
          <h2>Checkbox Example</h2>
          <p class="info-text">
            Click checkboxes to check/uncheck nodes. With autoCheckChildren enabled,
            checking a parent automatically checks all children. Parent checkboxes show
            an indeterminate state (−) when some but not all children are checked.
          </p>
          <TreeRoot :data="checkboxData" :options="checkboxOptions" />
        </div>

        <!-- Filter Tab -->
        <div v-if="activeTab === 'filter'" class="demo-section">
          <h2>Filter & Search</h2>
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
            <button v-if="filterQuery" @click="clearFilter" class="clear-button">Clear</button>
          </div>
          <TreeRoot ref="filterTreeRef" :data="filterData" :options="filterOptions" />
        </div>

        <!-- Sorting Tab -->
        <div v-if="activeTab === 'sorting'" class="demo-section">
          <h2>Sorting</h2>
          <p class="info-text">
            Click buttons to sort the tree alphabetically (A-Z or Z-A). The "Deep Sort" option
            also sorts all nested children, not just the top level.
          </p>
          <div class="sort-controls">
            <button @click="sortAscending(false)" class="sort-button">Sort A-Z</button>
            <button @click="sortDescending(false)" class="sort-button">Sort Z-A</button>
            <button @click="sortAscending(true)" class="sort-button">Deep Sort A-Z</button>
            <button @click="sortDescending(true)" class="sort-button">Deep Sort Z-A</button>
            <button @click="resetSort" class="sort-button reset-button">Reset</button>
          </div>
          <TreeRoot ref="sortTreeRef" :data="sortData" />
        </div>

        <!-- Keyboard Navigation Tab -->
        <div v-if="activeTab === 'keyboard'" class="demo-section">
          <h2>Keyboard Navigation</h2>
          <p class="info-text">
            Click a node to focus it, then use keyboard shortcuts:
          </p>
          <ul class="keyboard-list">
            <li><kbd>↑</kbd> / <kbd>↓</kbd> - Navigate up/down through visible nodes</li>
            <li><kbd>←</kbd> - Collapse node or move to parent</li>
            <li><kbd>→</kbd> - Expand node or move to first child</li>
            <li><kbd>Enter</kbd> / <kbd>Space</kbd> - Toggle checkbox (if enabled)</li>
          </ul>
          <TreeRoot :data="nestedData" :options="treeOptions" />
        </div>

        <!-- Drag & Drop Tab -->
        <div v-if="activeTab === 'dragdrop'" class="demo-section">
          <h2>Drag & Drop</h2>
          <p class="info-text">
            Click and drag nodes to reorder them. Drag to the top/bottom third of a node to insert before/after,
            or to the middle third to make it a child.
          </p>
          <div class="dnd-status">
            <strong>Last Action:</strong> {{ dndStatus || 'No actions yet' }}
          </div>
          <TreeRoot :data="dndData" :options="dndOptions" />
        </div>

        <!-- Async Data Tab -->
        <div v-if="activeTab === 'async'" class="demo-section">
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

        <!-- Custom Rendering Tab -->
        <div v-if="activeTab === 'custom'" class="demo-section">
          <h2>Custom Rendering with Scoped Slots</h2>
          <p class="info-text">
            Use scoped slots to completely customize how nodes are rendered. Access the full node object
            with all its data, methods, and state.
          </p>

          <h3>Example 1: Icons and Badges</h3>
          <p class="info-text">Custom rendering with emoji icons and count badges.</p>
          <TreeRoot :data="customData1">
            <template #default="{ node }">
              <span style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.2em;">{{ node.data?.icon || '📄' }}</span>
                <span>{{ node.text }}</span>
                <span
                  v-if="node.data?.count !== undefined"
                  style="background: #2196f3; color: white; padding: 0.1rem 0.4rem; border-radius: 10px; font-size: 0.75em;"
                >
                  {{ node.data.count }}
                </span>
              </span>
            </template>
          </TreeRoot>

          <h3 style="margin-top: 2rem;">Example 2: Rich Content</h3>
          <p class="info-text">Complex HTML with multiple interactive elements.</p>
          <TreeRoot :data="customData2">
            <template #default="{ node }">
              <div style="display: flex; align-items: center; gap: 0.75rem; width: 100%;">
                <span
                  :style="{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: node.data?.status === 'online' ? '#4caf50' :
                               node.data?.status === 'away' ? '#ff9800' : '#9e9e9e'
                  }"
                ></span>
                <strong>{{ node.text }}</strong>
                <span v-if="node.data?.role" style="color: #666; font-size: 0.85em;">
                  ({{ node.data.role }})
                </span>
                <span v-if="node.data?.email" style="color: #999; font-size: 0.8em; margin-left: auto;">
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
                :style="{
                  fontWeight: node.data?.priority === 'high' ? 'bold' : 'normal',
                  color: node.data?.completed ? '#999' :
                         node.data?.priority === 'high' ? '#f44336' :
                         node.data?.priority === 'medium' ? '#ff9800' : '#333',
                  textDecoration: node.data?.completed ? 'line-through' : 'none'
                }"
              >
                {{ node.text }}
                <span v-if="node.data?.dueDate" style="font-size: 0.85em; margin-left: 0.5rem;">
                  📅 {{ node.data.dueDate }}
                </span>
              </span>
            </template>
          </TreeRoot>
        </div>

        <!-- Events Tab -->
        <div v-if="activeTab === 'events'" class="demo-section">
          <h2>Events System</h2>
          <p class="info-text">
            All tree interactions emit events. Monitor the event log below to see events as they happen.
            Try selecting nodes, checking boxes, expanding/collapsing, and dragging.
          </p>

          <div class="events-container">
            <div class="events-log">
              <h3>Event Log</h3>
              <button @click="clearEventLog" class="clear-button" style="margin-bottom: 0.5rem;">Clear Log</button>
              <div class="log-entries">
                <div v-for="(event, index) in eventLog" :key="index" class="log-entry" :class="`log-${event.type}`">
                  <span class="log-time">{{ event.time }}</span>
                  <span class="log-name">{{ event.name }}</span>
                  <span class="log-details">{{ event.details }}</span>
                </div>
                <div v-if="eventLog.length === 0" class="log-empty">
                  No events yet. Interact with the tree to see events.
                </div>
              </div>
            </div>

            <div class="events-tree">
              <h3>Interactive Tree</h3>
              <p style="font-size: 0.9em; color: #666; margin-bottom: 1rem;">
                Click, check, expand, and drag nodes to trigger events.
              </p>
              <TreeRoot ref="eventsTreeRef" :data="eventsData" :options="eventsOptions" />
            </div>
          </div>

          <div class="events-docs">
            <h3>Available Events</h3>
            <ul class="events-list">
              <li><strong>node:selected</strong> - Node is selected</li>
              <li><strong>node:unselected</strong> - Node is unselected</li>
              <li><strong>node:checked</strong> - Node checkbox is checked</li>
              <li><strong>node:unchecked</strong> - Node checkbox is unchecked</li>
              <li><strong>node:expanded</strong> - Node is expanded</li>
              <li><strong>node:collapsed</strong> - Node is collapsed</li>
              <li><strong>node:focused</strong> - Node receives focus</li>
              <li><strong>node:text:changed</strong> - Node text changes</li>
              <li><strong>node:data:changed</strong> - Node data changes</li>
              <li><strong>node:removed</strong> - Node is removed</li>
              <li><strong>node:dragstart</strong> - Dragging starts</li>
              <li><strong>node:dropped</strong> - Node is dropped</li>
              <li><strong>tree:filtered</strong> - Tree is filtered</li>
            </ul>
            <p style="margin-top: 1rem;">
              See <a href="https://github.com/your-repo/liquor-tree-vue3/blob/main/EVENTS.md" target="_blank" style="color: #2196f3;">EVENTS.md</a> for full documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TreeRoot from '../../src/components/TreeRoot.vue'
import type { TreeNodeData, TreeOptions } from '../../src/types'

// Tab state
const activeTab = ref('basic')
const tabs = [
  { id: 'basic', label: 'Basic' },
  { id: 'selection', label: 'Selection' },
  { id: 'checkbox', label: 'Checkboxes' },
  { id: 'filter', label: 'Filter' },
  { id: 'sorting', label: 'Sorting' },
  { id: 'keyboard', label: 'Keyboard' },
  { id: 'dragdrop', label: 'Drag & Drop' },
  { id: 'async', label: 'Async Data' },
  { id: 'custom', label: 'Custom Rendering' },
  { id: 'events', label: 'Events' }
]

// Filter state
const filterQuery = ref('')
const filterTreeRef = ref<InstanceType<typeof TreeRoot> | null>(null)

// Sort state
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

// Basic tree data
const basicData: TreeNodeData[] = [
  { text: 'Node 1' },
  { text: 'Node 2' },
  { text: 'Node 3' }
]

// Nested tree data
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
  {
    text: 'Root 3'
  }
]

// Tree options - single selection
const treeOptions: TreeOptions = {
  multiple: false,
  checkbox: false
}

// Multi-select tree data
const multiSelectData: TreeNodeData[] = [
  { text: 'Item 1' },
  { text: 'Item 2' },
  { text: 'Item 3' },
  { text: 'Item 4' },
  { text: 'Item 5' }
]

// Multi-select tree options
const multiSelectOptions: TreeOptions = {
  multiple: true,
  checkbox: false
}

// Checkbox tree data
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

// Checkbox tree options
const checkboxOptions: TreeOptions = {
  checkbox: true,
  autoCheckChildren: true
}

// Filter tree data
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

// Filter tree options
const filterOptions: TreeOptions = {
  filter: {
    emptyText: 'No matches found',
    showChildren: true
  }
}

// Filter handler
const handleFilter = () => {
  if (filterTreeRef.value?.tree) {
    filterTreeRef.value.tree.filter(filterQuery.value)
  }
}

// Clear filter
const clearFilter = () => {
  filterQuery.value = ''
  if (filterTreeRef.value?.tree) {
    filterTreeRef.value.tree.clearFilter()
  }
}

// Sort functions
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

// Drag & Drop state
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

// Drag & Drop options
const dndOptions: TreeOptions = {
  dnd: {
    enabled: true,
    onDrop: (targetNode, draggedNode, placement) => {
      dndStatus.value = `Moved "${draggedNode.text}" ${placement} "${targetNode.text}"`
      // Return true to allow the drop
      return true
    }
  }
}

// Async Data
const asyncData: TreeNodeData[] = [
  {
    text: 'Products',
    id: 'products',
    isBatch: true
  },
  {
    text: 'Services',
    id: 'services',
    isBatch: true
  },
  {
    text: 'Support',
    id: 'support',
    isBatch: true
  }
]

// Mock data for async loading
const mockAsyncData: Record<string, TreeNodeData[]> = {
  products: [
    {
      text: 'Electronics',
      id: 'electronics',
      isBatch: true
    },
    {
      text: 'Clothing',
      id: 'clothing',
      isBatch: true
    },
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

// Async options with fetchData function
const asyncOptions: TreeOptions = {
  fetchData: async (node) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Get mock data for this node
    const children = mockAsyncData[node.id as string] || []

    // Return the children data
    return children
  },
  onFetchError: (error, node) => {
    console.error(`Error loading children for ${node.text}:`, error)
  }
}

// Custom Rendering Data
const customData1: TreeNodeData[] = [
  {
    text: 'Inbox',
    data: { icon: '📥', count: 12 },
    state: { expanded: true },
    children: [
      { text: 'Work', data: { icon: '💼', count: 5 } },
      { text: 'Personal', data: { icon: '👤', count: 7 } }
    ]
  },
  {
    text: 'Sent',
    data: { icon: '📤', count: 42 },
    state: { expanded: true },
    children: [
      { text: 'Recent', data: { icon: '🕐', count: 8 } },
      { text: 'Archive', data: { icon: '📦', count: 34 } }
    ]
  },
  {
    text: 'Drafts',
    data: { icon: '✏️', count: 3 }
  }
]

const customData2: TreeNodeData[] = [
  {
    text: 'Engineering Team',
    state: { expanded: true },
    children: [
      {
        text: 'Alice Johnson',
        data: { status: 'online', role: 'Frontend Dev', email: 'alice@example.com' }
      },
      {
        text: 'Bob Smith',
        data: { status: 'away', role: 'Backend Dev', email: 'bob@example.com' }
      },
      {
        text: 'Carol Williams',
        data: { status: 'online', role: 'DevOps', email: 'carol@example.com' }
      }
    ]
  },
  {
    text: 'Design Team',
    state: { expanded: true },
    children: [
      {
        text: 'David Chen',
        data: { status: 'offline', role: 'UI Designer', email: 'david@example.com' }
      },
      {
        text: 'Eve Martinez',
        data: { status: 'online', role: 'UX Designer', email: 'eve@example.com' }
      }
    ]
  }
]

const customData3: TreeNodeData[] = [
  {
    text: 'Sprint Tasks',
    state: { expanded: true },
    children: [
      {
        text: 'Implement user authentication',
        data: { priority: 'high', dueDate: 'Dec 1', completed: false }
      },
      {
        text: 'Fix responsive layout',
        data: { priority: 'medium', dueDate: 'Dec 3', completed: false }
      },
      {
        text: 'Update documentation',
        data: { priority: 'low', dueDate: 'Dec 5', completed: true }
      }
    ]
  },
  {
    text: 'Backlog',
    state: { expanded: true },
    children: [
      {
        text: 'Add dark mode support',
        data: { priority: 'medium', completed: false }
      },
      {
        text: 'Performance optimization',
        data: { priority: 'high', completed: false }
      }
    ]
  }
]

// Events Demo
const eventsTreeRef = ref<InstanceType<typeof TreeRoot> | null>(null)
const eventLog = ref<Array<{ time: string, name: string, details: string, type: string }>>([])

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
  {
    text: 'Downloads'
  }
]

const eventsOptions: TreeOptions = {
  checkbox: true,
  dnd: { enabled: true }
}

const logEvent = (name: string, details: string, type: string = 'info') => {
  const time = new Date().toLocaleTimeString()
  eventLog.value.unshift({ time, name, details, type })

  // Keep only last 50 events
  if (eventLog.value.length > 50) {
    eventLog.value = eventLog.value.slice(0, 50)
  }
}

const clearEventLog = () => {
  eventLog.value = []
}

// Set up event listeners for events demo
onMounted(() => {
  if (eventsTreeRef.value?.tree) {
    const tree = eventsTreeRef.value.tree

    // Selection events
    tree.$on('node:selected', (node) => {
      logEvent('node:selected', `Selected "${node.text}"`, 'selection')
    })

    tree.$on('node:unselected', (node) => {
      logEvent('node:unselected', `Unselected "${node.text}"`, 'selection')
    })

    // Checkbox events
    tree.$on('node:checked', (node) => {
      logEvent('node:checked', `Checked "${node.text}"`, 'checkbox')
    })

    tree.$on('node:unchecked', (node) => {
      logEvent('node:unchecked', `Unchecked "${node.text}"`, 'checkbox')
    })

    // State events
    tree.$on('node:expanded', (node) => {
      logEvent('node:expanded', `Expanded "${node.text}"`, 'state')
    })

    tree.$on('node:collapsed', (node) => {
      logEvent('node:collapsed', `Collapsed "${node.text}"`, 'state')
    })

    tree.$on('node:focused', (node) => {
      logEvent('node:focused', `Focused "${node.text}"`, 'state')
    })

    // Data events
    tree.$on('node:text:changed', (node, newText, oldText) => {
      logEvent('node:text:changed', `"${oldText}" → "${newText}"`, 'data')
    })

    tree.$on('node:data:changed', (node, data) => {
      logEvent('node:data:changed', `Data updated for "${node.text}"`, 'data')
    })

    // Structure events
    tree.$on('node:removed', (node) => {
      logEvent('node:removed', `Removed "${node.text}"`, 'structure')
    })

    // Drag & Drop events
    tree.$on('node:dragstart', (node) => {
      logEvent('node:dragstart', `Started dragging "${node.text}"`, 'dnd')
    })

    tree.$on('node:dropped', (dragNode, targetNode, placement) => {
      logEvent('node:dropped', `"${dragNode.text}" dropped ${placement} "${targetNode.text}"`, 'dnd')
    })

    // Filter events
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

h2 {
  margin-top: 0;
  color: #2c3e50;
  border-bottom: 2px solid #42b983;
  padding-bottom: 0.5rem;
}

h3 {
  color: #2c3e50;
  margin-top: 1.5rem;
  margin-bottom: 1rem;
}

.info-text {
  margin: 0 0 1rem 0;
  padding: 0.75rem;
  background-color: #e3f2fd;
  border-left: 3px solid #2196f3;
  border-radius: 3px;
  font-size: 0.9rem;
  color: #1565c0;
}

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

.dnd-status {
  padding: 0.75rem;
  margin-bottom: 1rem;
  background-color: #f5f5f5;
  border-left: 3px solid #2196f3;
  border-radius: 3px;
  font-size: 0.9rem;
  color: #333;
}

/* Events Demo Styles */
.events-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.events-log,
.events-tree {
  background: #f9f9f9;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #e0e0e0;
}

.events-log h3,
.events-tree h3 {
  margin-top: 0;
  margin-bottom: 1rem;
  color: #2c3e50;
  font-size: 1.1rem;
  border-bottom: 2px solid #2196f3;
  padding-bottom: 0.5rem;
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

.log-entry.log-selection {
  border-left-color: #2196f3;
  background: #e3f2fd;
}

.log-entry.log-checkbox {
  border-left-color: #4caf50;
  background: #e8f5e9;
}

.log-entry.log-state {
  border-left-color: #ff9800;
  background: #fff3e0;
}

.log-entry.log-data {
  border-left-color: #9c27b0;
  background: #f3e5f5;
}

.log-entry.log-structure {
  border-left-color: #f44336;
  background: #ffebee;
}

.log-entry.log-dnd {
  border-left-color: #00bcd4;
  background: #e0f7fa;
}

.log-entry.log-filter {
  border-left-color: #ffc107;
  background: #fff8e1;
}

.log-time {
  color: #666;
  margin-right: 0.5rem;
  font-size: 0.8em;
}

.log-name {
  font-weight: bold;
  color: #2c3e50;
  margin-right: 0.5rem;
}

.log-details {
  color: #555;
}

.log-empty {
  padding: 2rem;
  text-align: center;
  color: #999;
  font-style: italic;
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
