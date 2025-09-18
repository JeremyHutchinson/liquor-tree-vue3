/**
 * Selection class - TypeScript implementation
 * Manages selection operations on multiple tree nodes
 */

import type { TreeCore } from '../types';
import { Node } from './Node';

/**
 * Helper function to apply a method to all nodes in the selection
 */
function nodeIterator(
  context: readonly Node[], 
  method: keyof Node, 
  ...args: any[]
): void {
  context.forEach(node => {
    const fn = node[method];
    if (typeof fn === 'function') {
      (fn as Function).apply(node, args);
    }
  });
}

/**
 * Selection class that extends Array to manage multiple tree nodes
 */
export class Selection extends Array<Node> {
  public tree: TreeCore;

  constructor(tree: TreeCore, items: Node[] = []) {
    super();
    
    this.tree = tree;
    this.push(...items);
    
    // Ensure the array prototype is properly set
    Object.setPrototypeOf(this, Selection.prototype);
  }

  /**
   * Remove all nodes in the selection from their parents
   */
  remove(): Selection {
    nodeIterator(this, 'remove');
    return this;
  }

  /**
   * Expand all nodes in the selection
   */
  expand(): Selection {
    nodeIterator(this, 'expand');
    return this;
  }

  /**
   * Collapse all nodes in the selection
   */
  collapse(): Selection {
    nodeIterator(this, 'collapse');
    return this;
  }

  /**
   * Select all nodes in the selection
   */
  select(extendList?: boolean): Selection {
    nodeIterator(this, 'select', extendList);
    return this;
  }

  /**
   * Unselect all nodes in the selection
   */
  unselect(): Selection {
    nodeIterator(this, 'unselect');
    return this;
  }

  /**
   * Check all nodes in the selection (if checkbox mode is enabled)
   */
  check(): Selection {
    if (this.tree.options.checkbox) {
      nodeIterator(this, 'check');
    }
    return this;
  }

  /**
   * Uncheck all nodes in the selection (if checkbox mode is enabled)
   */
  uncheck(): Selection {
    if (this.tree.options.checkbox) {
      nodeIterator(this, 'uncheck');
    }
    return this;
  }

  /**
   * Disable all nodes in the selection
   */
  disable(): Selection {
    this.forEach(node => {
      node.state('disabled', true);
    });
    return this;
  }

  /**
   * Enable all nodes in the selection
   */
  enable(): Selection {
    this.forEach(node => {
      node.state('disabled', false);
    });
    return this;
  }

  /**
   * Get the IDs of all nodes in the selection
   */
  getIds(): (string | number)[] {
    return this.map(node => node.id);
  }

  /**
   * Get the keys of all nodes in the selection
   */
  getKeys(): string[] {
    return this.map(node => node.key);
  }

  /**
   * Get the text values of all nodes in the selection
   */
  getTexts(): string[] {
    return this.map(node => node.text);
  }

  /**
   * Get the data objects of all nodes in the selection
   */
  getData(): Record<string, any>[] {
    return this.map(node => node.data);
  }

  /**
   * Check if the selection contains a specific node
   */
  contains(node: Node): boolean {
    return this.indexOf(node) !== -1;
  }

  /**
   * Check if the selection is empty
   */
  isEmpty(): boolean {
    return this.length === 0;
  }

  /**
   * Get the first node in the selection
   */
  first(): Node | null {
    return this[0] || null;
  }

  /**
   * Get the last node in the selection
   */
  last(): Node | null {
    return this[this.length - 1] || null;
  }

  /**
   * Clear the selection
   */
  clear(): Selection {
    this.length = 0;
    return this;
  }

  /**
   * Add nodes to the selection if they're not already included
   */
  add(...nodes: Node[]): Selection {
    nodes.forEach(node => {
      if (!this.contains(node)) {
        this.push(node);
      }
    });
    return this;
  }

  /**
   * Remove nodes from the selection
   */
  removeNodes(...nodes: Node[]): Selection {
    nodes.forEach(node => {
      const index = this.indexOf(node);
      if (index > -1) {
        this.splice(index, 1);
      }
    });
    return this;
  }

  /**
   * Toggle nodes in the selection
   */
  toggle(...nodes: Node[]): Selection {
    nodes.forEach(node => {
      if (this.contains(node)) {
        this.removeNodes(node);
      } else {
        this.add(node);
      }
    });
    return this;
  }

  /**
   * Filter the selection by a predicate function
   */
  filterNodes(predicate: (node: Node) => boolean): Selection {
    const filtered = this.filter(predicate);
    this.clear();
    this.push(...filtered);
    return this;
  }

  /**
   * Map over the selection and return a new array
   */
  mapNodes<T>(mapper: (node: Node) => T): T[] {
    return this.map(mapper);
  }

  /**
   * Find the first node in the selection that matches a predicate
   */
  findNode(predicate: (node: Node) => boolean): Node | undefined {
    return this.find(predicate);
  }

  /**
   * Check if any node in the selection matches a predicate
   */
  someNodes(predicate: (node: Node) => boolean): boolean {
    return super.some(predicate);
  }

  /**
   * Check if all nodes in the selection match a predicate
   */
  everyNode(predicate: (node: Node) => boolean): boolean {
    return super.every(predicate);
  }

  /**
   * Create a copy of the selection
   */
  clone(): Selection {
    return new Selection(this.tree, [...this]);
  }

  /**
   * Convert the selection to a plain array
   */
  toArray(): Node[] {
    return [...this];
  }

  /**
   * Get a string representation of the selection
   */
  toString(): string {
    return `Selection(${this.length} nodes): [${this.map(n => n.text).join(', ')}]`;
  }
}