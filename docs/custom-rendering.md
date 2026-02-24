# Custom Rendering

Use the `#default` scoped slot to replace the default node label with any HTML. The slot receives the `node` object, giving you access to the node's text, metadata, and current state. The expand/collapse toggle, checkbox, and indentation are still rendered by the component — the slot replaces only the label area.

## Slot Signature

```vue
<LiquorTree :data="items">
  <template #default="{ node }">
    {{ node.text }}
  </template>
</LiquorTree>
```

## Node Object

The following properties are available on the `node` object inside the slot:

| Property | Type | Description |
|----------|------|-------------|
| `node.text` | `string` | Display text for the node |
| `node.data` | `Record<string, any>` | Arbitrary metadata supplied via the `data` field in `TreeNodeData` |
| `node.states` | `Partial<NodeState>` | All state flags (`selected`, `checked`, `expanded`, `disabled`, etc.) |
| `node.id` | `string \| number` | Node identifier (auto-generated if not provided) |
| `node.children` | `Node[]` | Array of child `Node` instances |
| `node.parent` | `Node \| null` | Parent node, or `null` for root nodes |

State flags can also be read via convenience methods on the node: `node.selected()`, `node.checked()`, `node.expanded()`, `node.disabled()`.

## Example 1: Icons and Badges

Display emoji icons and numeric count badges stored in `node.data`.

```vue
<script setup lang="ts">
import { LiquorTree } from 'liquor-tree'
import type { TreeNodeData } from 'liquor-tree'

const items: TreeNodeData[] = [
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
</script>

<template>
  <LiquorTree :data="items">
    <template #default="{ node }">
      <span class="icon-node">
        <span class="icon-node__icon">{{ node.data?.icon || '📄' }}</span>
        <span>{{ node.text }}</span>
        <span
          v-if="node.data?.count !== undefined"
          class="badge"
        >
          {{ node.data.count }}
        </span>
      </span>
    </template>
  </LiquorTree>
</template>

<style scoped>
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
</style>
```

## Example 2: Rich Content

Render structured user information — a status indicator, name, role, and email — from `node.data`.

```vue
<script setup lang="ts">
import { LiquorTree } from 'liquor-tree'
import type { TreeNodeData } from 'liquor-tree'

const items: TreeNodeData[] = [
  {
    text: 'Engineering Team',
    state: { expanded: true },
    children: [
      { text: 'Alice Johnson',  data: { status: 'online',  role: 'Frontend Dev', email: 'alice@example.com' } },
      { text: 'Bob Smith',      data: { status: 'away',    role: 'Backend Dev',  email: 'bob@example.com'   } },
      { text: 'Carol Williams', data: { status: 'online',  role: 'DevOps',       email: 'carol@example.com' } }
    ]
  },
  {
    text: 'Design Team',
    state: { expanded: true },
    children: [
      { text: 'David Chen',   data: { status: 'offline', role: 'UI Designer', email: 'david@example.com' } },
      { text: 'Eve Martinez', data: { status: 'online',  role: 'UX Designer', email: 'eve@example.com'   } }
    ]
  }
]
</script>

<template>
  <LiquorTree :data="items">
    <template #default="{ node }">
      <div class="rich-node">
        <span
          class="status-dot"
          :class="`status-dot--${node.data?.status || 'offline'}`"
        />
        <strong>{{ node.text }}</strong>
        <span
          v-if="node.data?.role"
          class="rich-node__role"
        >
          ({{ node.data.role }})
        </span>
        <span
          v-if="node.data?.email"
          class="rich-node__email"
        >
          {{ node.data.email }}
        </span>
      </div>
    </template>
  </LiquorTree>
</template>

<style scoped>
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
</style>
```

## Example 3: Conditional Styling

Apply different styles based on `node.data` properties such as priority level and completion status. This example also enables checkboxes via the `checkbox` option.

```vue
<script setup lang="ts">
import { LiquorTree } from 'liquor-tree'
import type { TreeNodeData } from 'liquor-tree'

const items: TreeNodeData[] = [
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

<template>
  <LiquorTree :data="items" :options="{ checkbox: true }">
    <template #default="{ node }">
      <span
        :class="[
          'priority-node',
          node.data?.priority && `priority-node--${node.data.priority}`,
          { 'priority-node--completed': node.data?.completed }
        ]"
      >
        {{ node.text }}
        <span
          v-if="node.data?.dueDate"
          class="priority-node__due"
        >
          📅 {{ node.data.dueDate }}
        </span>
      </span>
    </template>
  </LiquorTree>
</template>

<style scoped>
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
