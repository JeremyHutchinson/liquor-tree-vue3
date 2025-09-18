<template>
  <component
    :is="tag"
    role="tree"
    :class="{'tree': true, 'tree-loading': loading, 'tree--draggable': !!draggableNode}"
  >
    <template v-if="filter && matches.length === 0">
      <div
        class="tree-filter-empty"
        v-html="treeOptions.filter.emptyText"
      />
    </template>
    <template v-else>
      <ul
        class="tree-root"
        @dragstart="onDragStart"
      >
        <template v-if="treeOptions.filter.plainList && matches.length > 0">
          <TreeNode
            v-for="node in visibleMatches"
            :key="node.id"
            :node="node"
            :options="treeOptions"
            @node:clicked="(node) => emit('node:clicked', node)"
            @node:dblclick="(node) => emit('node:dblclick', node)"
          />
        </template>
        <template v-else>
          <TreeNode
            v-for="node in visibleModel"
            :key="node.id"
            :node="node"
            :options="treeOptions"
            @node:clicked="(node) => emit('node:clicked', node)"
            @node:dblclick="(node) => emit('node:dblclick', node)"
          />
        </template>
      </ul>
    </template>

    <DraggableNode
      v-if="draggableNode"
      :target="draggableNode"
    />
  </component>
</template>

<script setup lang="ts">
import { computed, provide, watch } from 'vue'
import type { TreeOptions } from '../types'
import TreeNode from './TreeNode.vue'
import DraggableNode from './DraggableNode.vue'
import { useTree } from '../composables/useTree'
import { useDnd } from '../composables/useDnd'

// Props definition
interface Props {
  data?: any
  options?: Partial<TreeOptions>
  filter?: string
  tag?: string
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  options: () => ({}),
  filter: '',
  tag: 'div'
})

// Emits definition
const emit = defineEmits<{
  'node:clicked': [node: any]
  'node:dblclick': [node: any]
  'node:selected': [node: any]
  'node:unselected': [node: any]
  'node:checked': [node: any]
  'node:unchecked': [node: any]
  'node:expanded': [node: any]
  'node:collapsed': [node: any]
  'tree:filtered': [query: string, matches: any[]]
  'tree:data:loaded': [data: any[]]
  'node:editing:start': [node: any]
  'node:editing:stop': [node: any, oldText: string]
  'tree:drop': [node: any, target: any, placement: string]
}>()

// Use composables
const {
  tree,
  treeOptions,
  model,
  matches,
  loading,
  selectedNodes,
  checkedNodes,
  visibleModel,
  visibleMatches
} = useTree(props, emit)

const {
  draggableNode,
  onDragStart
} = useDnd(tree, treeOptions, emit)

// Provide tree instance to child components
provide('tree', tree)

// Watch filter prop
watch(() => props.filter, (newFilter) => {
  if (tree.value) {
    tree.value.filter(newFilter)
  }
})

// Define component name
defineOptions({
  name: 'LiquorTree'
})
</script>

<style>
  .tree {
    overflow: auto;
  }

  .tree-root,
  .tree-children {
    list-style: none;
    padding: 0;
  }

  .tree > .tree-root,
  .tree > .tree-filter-empty {
    padding: 3px;
    box-sizing: border-box;
  }

  .tree.tree--draggable .tree-node:not(.selected) > .tree-content:hover {
    background: transparent;
  }

  .drag-above,
  .drag-below,
  .drag-on {
    position: relative;
    z-index: 1;
  }

  .drag-on > .tree-content {
    background: #fafcff;
    outline: 1px solid #7baff2;
  }

  .drag-above > .tree-content::before, .drag-below > .tree-content::after {
    display: block;
    content: '';
    position: absolute;
    height: 8px;
    left: 0;
    right: 0;
    z-index: 2;
    box-sizing: border-box;
    background-color: #3367d6;
    border: 3px solid #3367d6;
    background-clip: padding-box;
    border-bottom-color: transparent;
    border-top-color: transparent;
    border-radius: 0;
  }

  .drag-above > .tree-content::before {
    top: 0;
    transform: translateY(-50%);
  }

  .drag-below > .tree-content::after {
    bottom: 0;
    transform: translateY(50%);
  }
</style>