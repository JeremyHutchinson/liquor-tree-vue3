/**
 * Node class - TypeScript implementation
 * Represents a single tree node with state management
 */

import type { 
  Key, 
  TreeNodeData, 
  NodeState, 
  TreeNode as TreeNodeInterface,
  TreeCore
} from '../types';
import { recurseDown } from '../utils/recurse';
import find from '../utils/find';
import uuidV4 from '../utils/uuidV4';
import { EventBusAdapter } from './eventBus';

export class Node implements TreeNodeInterface {
  public readonly id: Key;
  public states: NodeState;
  public data: Record<string, any>;
  public children: Node[];
  public parent: Node | null;
  public tree: TreeCore | null;
  public showChildren: boolean;
  public isBatch: boolean;
  public isEditing: boolean;

  constructor(tree: TreeCore, item: TreeNodeData) {
    if (!item) {
      throw new Error('Node cannot be empty');
    }

    if (!tree) {
      throw new Error('Node must have a Tree context!');
    }

    this.tree = tree;
    this.id = item.id || uuidV4();
    this.states = item.state ? { ...item.state } : {};
    this.showChildren = true;
    this.children = [];
    this.parent = item.parent as Node || null;
    this.isBatch = item.isBatch || false;
    this.isEditing = false;

    // Set up data with text as a special case
    this.data = {
      ...item.data,
      text: item.text || ''
    };

    // Process children if they exist
    if (item.children && Array.isArray(item.children)) {
      this.children = item.children.map(childData => new Node(tree, {
        ...childData,
        parent: this
      }));
    }
  }

  /**
   * Get the node's display text
   */
  get text(): string {
    return this.data.text || '';
  }

  /**
   * Set the node's display text
   */
  set text(value: string) {
    const oldText = this.text;
    if (oldText !== value) {
      this.data.text = value;
      this.emit('text:changed', { text: value, oldText });
    }
  }

  /**
   * Get the node's depth in the tree
   */
  get depth(): number {
    let depth = 0;
    let parent = this.parent;

    if (!parent || this.showChildren === false) {
      return depth;
    }

    while (parent) {
      depth++;
      parent = parent.parent;
    }

    return depth;
  }

  /**
   * Get a unique key for this node
   */
  get key(): string {
    return `${this.id}_${this.text}`;
  }

  /**
   * Emit an event through the tree's event system
   */
  private emit(event: string, payload?: any): void {
    if (this.tree && (this.tree as any).eventBus) {
      const eventBus = (this.tree as any).eventBus as EventBusAdapter;
      eventBus.emit(`node:${event}` as any, { node: this, ...payload });
    }
  }

  /**
   * Get or set a state property
   */
  state(name: keyof NodeState, value?: boolean): boolean | this {
    if (value === undefined) {
      return this.states[name] || false;
    }

    this.states[name] = value;
    return this;
  }

  /**
   * Set multiple data properties
   */
  setData(data: Record<string, any>): Record<string, any> {
    this.data = { ...this.data, ...data };
    this.emit('data:changed', { data: this.data });
    return this.data;
  }

  /**
   * Get the path from root to this node
   */
  getPath(): Node[] {
    if (!this.parent) {
      return [this];
    }

    const path: Node[] = [this];
    let el: Node | null = this;

    while ((el = el.parent) !== null) {
      path.push(el);
    }

    return path;
  }

  /**
   * Recursively traverse up the tree
   */
  recurseUp(fn: (node: Node) => boolean | void, node: Node = this): void {
    if (!node.parent) {
      return;
    }

    if (fn(node.parent) !== false) {
      this.recurseUp(fn, node.parent);
    }
  }

  /**
   * Recursively traverse down the tree
   */
  recurseDown(fn: (node: Node) => void, ignoreThis?: boolean): void {
    if (ignoreThis !== true) {
      fn(this);
    }

    if (this.hasChildren()) {
      recurseDown(this.children, fn);
    }
  }

  /**
   * Check if node has children
   */
  hasChildren(): boolean {
    return this.children.length > 0;
  }

  /**
   * Check if node is a leaf (no children)
   */
  isLeaf(): boolean {
    return !this.hasChildren();
  }

  /**
   * Get the first child
   */
  first(): Node | null {
    return this.children[0] || null;
  }

  /**
   * Get the last child
   */
  last(): Node | null {
    return this.children[this.children.length - 1] || null;
  }

  /**
   * Get the next sibling
   */
  next(): Node | null {
    if (!this.parent) {
      return null;
    }

    const siblings = this.parent.children;
    const index = siblings.indexOf(this);
    return siblings[index + 1] || null;
  }

  /**
   * Get the previous sibling
   */
  prev(): Node | null {
    if (!this.parent) {
      return null;
    }

    const siblings = this.parent.children;
    const index = siblings.indexOf(this);
    return siblings[index - 1] || null;
  }

  // State methods
  selected(): boolean {
    return this.state('selected') as boolean;
  }

  checked(): boolean {
    return this.state('checked') as boolean;
  }

  expanded(): boolean {
    return this.state('expanded') as boolean;
  }

  collapsed(): boolean {
    return !this.expanded();
  }

  disabled(): boolean {
    return this.state('disabled') as boolean;
  }

  visible(): boolean {
    return this.state('visible') !== false; // Default to true if not set
  }

  indeterminate(): boolean {
    return this.state('indeterminate') as boolean;
  }

  selectable(): boolean {
    return !this.disabled() && this.state('selectable') !== false;
  }

  editable(): boolean {
    return !this.disabled() && this.state('editable') === true;
  }

  // Action methods
  select(extendList?: boolean): Node {
    if (!this.selectable() || this.selected()) {
      return this;
    }

    if (this.tree && (this.tree as any).select) {
      (this.tree as any).select(this, extendList);
    }

    this.state('selected', true);
    this.emit('selected');
    
    return this;
  }

  unselect(): Node {
    if (!this.selected()) {
      return this;
    }

    if (this.tree && (this.tree as any).unselect) {
      (this.tree as any).unselect(this);
    }

    this.state('selected', false);
    this.emit('unselected');
    
    return this;
  }

  check(): Node {
    if (!this.tree?.options.checkbox || this.disabled() || this.checked()) {
      return this;
    }

    this.state('checked', true);
    
    if (this.tree && (this.tree as any).check) {
      (this.tree as any).check(this);
    }

    // Auto-check children if enabled
    if (this.tree.options.autoCheckChildren) {
      this.recurseDown(child => {
        if (!child.disabled()) {
          child.state('checked', true);
        }
      }, true);
    }

    this.emit('checked');
    
    // Refresh parent indeterminate state
    if (this.parent) {
      this.parent.refreshIndeterminateState();
    }
    
    return this;
  }

  uncheck(): Node {
    if (!this.tree?.options.checkbox || this.disabled() || !this.checked()) {
      return this;
    }

    this.state('checked', false);
    
    if (this.tree && (this.tree as any).uncheck) {
      (this.tree as any).uncheck(this);
    }

    // Auto-uncheck children if enabled
    if (this.tree.options.autoCheckChildren) {
      this.recurseDown(child => {
        child.state('checked', false);
      }, true);
    }

    this.emit('unchecked');
    
    // Refresh parent indeterminate state
    if (this.parent) {
      this.parent.refreshIndeterminateState();
    }
    
    return this;
  }

  expand(): Node {
    if (this.expanded() || !this.hasChildren()) {
      return this;
    }

    this.state('expanded', true);
    this.emit('expand');
    
    return this;
  }

  collapse(): Node {
    if (this.collapsed() || !this.hasChildren()) {
      return this;
    }

    this.state('expanded', false);
    this.emit('collapse');
    
    return this;
  }

  toggle(): Node {
    if (this.expanded()) {
      return this.collapse();
    } else {
      return this.expand();
    }
  }

  /**
   * Refresh the indeterminate state based on children
   */
  refreshIndeterminateState(): Node {
    if (!this.tree?.options.autoCheckChildren) {
      return this;
    }

    this.state('indeterminate', false);

    if (this.hasChildren()) {
      const childrenCount = this.children.length;
      let checked = 0;
      let indeterminate = 0;
      let disabled = 0;

      this.children.forEach(child => {
        if (child.checked()) {
          checked++;
        }
        if (child.disabled()) {
          disabled++;
        }
        if (child.indeterminate()) {
          indeterminate++;
        }
      });

      if (checked > 0 && checked === childrenCount - disabled) {
        // All non-disabled children are checked
        if (!this.checked()) {
          this.state('checked', true);
          if (this.tree && (this.tree as any).check) {
            (this.tree as any).check(this);
          }
          this.emit('checked');
        }
      } else {
        // Mixed or no children checked
        if (this.checked()) {
          this.state('checked', false);
          if (this.tree && (this.tree as any).uncheck) {
            (this.tree as any).uncheck(this);
          }
          this.emit('unchecked');
        }

        this.state(
          'indeterminate',
          indeterminate > 0 || (checked > 0 && checked < childrenCount)
        );
      }
    }

    if (this.parent) {
      this.parent.refreshIndeterminateState();
    }

    return this;
  }

  /**
   * Append a child node
   */
  append(nodeData: TreeNodeData | TreeNodeData[]): Node | Node[] {
    const nodes = Array.isArray(nodeData) ? nodeData : [nodeData];
    const addedNodes: Node[] = [];

    nodes.forEach(data => {
      const node = new Node(this.tree!, { ...data, parent: this });
      this.children.push(node);
      addedNodes.push(node);
      
      // Recursively set tree reference
      node.recurseDown(n => {
        n.tree = this.tree;
      });
    });

    return Array.isArray(nodeData) ? addedNodes : addedNodes[0];
  }

  /**
   * Prepend a child node
   */
  prepend(nodeData: TreeNodeData | TreeNodeData[]): Node | Node[] {
    const nodes = Array.isArray(nodeData) ? nodeData : [nodeData];
    const addedNodes: Node[] = [];

    nodes.forEach((data, index) => {
      const node = new Node(this.tree!, { ...data, parent: this });
      this.children.splice(index, 0, node);
      addedNodes.push(node);
      
      // Recursively set tree reference
      node.recurseDown(n => {
        n.tree = this.tree;
      });
    });

    return Array.isArray(nodeData) ? addedNodes : addedNodes[0];
  }

  /**
   * Remove this node from its parent
   */
  remove(): boolean {
    if (!this.parent) {
      // Root level node, need to remove from tree model
      if (this.tree && (this.tree as any).model) {
        const model = (this.tree as any).model;
        const index = model.indexOf(this);
        if (index > -1) {
          model.splice(index, 1);
          this.emit('removed');
          return true;
        }
      }
      return false;
    }

    const index = this.parent.children.indexOf(this);
    if (index > -1) {
      this.parent.children.splice(index, 1);
      this.parent = null;
      this.tree = null;
      this.emit('removed');
      return true;
    }

    return false;
  }
}