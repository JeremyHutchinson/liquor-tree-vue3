// Type definitions for liquor-tree
// Core types for the Vue 3 migration

export type Key = string | number;

// Node data interface
export interface TreeNodeData {
  id?: Key;
  text?: string;
  children?: TreeNodeData[];
  state?: NodeState;
  data?: Record<string, any>;
  parent?: TreeNode | null;
  isBatch?: boolean;
  [key: string]: any;
}

// Node state interface
export interface NodeState {
  selected?: boolean;
  checked?: boolean;
  expanded?: boolean;
  disabled?: boolean;
  visible?: boolean;
  matched?: boolean;
  indeterminate?: boolean;
  selectable?: boolean;
  editable?: boolean;
  draggable?: boolean;
  droppable?: boolean;
  [key: string]: any;
}

// Tree options interface
export interface TreeOptions {
  data?: TreeNodeData[];
  direction?: 'ltr' | 'rtl';
  multiple?: boolean;
  checkbox?: boolean;
  checkOnSelect?: boolean;
  autoCheckChildren?: boolean;
  autoDisableChildren?: boolean;
  checkDisabledChildren?: boolean;
  parentSelect?: boolean;
  keyboardNavigation?: boolean;
  nodeIndent?: number;
  minFetchDelay?: number;
  fetchData?: FetchDataFunction | string | null;
  propertyNames?: PropertyNames | null;
  deletion?: boolean;
  dnd?: boolean;
  editing?: boolean;
  onFetchError?: (error: any) => void;
  filter?: FilterOptions;
  modelParse?: (data: any) => TreeNodeData[];
  store?: boolean;
}

// Filter options
export interface FilterOptions {
  emptyText?: string;
  matcher?: (query: string, node: TreeNode) => boolean;
  plainList?: boolean;
  showChildren?: boolean;
}

// Property names mapping
export interface PropertyNames {
  text?: string;
  value?: string;
  children?: string;
  state?: string;
  data?: string;
  [key: string]: string | undefined;
}

// Function types
export type FetchDataFunction = (node: TreeNodeData) => Promise<TreeNodeData[]> | TreeNodeData[];
export type Predicate<T> = (item: T) => boolean;
export type SortFn<T> = (a: T, b: T) => number;
export type SelectionMode = 'single' | 'multiple';

// Event types
export type EventName = 
  | 'node:click'
  | 'node:toggle'
  | 'node:expand'
  | 'node:collapse'
  | 'node:selected'
  | 'node:unselected'
  | 'node:checked'
  | 'node:unchecked'
  | 'node:added'
  | 'node:removed'
  | 'node:moved'
  | 'node:data:changed'
  | 'node:text:changed'
  | 'selection:change'
  | 'update:modelValue'
  | 'update:expandedKeys'
  | 'tree:filtered'
  | 'tree:data:fetch'
  | 'tree:data:received'
  | 'drag:start'
  | 'drag:over'
  | 'drag:leave'
  | 'drop';

// Event payload interfaces
export interface NodeEventPayload {
  node: TreeNode;
  [key: string]: any;
}

export interface SelectionChangePayload {
  selected: TreeNode[];
  node: TreeNode;
}

export interface FilterPayload {
  matches: TreeNode[];
  query: string;
}

export interface DragPayload {
  sourceNode: TreeNode;
  targetNode?: TreeNode;
  position?: 'before' | 'after' | 'inside';
}

// Forward declare TreeNode for circular references
export interface TreeNode {
  id: Key;
  text: string;
  data: Record<string, any>;
  states: NodeState;
  children: TreeNode[];
  parent: TreeNode | null;
  tree: TreeCore | null;
  depth: number;
  showChildren: boolean;
  isBatch: boolean;
  isEditing: boolean;
}

// Forward declare TreeCore for circular references
export interface TreeCore {
  model: TreeNode[];
  selectedNodes: TreeNode[];
  checkedNodes: TreeNode[];
  options: TreeOptions;
}

// Event bus types
export interface EventBus {
  on(event: EventName, handler: (payload?: any) => void): void;
  off(event: EventName, handler?: (payload?: any) => void): void;
  emit(event: EventName, payload?: any): void;
}
