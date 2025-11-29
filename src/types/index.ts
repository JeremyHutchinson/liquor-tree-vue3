// TypeScript type definitions for liquor-tree
// This file will contain all public types and interfaces

// Placeholder - will be implemented in Phase 1
export interface TreeNode {
  id?: string | number
  text: string
  children?: TreeNode[]
  state?: Partial<NodeState>
  data?: Record<string, any>
}

export interface NodeState {
  selected: boolean
  selectable: boolean
  checked: boolean
  expanded: boolean
  disabled: boolean
  visible: boolean
  indeterminate: boolean
  matched: boolean
  editable: boolean
  dragging: boolean
  draggable: boolean
  dropable: boolean
}

export interface TreeOptions {
  // Placeholder - will be expanded in Phase 1
  multiple?: boolean
  checkbox?: boolean
  checkOnSelect?: boolean
  autoCheckChildren?: boolean
  parentSelect?: boolean
  keyboardNavigation?: boolean
  editing?: boolean
  dnd?: boolean
  filter?: FilterOptions
  sort?: SortOptions
}

export interface FilterOptions {
  emptyText?: string
  matcher?: (query: string, node: any) => boolean
  plainList?: boolean
  showChildren?: boolean
}

export interface SortOptions {
  comparator?: (a: any, b: any) => number
  deep?: boolean
}
