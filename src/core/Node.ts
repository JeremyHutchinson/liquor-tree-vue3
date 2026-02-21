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

    // Store all data including text and any additional properties
    // Extract known properties to exclude from data
    const { id, state, children, isBatch, text, data, ...additionalProps } = item

    this.data = {
      ...data,
      ...additionalProps,
      text: text
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
   * Convenience method: check if node is editable.
   * Per-node state('editable') takes precedence; falls back to tree.options.editing.
   */
  editable(): boolean {
    if (this.state('disabled')) return false
    const nodeState = this.state('editable')
    if (nodeState !== undefined) return nodeState === true
    return this.tree.options.editing === true
  }

  /**
   * Select the node
   */
  select(extendSelection: boolean = false): void {
    this.tree.select(this, extendSelection)
  }

  /**
   * Unselect the node
   */
  unselect(): void {
    this.tree.unselect(this)
  }

  /**
   * Select a range of nodes from the anchor to this node (Shift+click)
   */
  selectRange(): void {
    this.tree.selectRange(this)
  }

  /**
   * Begin inline editing of node text
   */
  startEditing(): void {
    if (!this.editable()) {
      return
    }
    this.isEditing = true
    this.$emit('editing')
  }

  /**
   * Finish inline editing
   * @param save - if true, newText is committed; if false, edit is cancelled
   * @param newText - the new text value (only used when save is true)
   */
  stopEditing(save: boolean, newText?: string): void {
    if (!this.isEditing) {
      return
    }
    this.isEditing = false
    if (save && newText !== undefined && newText !== this.text) {
      this.text = newText
    }
    this.$emit('editing:stopped')
  }

  /**
   * Toggle selection state
   */
  toggleSelect(): void {
    if (this.selected()) {
      this.unselect()
    } else {
      this.select()
    }
  }

  /**
   * Expand the node
   */
  expand(): void {
    if (!this.expanded()) {
      this.state('expanded', true)
      this.$emit('expanded')
    }
  }

  /**
   * Collapse the node
   */
  collapse(): void {
    if (this.expanded()) {
      this.state('expanded', false)
      this.$emit('collapsed')
    }
  }

  /**
   * Toggle expand/collapse state
   */
  toggleExpand(): void {
    if (this.expanded()) {
      this.collapse()
    } else {
      this.expand()
    }
  }

  /**
   * Convenience method: check if node is collapsed
   */
  collapsed(): boolean {
    return !this.expanded()
  }

  /**
   * Check the node (checkbox feature)
   */
  check(): void {
    this.tree.check(this)
  }

  /**
   * Uncheck the node (checkbox feature)
   */
  uncheck(): void {
    this.tree.uncheck(this)
  }

  /**
   * Get first child node
   */
  first(): Node | null {
    return this.children.length > 0 ? this.children[0] : null
  }

  /**
   * Focus this node (set as activeElement)
   */
  focus(): void {
    this.tree.activeElement = this
    this.$emit('focused')
  }

  /**
   * Check if node is draggable
   */
  isDraggable(): boolean {
    const draggableState = this.state('draggable')
    if (draggableState === false) {
      return false
    }
    return true
  }

  /**
   * Check if node can accept drops
   */
  isDropable(): boolean {
    const dropableState = this.state('dropable')
    if (dropableState === false) {
      return false
    }
    return true
  }

  /**
   * Remove this node from its parent
   */
  remove(): void {
    if (!this.parent) {
      // Remove from tree root
      const index = this.tree.model.indexOf(this)
      if (index > -1) {
        this.tree.model.splice(index, 1)
      }
    } else {
      // Remove from parent's children
      const index = this.parent.children.indexOf(this)
      if (index > -1) {
        this.parent.children.splice(index, 1)
      }
    }
    this.$emit('removed')
  }

  /**
   * Append a node as a child of this node
   */
  append(node: Node): void {
    // Remove from current location
    node.remove()

    // Add to this node's children
    this.children.push(node)
    node.parent = this

    this.$emit('child:added', node)
  }

  /**
   * Insert a node before this node
   */
  insertBefore(node: Node): void {
    // Remove from current location
    node.remove()

    if (!this.parent) {
      // Insert in tree root
      const index = this.tree.model.indexOf(this)
      this.tree.model.splice(index, 0, node)
      node.parent = null
    } else {
      // Insert in parent's children
      const index = this.parent.children.indexOf(this)
      this.parent.children.splice(index, 0, node)
      node.parent = this.parent
    }

    this.$emit('node:inserted:before', node)
  }

  /**
   * Insert a node after this node
   */
  insertAfter(node: Node): void {
    // Remove from current location
    node.remove()

    if (!this.parent) {
      // Insert in tree root
      const index = this.tree.model.indexOf(this)
      this.tree.model.splice(index + 1, 0, node)
      node.parent = null
    } else {
      // Insert in parent's children
      const index = this.parent.children.indexOf(this)
      this.parent.children.splice(index + 1, 0, node)
      node.parent = this.parent
    }

    this.$emit('node:inserted:after', node)
  }
}
