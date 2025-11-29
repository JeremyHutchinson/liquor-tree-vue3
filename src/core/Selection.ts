import type { Node } from './Node'
import type { Tree } from './Tree'

/**
 * Selection class - wraps an array of nodes for bulk operations
 * Provides jQuery-like chainable methods for operating on multiple nodes
 */
export class Selection extends Array<Node> {
  tree: Tree

  constructor(tree: Tree, nodes: Node[] = []) {
    super(...nodes)
    this.tree = tree

    // Restore the prototype chain (needed for TypeScript extending Array)
    Object.setPrototypeOf(this, Selection.prototype)
  }

  /**
   * Get node at index
   */
  get(index: number): Node | undefined {
    if (index < 0 || index >= this.length) {
      return undefined
    }
    return this[index]
  }

  /**
   * Get first node in selection
   */
  node(): Node | null {
    return this.length > 0 ? this[0] : null
  }

  /**
   * Empty the selection
   */
  empty(): this {
    this.length = 0
    return this
  }

  /**
   * Add nodes to selection
   */
  add(...nodes: Node[]): this {
    this.push(...nodes)
    return this
  }

  /**
   * Remove node from selection
   */
  remove(node: Node): this {
    const index = this.indexOf(node)
    if (index > -1) {
      this.splice(index, 1)
    }
    return this
  }

  /**
   * Select all nodes in this selection
   */
  select(): this {
    this.forEach((node) => {
      this.tree.select(node, true) // extendSelection = true
    })
    return this
  }

  /**
   * Unselect all nodes in this selection
   */
  unselect(): this {
    this.forEach((node) => {
      this.tree.unselect(node)
    })
    return this
  }

  /**
   * Check all nodes in this selection
   */
  check(): this {
    if (!this.tree.options.checkbox) {
      return this
    }

    this.forEach((node) => {
      this.tree.check(node)
    })
    return this
  }

  /**
   * Uncheck all nodes in this selection
   */
  uncheck(): this {
    if (!this.tree.options.checkbox) {
      return this
    }

    this.forEach((node) => {
      this.tree.uncheck(node)
    })
    return this
  }

  /**
   * Expand all nodes in this selection
   */
  expand(): this {
    this.forEach((node) => {
      node.state('expanded', true)
    })
    return this
  }

  /**
   * Collapse all nodes in this selection
   */
  collapse(): this {
    this.forEach((node) => {
      node.state('expanded', false)
    })
    return this
  }

  /**
   * Disable all nodes in this selection
   */
  disable(): this {
    this.forEach((node) => {
      node.state('disabled', true)
    })
    return this
  }

  /**
   * Enable all nodes in this selection
   */
  enable(): this {
    this.forEach((node) => {
      node.state('disabled', false)
    })
    return this
  }
}
