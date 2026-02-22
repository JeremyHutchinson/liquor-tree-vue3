// TypeScript type definitions for liquor-tree

import type { Node } from '../core/Node'

/**
 * Input data format for tree nodes
 * This is what users provide when creating a tree
 */
export interface TreeNodeData {
  id?: string | number
  text: string
  children?: TreeNodeData[]
  state?: Partial<NodeState>
  data?: Record<string, any>
  isBatch?: boolean
  [key: string]: any // Allow additional properties
}

/**
 * Node state flags
 * These control the visual and behavioral state of each node
 */
export interface NodeState {
  selected: boolean
  selectable: boolean
  checked: boolean
  expanded: boolean
  collapsed: boolean
  disabled: boolean
  visible: boolean
  indeterminate: boolean
  matched: boolean
  editable: boolean
  dragging: boolean
  draggable: boolean
  dropable: boolean
  loading: boolean
}

/**
 * Tree configuration options
 */
export interface TreeOptions {
  // Selection
  multiple?: boolean
  checkbox?: boolean
  checkOnSelect?: boolean
  autoCheckChildren?: boolean
  parentSelect?: boolean

  // Interaction
  keyboardNavigation?: boolean
  editing?: boolean
  dnd?: boolean | DragAndDropOptions

  // Data
  fetchData?: string | ((node: Node) => Promise<TreeNodeData[]>)
  onFetchError?: (error: Error, node: Node) => void

  // Display
  filter?: FilterOptions
  sort?: SortOptions
  propertyNames?: PropertyNames

  // Events
  emptyText?: string

  // Other
  [key: string]: any // Allow additional options
}

/**
 * Drag and drop configuration
 */
export interface DragAndDropOptions {
  enabled?: boolean
  onDragStart?: (node: Node, event: DragEvent) => boolean
  onDragEnd?: (node: Node, event: DragEvent) => void
  onDrop?: (targetNode: Node, draggedNode: Node, placement: DropPlacement) => boolean
}

export type DropPlacement = 'before' | 'after' | 'inside'

/**
 * Filter configuration
 */
export interface FilterOptions {
  emptyText?: string
  matcher?: (query: string, node: Node) => boolean
  plainList?: boolean
  showChildren?: boolean
}

/**
 * Sort configuration
 */
export interface SortOptions {
  comparator?: (a: Node, b: Node) => number
  deep?: boolean
}

/**
 * Custom property names mapping
 * Allows users to use different property names in their data
 */
export interface PropertyNames {
  text?: string
  children?: string
  state?: string
  data?: string
  id?: string
  [key: string]: string | undefined
}

/**
 * Filter function type
 */
export type FilterFunction = string | RegExp | ((node: Node) => boolean)

/**
 * Event payloads
 */
export interface NodeEventPayload {
  node: Node
}

export interface NodeSelectionEventPayload extends NodeEventPayload {
  selected: boolean
}

export interface NodeCheckEventPayload extends NodeEventPayload {
  checked: boolean
}

export interface NodeExpandEventPayload extends NodeEventPayload {
  expanded: boolean
}

export interface NodeTextChangedEventPayload extends NodeEventPayload {
  text: string
  oldText: string
}

export interface NodeDataChangedEventPayload extends NodeEventPayload {
  data: Record<string, any>
}

/**
 * Tree event names
 */
export type TreeEventName =
  | 'node:selected'
  | 'node:unselected'
  | 'node:checked'
  | 'node:unchecked'
  | 'node:expanded'
  | 'node:collapsed'
  | 'node:added'
  | 'node:removed'
  | 'node:text:changed'
  | 'node:data:changed'
  | 'node:editing'
  | 'node:editing:stopped'
  | 'node:dragstart'
  | 'node:dropped'

/**
 * Re-export core classes for convenience
 */
export type { Node } from '../core/Node'
export type { Tree } from '../core/Tree'
export type { Selection } from '../core/Selection'
