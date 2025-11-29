import type { Tree } from './Tree'
import type { TreeNodeData, NodeState } from '../types'
import { uuidV4 } from '../utils/uuid'

/**
 * Node class represents a single tree node
 * Handles node state, parent/child relationships, and traversal
 */
export class Node {
  id: string | number
  tree: Tree
  states: Partial<NodeState>
  data: Record<string, any>
  children: Node[]
  parent: Node | null
  showChildren: boolean
  isBatch: boolean
  isEditing: boolean

  constructor(tree: Tree, item: TreeNodeData) {
    if (!item) {
      throw new Error('Node can not be empty')
    }

    if (!tree) {
      throw new Error('Node must have a Tree context!')
    }

    this.tree = tree
    this.id = item.id ?? uuidV4()
    this.states = item.state || {}
    this.showChildren = true
    this.children = []
    this.parent = null
    this.isBatch = item.isBatch || false
    this.isEditing = false

    // Store all data including text
    this.data = {
      ...item.data,
      text: item.text
    }
  }

  /**
   * Emit an event through the tree
   */
  $emit(event: string, ...args: any[]): void {
    this.tree.$emit(`node:${event}`, this, ...args)
  }

  /**
   * Get node text
   */
  get text(): string {
    return this.data.text
  }

  /**
   * Set node text and emit event if changed
   */
  set text(value: string) {
    const oldText = this.text

    if (oldText !== value) {
      this.data.text = value
      this.$emit('text:changed', value, oldText)
    }
  }

  /**
   * Get unique key for node
   */
  get key(): string {
    return String(this.id) + this.text
  }

  /**
   * Get node depth in the tree (0-indexed from root)
   */
  get depth(): number {
    let depth = 0
    let parent = this.parent

    if (!parent || this.showChildren === false) {
      return depth
    }

    while (parent) {
      depth++
      parent = parent.parent
    }

    return depth
  }

  /**
   * Get or set a state value
   */
  state(name: keyof NodeState): boolean | undefined
  state(name: keyof NodeState, value: boolean): this
  state(name: keyof NodeState, value?: boolean): boolean | undefined | this {
    if (value === undefined) {
      return this.states[name]
    }

    this.states[name] = value
    return this
  }

  /**
   * Set/merge node data
   */
  setData(data: Record<string, any>): Record<string, any> {
    this.data = {
      ...this.data,
      ...data
    }

    this.$emit('data:changed', this.data)

    return this.data
  }

  /**
   * Check if node has children
   */
  hasChildren(): boolean {
    return this.children.length > 0
  }

  /**
   * Get path from this node to root
   */
  getPath(): Node[] {
    if (!this.parent) {
      return [this]
    }

    const path: Node[] = [this]
    let el: Node | null = this

    while ((el = el.parent) !== null) {
      path.push(el)
    }

    return path
  }

  /**
   * Traverse up the tree from this node
   */
  recurseUp(fn: (node: Node) => boolean | void, node: Node = this): void {
    if (!node.parent) {
      return
    }

    if (fn(node.parent) !== false) {
      this.recurseUp(fn, node.parent)
    }
  }

  /**
   * Traverse down the tree from this node
   */
  recurseDown(fn: (node: Node) => void, ignoreThis: boolean = false): void {
    if (ignoreThis !== true) {
      fn(this)
    }

    if (this.hasChildren()) {
      for (const child of this.children) {
        child.recurseDown(fn, false)
      }
    }
  }

  /**
   * Convenience method: check if node is selected
   */
  selected(): boolean {
    return this.state('selected') || false
  }

  /**
   * Convenience method: check if node is selectable
   */
  selectable(): boolean {
    return !this.state('disabled') && this.state('selectable') !== false
  }

  /**
   * Convenience method: check if node is checked
   */
  checked(): boolean {
    return this.state('checked') || false
  }

  /**
   * Convenience method: check if node is expanded
   */
  expanded(): boolean {
    return this.state('expanded') || false
  }

  /**
   * Convenience method: check if node is disabled
   */
  disabled(): boolean {
    return this.state('disabled') || false
  }

  /**
   * Convenience method: check if node is indeterminate
   */
  indeterminate(): boolean {
    return this.state('indeterminate') || false
  }

  /**
   * Convenience method: check if node is editable
   */
  editable(): boolean {
    return !this.state('disabled') && this.state('editable') === true
  }
}
