import { Node } from './Node'
import type { TreeOptions, TreeNodeData, FilterFunction } from '../types'

type EventHandler = (...args: any[]) => void

/**
 * Tree class manages the tree structure and operations
 * Handles selection, filtering, sorting, and tree-level events
 */
export class Tree {
  options: TreeOptions
  model: Node[]
  selectedNodes: Node[]
  checkedNodes: Node[]
  activeElement: Node | null

  private eventHandlers: Map<string, EventHandler[]>

  constructor(options: TreeOptions = {}) {
    this.options = {
      multiple: false,
      checkbox: false,
      checkOnSelect: false,
      autoCheckChildren: false,
      parentSelect: true,
      keyboardNavigation: true,
      editing: false,
      dnd: false,
      filter: {
        emptyText: 'Nothing found',
        matcher: (query: string, node: Node) => {
          return node.text.toLowerCase().includes(query.toLowerCase())
        },
        plainList: false,
        showChildren: true
      },
      ...options
    }

    this.model = []
    this.selectedNodes = []
    this.checkedNodes = []
    this.activeElement = null
    this.eventHandlers = new Map()
  }

  /**
   * Parse tree data and create Node instances
   */
  setModel(data: TreeNodeData[]): void {
    this.model = this.parseData(data, null)

    // Initialize selection collections
    this.selectedNodes = []
    this.checkedNodes = []

    // Set tree reference and collect selected/checked nodes
    this.recurseDown((node) => {
      node.tree = this

      if (node.selected()) {
        this.selectedNodes.push(node)
      }

      if (node.checked()) {
        this.checkedNodes.push(node)
      }
    })

    // Enforce single selection if multiple is false
    if (!this.options.multiple && this.selectedNodes.length > 1) {
      const firstSelected = this.selectedNodes[0]

      this.selectedNodes.forEach((node) => {
        if (node !== firstSelected) {
          node.state('selected', false)
        }
      })

      this.selectedNodes = [firstSelected]
    }
  }

  /**
   * Parse data array into Node instances
   */
  private parseData(data: TreeNodeData[], parent: Node | null): Node[] {
    return data.map((item) => {
      const node = new Node(this, item)
      node.parent = parent

      if (item.children && item.children.length > 0) {
        node.children = this.parseData(item.children, node)
      }

      return node
    })
  }

  /**
   * Find a node by ID or predicate function
   */
  find(query: string | number | ((node: Node) => boolean)): Node | null {
    let result: Node | null = null

    this.recurseDown((node) => {
      if (result) return // Already found

      if (typeof query === 'function') {
        if (query(node)) {
          result = node
        }
      } else {
        if (node.id === query) {
          result = node
        }
      }
    })

    return result
  }

  /**
   * Find all nodes matching a predicate
   */
  findAll(predicate: (node: Node) => boolean): Node[] {
    const results: Node[] = []

    this.recurseDown((node) => {
      if (predicate(node)) {
        results.push(node)
      }
    })

    return results
  }

  /**
   * Select a node
   */
  select(node: Node, extendSelection: boolean = false): void {
    if (node.state('disabled')) {
      return
    }

    // If node is already selected and extending selection (Cmd/Ctrl+click), toggle it off
    if (node.selected() && extendSelection && this.options.multiple) {
      this.unselect(node)
      return
    }

    // If already selected, don't do anything
    if (node.selected()) {
      return
    }

    // Clear previous selection unless:
    // - multiple is true AND extendSelection is true (Cmd/Ctrl+click)
    const shouldClearPrevious = !(this.options.multiple && extendSelection)
    if (shouldClearPrevious) {
      this.unselectAll()
    }

    node.state('selected', true)

    if (!this.selectedNodes.includes(node)) {
      this.selectedNodes.push(node)
    }

    this.$emit('node:selected', node)
  }

  /**
   * Unselect a node
   */
  unselect(node: Node): void {
    if (!node.selected()) {
      return
    }

    node.state('selected', false)

    const index = this.selectedNodes.indexOf(node)
    if (index > -1) {
      this.selectedNodes.splice(index, 1)
    }

    this.$emit('node:unselected', node)
  }

  /**
   * Unselect all nodes
   */
  unselectAll(): void {
    this.selectedNodes.forEach((node) => {
      node.state('selected', false)
    })

    this.selectedNodes = []
  }

  /**
   * Check a node
   */
  check(node: Node): void {
    if (!this.options.checkbox || node.checked()) {
      return
    }

    node.state('checked', true)

    if (!this.checkedNodes.includes(node)) {
      this.checkedNodes.push(node)
    }

    this.$emit('node:checked', node)
  }

  /**
   * Uncheck a node
   */
  uncheck(node: Node): void {
    if (!node.checked()) {
      return
    }

    node.state('checked', false)

    const index = this.checkedNodes.indexOf(node)
    if (index > -1) {
      this.checkedNodes.splice(index, 1)
    }

    this.$emit('node:unchecked', node)
  }

  /**
   * Uncheck all nodes
   */
  uncheckAll(): void {
    this.checkedNodes.forEach((node) => {
      node.state('checked', false)
    })

    this.checkedNodes = []
  }

  /**
   * Traverse down all nodes in the tree
   */
  recurseDown(fn: (node: Node) => void): void {
    const traverse = (nodes: Node[]) => {
      for (const node of nodes) {
        fn(node)
        if (node.hasChildren()) {
          traverse(node.children)
        }
      }
    }

    traverse(this.model)
  }

  /**
   * Sort the tree
   */
  sort(compareFn: (a: Node, b: Node) => number, deep: boolean = false): void {
    this.model.sort(compareFn)

    if (deep) {
      this.recurseDown((node) => {
        if (node.hasChildren()) {
          node.children.sort(compareFn)
        }
      })
    }
  }

  /**
   * Filter the tree
   */
  filter(query: string): Node[] {
    if (!query) {
      return this.clearFilter()
    }

    const matches: Node[] = []
    const matcher = this.options.filter?.matcher || ((q: string, n: Node) =>
      n.text.toLowerCase().includes(q.toLowerCase())
    )
    const { showChildren, plainList } = this.options.filter || {}

    // Mark all nodes as not visible initially
    this.recurseDown((node) => {
      node.state('visible', false)
      node.state('matched', false)
    })

    // Find matches
    this.recurseDown((node) => {
      if (matcher(query, node)) {
        matches.push(node)
        node.state('matched', true)
        node.state('visible', true)

        // Make parent path visible
        node.recurseUp((parent) => {
          parent.state('visible', true)
        })

        // Optionally show children
        if (showChildren && node.hasChildren()) {
          node.recurseDown((child) => {
            child.state('visible', true)
          }, true)
        }
      }
    })

    this.$emit('tree:filtered', matches, query)

    return matches
  }

  /**
   * Clear filter
   */
  clearFilter(): Node[] {
    this.recurseDown((node) => {
      node.state('matched', false)
      node.state('visible', true)
    })

    this.$emit('tree:filtered', [], '')

    return []
  }

  /**
   * Event system - register event handler
   */
  $on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, [])
    }

    this.eventHandlers.get(event)!.push(handler)
  }

  /**
   * Event system - register one-time event handler
   */
  $once(event: string, handler: EventHandler): void {
    const onceHandler = (...args: any[]) => {
      handler(...args)
      this.$off(event, onceHandler)
    }

    this.$on(event, onceHandler)
  }

  /**
   * Event system - remove event handler
   */
  $off(event: string, handler?: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      return
    }

    if (!handler) {
      this.eventHandlers.delete(event)
      return
    }

    const handlers = this.eventHandlers.get(event)!
    const index = handlers.indexOf(handler)

    if (index > -1) {
      handlers.splice(index, 1)
    }

    if (handlers.length === 0) {
      this.eventHandlers.delete(event)
    }
  }

  /**
   * Event system - emit event
   */
  $emit(event: string, ...args: any[]): void {
    const handlers = this.eventHandlers.get(event)

    if (handlers) {
      handlers.forEach((handler) => {
        handler(...args)
      })
    }
  }
}
