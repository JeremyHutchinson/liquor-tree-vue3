<template>
  <li
    v-if="isVisible"
    class="tree-node"
    :data-id="node?.id"
    role="treeitem"
    :aria-level="ariaLevel"
    :aria-expanded="ariaExpanded"
    :aria-selected="node?.selected()"
    :aria-disabled="node?.disabled() || undefined"
    :aria-checked="ariaChecked"
  >
    <div
      class="tree-content"
      :class="{
        'tree-content-selected': node?.selected(),
        'tree-content-focused': isActiveElement
      }"
      @click="handleClick"
      @mousedown="handleMouseDown"
    >
      <!-- Checkbox (if enabled) -->
      <span
        v-if="showCheckbox"
        class="tree-checkbox"
        :class="{
          'tree-checkbox-checked': node?.checked(),
          'tree-checkbox-indeterminate': node?.indeterminate()
        }"
        @click.stop="toggleCheckbox"
      >
        <span class="checkbox-icon">
          <span v-if="node?.indeterminate()" class="checkbox-indeterminate-icon">−</span>
          <span v-else-if="node?.checked()" class="checkbox-check-icon">✓</span>
        </span>
      </span>

      <!-- Expand/collapse toggle or loading spinner -->
      <span
        v-if="node?.state('loading')"
        class="tree-loading"
        title="Loading..."
      >
        ⏳
      </span>
      <span
        v-else-if="node?.hasChildren() || node?.isBatch"
        class="tree-arrow"
        :class="{ 'tree-arrow-expanded': node?.expanded() }"
        @click.stop="toggleExpand"
      >
        ▶
      </span>
      <span v-else class="tree-arrow-placeholder"></span>

      <!-- Custom content via slot or default text rendering -->
      <span class="tree-text">
        <slot :node="node">
          {{ node?.text || 'N/A' }}
        </slot>
      </span>
    </div>

    <!-- Recursively render children (only when expanded) -->
    <ul v-if="node?.hasChildren?.() && node?.expanded()" class="tree-children" role="group">
      <TreeNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
      >
        <!-- Forward the slot to children recursively -->
        <template v-if="$slots.default" #default="slotProps">
          <slot v-bind="slotProps" />
        </template>
      </TreeNode>
    </ul>
  </li>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'
import type { Node } from '@/core/Node'

interface Props {
  node: Node
}

const props = defineProps<Props>()

defineSlots<{
  default?: (props: { node: Node }) => unknown
}>()

// Inject the reactive activeElement from TreeRoot
const activeElement = inject<Ref<Node | null>>('activeElement')

// Inject dragDrop from TreeRoot
const dragDrop = inject<ReturnType<typeof import('@/composables').useDragDrop>>('dragDrop')

const isActiveElement = computed(() => {
  return activeElement?.value === props.node
})

const ariaLevel = computed(() => (props.node?.depth ?? 0) + 1)

const ariaExpanded = computed(() => {
  if (!props.node?.hasChildren() && !props.node?.isBatch) return undefined
  return props.node?.expanded()
})

const ariaChecked = computed(() => {
  if (!props.node?.tree?.options.checkbox) return undefined
  if (props.node?.indeterminate()) return 'mixed'
  return props.node?.checked()
})

const isVisible = computed(() => {
  // Check if node has a visible state set to false
  const visibleState = props.node?.state('visible')
  // If visible state is explicitly set to false, hide the node
  if (visibleState === false) {
    return false
  }
  // Otherwise, show the node (default is visible)
  return true
})

const showCheckbox = computed(() => {
  return props.node?.tree?.options.checkbox === true
})

const toggleExpand = () => {
  props.node?.toggleExpand()
}

const toggleCheckbox = () => {
  if (props.node?.checked()) {
    props.node?.uncheck()
  } else {
    props.node?.check()
  }
}

const handleClick = (event: MouseEvent) => {
  if (!props.node) return

  if (event.shiftKey && props.node.tree?.options.multiple) {
    // Shift+click: range selection
    props.node.tree.selectRange(props.node)
  } else {
    // Normal click or Cmd/Ctrl+click for multi-select
    const extendSelection = event.metaKey || event.ctrlKey
    props.node.select(extendSelection)
  }
  // Set as active element for keyboard navigation
  props.node.focus()
}

const handleMouseDown = (event: MouseEvent) => {
  // Start dragging if drag & drop is enabled
  if (dragDrop && props.node) {
    dragDrop.startDragging(props.node, event)
  }
}
</script>

<style scoped>
.tree-node {
  list-style: none;
  margin: 0;
  padding: 0;
}

.tree-content {
  padding: 4px 8px;
  cursor: pointer;
  user-select: none;
  display: flex;
  align-items: center;
  border-radius: 3px;
  transition: background-color 0.2s ease;
}

.tree-content:hover {
  background-color: #f5f5f5;
}

.tree-content-selected {
  background-color: #e3f2fd;
  border-left: 3px solid #2196f3;
  padding-left: 5px;
}

.tree-content-selected:hover {
  background-color: #bbdefb;
}

.tree-content-focused {
  outline: 2px solid #2196f3;
  outline-offset: -2px;
}

.tree-arrow {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 4px;
  cursor: pointer;
  transition: transform 0.2s ease;
  font-size: 10px;
  line-height: 16px;
  text-align: center;
  color: #666;
}

.tree-arrow:hover {
  color: #333;
}

.tree-arrow-expanded {
  transform: rotate(90deg);
}

.tree-arrow-placeholder {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 4px;
}

.tree-loading {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 4px;
  font-size: 16px;
  line-height: 16px;
  text-align: center;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.tree-text {
  font-size: 14px;
  color: #333;  /* Ensure dark text color regardless of color scheme */
}

.tree-checkbox {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 4px;
  cursor: pointer;
  border: 2px solid #666;
  border-radius: 3px;
  background-color: #fff;
  transition: all 0.2s ease;
  position: relative;
}

.tree-checkbox:hover {
  border-color: #2196f3;
}

.tree-checkbox-checked {
  background-color: #2196f3;
  border-color: #2196f3;
}

.tree-checkbox-indeterminate {
  background-color: #2196f3;
  border-color: #2196f3;
}

.checkbox-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
}

.checkbox-check-icon {
  display: block;
}

.checkbox-indeterminate-icon {
  display: block;
  font-size: 16px;
  line-height: 12px;
}

.tree-children {
  list-style: none;
  margin: 0;
  padding-left: 20px;
}

/* Drag & Drop styles */
.tree-node.drag-above > .tree-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #2196f3;
}

.tree-node.drag-below > .tree-content::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #2196f3;
}

.tree-node.drag-on > .tree-content {
  background-color: #e3f2fd;
  border: 2px dashed #2196f3;
  border-radius: 3px;
}

.tree-content {
  position: relative;
}
</style>
