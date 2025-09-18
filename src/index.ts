// Main entry point for liquor-tree library
// Phase 3: Vue 3 Composition API components with TypeScript + mitt event system

export * from './types';
export * from './core';
export * from './composables';

// Export Vue components (avoiding conflict with TreeNode type)
export { default as LiquorTree } from './components/TreeRoot.vue';
export { default as TreeRoot } from './components/TreeRoot.vue';
export { default as TreeNode } from './components/TreeNode.vue';
export { default as NodeContent } from './components/NodeContent.vue';
export { default as DraggableNode } from './components/DraggableNode.vue';

// Library version
export const version = '1.0.0';
