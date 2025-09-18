/**
 * Core module exports
 * TypeScript implementations of Tree, Node, Selection, and EventBus
 */

export { Tree } from './Tree';
export { Node } from './Node';
export { Selection } from './Selection';
export { createEventBus, EventBusAdapter } from './eventBus';

// Re-export types for convenience
export type {
  TreeOptions,
  TreeNodeData,
  NodeState,
  Key,
  EventName,
  TreeCore,
  TreeNode,
  EventBus,
  FilterOptions,
  PropertyNames,
  SelectionMode,
  Predicate,
  SortFn,
  FetchDataFunction
} from '../types';