/**
 * Tree class - TypeScript implementation
 * Main tree management class with event bus integration
 */

import type { 
  TreeOptions, 
  TreeNodeData, 
  Key, 
  TreeCore,
  Predicate,
  SortFn,
  FetchDataFunction
} from '../types';
import { Node } from './Node';
import { Selection } from './Selection';
import { EventBusAdapter, createEventBus } from './eventBus';

import find from '../utils/find';
import objectToNode from '../utils/objectToNode';
import { List } from '../utils/stack';
import { TreeParser } from '../utils/treeParser';
import { recurseDown } from '../utils/recurse';
import { get, createTemplate } from '../utils/request';
import sort from '../utils/sort';
import fetchDelay from '../utils/fetchDelay';

// Default options for the tree
const defaultOptions: Partial<TreeOptions> = {
  direction: 'ltr',
  multiple: true,
  checkbox: false,
  checkOnSelect: false,
  autoCheckChildren: true,
  autoDisableChildren: true,
  checkDisabledChildren: true,
  parentSelect: false,
  keyboardNavigation: true,
  nodeIndent: 24,
  minFetchDelay: 0,
  fetchData: null,
  propertyNames: null,
  deletion: false,
  dnd: false,
  editing: false,
  onFetchError: (err: any) => { throw err; },
  filter: {
    emptyText: 'Nothing found!',
    matcher: (query: string, node: any) => {
      const isMatched = new RegExp(query, 'i').test(node.text);
      
      if (isMatched) {
        if (node.parent && new RegExp(query, 'i').test(node.parent.text)) {
          return false;
        }
      }
      
      return isMatched;
    },
    plainList: false,
    showChildren: true
  }
};

export class Tree implements TreeCore {
  public model: Node[] = [];
  public selectedNodes: Node[] = [];
  public checkedNodes: Node[] = [];
  public options: TreeOptions;
  public eventBus: EventBusAdapter;
  public activeElement: Node | null = null;
  private parser?: TreeParser;

  constructor(options: TreeOptions = {}) {
    // Merge options with defaults
    this.options = {
      ...defaultOptions,
      ...options,
      filter: {
        ...defaultOptions.filter,
        ...options.filter
      }
    } as TreeOptions;

    // Create event bus for this tree instance
    const bus = createEventBus();
    this.eventBus = new EventBusAdapter(bus);

    // Set up fetch data function if it's a string template
    if (typeof this.options.fetchData === 'string') {
      const urlTemplate = createTemplate(this.options.fetchData);
      this.options.fetchData = ((template) => {
        return (node: TreeNodeData) => {
          return get(template(node)).catch(this.options.onFetchError!);
        };
      })(urlTemplate);
    }

    // Initialize lists for selected and checked nodes
    this.selectedNodes = new List() as Node[];
    this.checkedNodes = new List() as Node[];
  }

  // Event system methods (bridge to internal mitt bus)
  on(event: string, handler: (payload?: any) => void): void {
    this.eventBus.on(event as any, handler);
  }

  once(event: string, handler: (payload?: any) => void): void {
    this.eventBus.once(event as any, handler);
  }

  off(event: string, handler?: (payload?: any) => void): void {
    this.eventBus.off(event as any, handler);
  }

  emit(event: string, payload?: any): void {
    this.eventBus.emit(event as any, payload);
  }

  silence(): void {
    this.eventBus.silence();
  }

  unsilence(): void {
    this.eventBus.unsilence();
  }

  // Model management
  async setModel(data: TreeNodeData[]): Promise<void> {
    return new Promise((resolve) => {
      this.model = this.parse(data);

      // Use requestAnimationFrame for Vue reactivity compatibility
      requestAnimationFrame(() => {
        resolve();
      });

      // Reinitialize tracking arrays
      this.selectedNodes = new List() as Node[];
      this.checkedNodes = new List() as Node[];

      // Process all nodes in the tree
      this.recurseDown(this.model, (node) => {
        node.tree = this;

        if (node.selected()) {
          this.addToSelected(node);
        }

        if (node.checked()) {
          this.addToChecked(node);
          
          if (node.parent) {
            node.parent.refreshIndeterminateState();
          }
        }

        // Auto-disable children if parent is disabled
        if (this.options.autoDisableChildren && node.disabled()) {
          node.recurseDown(child => {
            child.state('disabled', true);
          });
        }
      });

      // Ensure single selection if multiple is disabled
      if (!this.options.multiple && this.selectedNodes.length > 0) {
        const top = this.selectedNodes[this.selectedNodes.length - 1];
        
        this.selectedNodes.forEach(node => {
          if (top !== node) {
            node.state('selected', false);
          }
        });

        this.selectedNodes = [top] as any;
      }

      // Handle checkOnSelect option
      if (this.options.checkOnSelect && this.options.checkbox) {
        this.unselectAll();
      }
    });
  }

  /**
   * Parse raw data into Node instances
   */
  private parse(data: TreeNodeData[]): Node[] {
    if (!data || !Array.isArray(data)) {
      return [];
    }

    return data.map(item => this.objectToNode(item));
  }

  /**
   * Convert a plain object to a Node instance
   */
  private objectToNode(item: TreeNodeData): Node {
    return objectToNode(this, item);
  }

  /**
   * Recursively traverse the tree
   */
  recurseDown(
    source?: Node[] | Node | ((node: Node) => void), 
    fn?: (node: Node) => void
  ): void {
    if (!fn && source) {
      fn = source as (node: Node) => void;
      source = this.model;
    }

    if (typeof fn !== 'function') {
      throw new TypeError('Argument must be a function');
    }

    recurseDown(source as Node[], fn);
  }

  // Search and filtering
  find(query: any, multiple?: boolean): Node[] | Node | null {
    const result = find(this.model, query, true);
    
    if (!result) {
      return null;
    }

    return multiple ? result : result[0] || null;
  }

  getNode(criteria: any): Node | null {
    if (criteria instanceof Node) {
      return criteria;
    }

    const result = this.find(criteria);
    return Array.isArray(result) ? result[0] : result;
  }

  filter(query?: string): Node[] {
    if (!query) {
      return this.clearFilter();
    }

    const matches: Node[] = [];
    const predicate = this.options.filter!.matcher!;
    const { showChildren, plainList } = this.options.filter!;

    // Collect matching nodes
    this.recurseDown(node => {
      if (predicate(query, node)) {
        matches.push(node);
      }

      node.showChildren = true;

      // Save previous expanded state
      if ((node as any).__expanded === undefined) {
        (node as any).__expanded = node.state('expanded');
      }

      node.state('visible', false);
      node.state('matched', false);
      node.state('expanded', true);
    });

    // Process matches
    matches.reverse().forEach(node => {
      node.state('matched', true);
      node.state('visible', true);
      node.showChildren = !plainList!;

      if (node.hasChildren()) {
        node.recurseDown(n => {
          n.state('visible', !!showChildren);
        }, true);
      }

      node.recurseUp(parent => {
        parent.state('visible', true);
        parent.state('expanded', true);
      });

      if (node.hasChildren()) {
        node.state('expanded', false);
      }
    });

    this.emit('tree:filtered', { matches, query });
    return matches;
  }

  clearFilter(): Node[] {
    this.recurseDown(node => {
      node.state('matched', false);
      node.state('visible', true);
      
      const expanded = (node as any).__expanded;
      if (expanded !== undefined) {
        node.state('expanded', expanded);
        (node as any).__expanded = undefined;
      }
      
      node.showChildren = true;
    });

    this.emit('tree:filtered', { matches: [], query: '' });
    return [];
  }

  // Selection management
  selected(): Selection {
    return new Selection(this, this.selectedNodes);
  }

  checked(): Selection | null {
    if (!this.options.checkbox) {
      return null;
    }

    return new Selection(this, this.checkedNodes);
  }

  private addToSelected(node: Node): void {
    const list = this.selectedNodes as any;
    if (list.add && typeof list.add === 'function') {
      list.add(node);
    } else {
      if (this.selectedNodes.indexOf(node) === -1) {
        this.selectedNodes.push(node);
      }
    }
  }

  private removeFromSelected(node: Node): void {
    const list = this.selectedNodes as any;
    if (list.remove && typeof list.remove === 'function') {
      list.remove(node);
    } else {
      const index = this.selectedNodes.indexOf(node);
      if (index > -1) {
        this.selectedNodes.splice(index, 1);
      }
    }
  }

  private addToChecked(node: Node): void {
    const list = this.checkedNodes as any;
    if (list.add && typeof list.add === 'function') {
      list.add(node);
    } else {
      if (this.checkedNodes.indexOf(node) === -1) {
        this.checkedNodes.push(node);
      }
    }
  }

  private removeFromChecked(node: Node): void {
    const list = this.checkedNodes as any;
    if (list.remove && typeof list.remove === 'function') {
      list.remove(node);
    } else {
      const index = this.checkedNodes.indexOf(node);
      if (index > -1) {
        this.checkedNodes.splice(index, 1);
      }
    }
  }

  select(node: Node | any, extendList?: boolean): boolean {
    const treeNode = this.getNode(node);

    if (!treeNode) {
      return false;
    }

    if (this.options.multiple && extendList) {
      this.addToSelected(treeNode);
    } else {
      this.unselectAll();
      this.addToSelected(treeNode);
    }

    treeNode.state('selected', true);
    this.emit('selection:change', { 
      selected: [...this.selectedNodes], 
      node: treeNode 
    });

    return true;
  }

  unselect(node: Node | any): boolean {
    const treeNode = this.getNode(node);

    if (!treeNode) {
      return false;
    }

    this.removeFromSelected(treeNode);
    treeNode.state('selected', false);
    
    this.emit('selection:change', { 
      selected: [...this.selectedNodes], 
      node: treeNode 
    });

    return true;
  }

  selectAll(): boolean {
    if (!this.options.multiple) {
      return false;
    }

    this.selectedNodes = [] as any;

    this.recurseDown(node => {
      node.state('selected', true);
      this.addToSelected(node);
    });

    this.emit('selection:change', { 
      selected: [...this.selectedNodes], 
      node: null 
    });

    return true;
  }

  unselectAll(): boolean {
    const nodes = [...this.selectedNodes];
    
    nodes.forEach(node => {
      node.state('selected', false);
    });

    this.selectedNodes = [] as any;
    
    this.emit('selection:change', { 
      selected: [], 
      node: null 
    });

    return true;
  }

  // Checkbox management
  check(node: Node): void {
    this.addToChecked(node);
  }

  uncheck(node: Node): void {
    this.removeFromChecked(node);
  }

  checkAll(): void {
    this.recurseDown(node => {
      if (node.depth === 0) {
        if (node.indeterminate()) {
          node.state('indeterminate', false);
        }
        
        node.state('checked', true);
        this.addToChecked(node);
      }
    });
  }

  uncheckAll(): boolean {
    const nodes = [...this.checkedNodes];
    
    nodes.forEach(node => {
      node.state('checked', false);
    });

    this.checkedNodes = [] as any;
    return true;
  }

  // Node expansion
  expand(node: Node): boolean {
    if (node.expanded()) {
      return false;
    }

    node.state('expanded', true);
    return true;
  }

  collapse(node: Node): boolean {
    if (node.collapsed()) {
      return false;
    }

    node.state('expanded', false);
    return true;
  }

  toggleExpand(node: Node): boolean {
    if (!node.hasChildren()) {
      return false;
    }

    if (node.expanded()) {
      return this.collapse(node);
    } else {
      return this.expand(node);
    }
  }

  expandAll(): void {
    this.recurseDown(node => {
      if (node.hasChildren() && node.collapsed()) {
        node.state('expanded', true);
      }
    });
  }

  collapseAll(): void {
    this.recurseDown(node => {
      if (node.hasChildren() && node.expanded()) {
        node.state('expanded', false);
      }
    });
  }

  // Node navigation
  index(node: Node, verbose?: boolean): number | { index: number; target: Node[]; node: Node } {
    let target: Node[];

    if (node.parent) {
      target = node.parent.children;
    } else {
      target = this.model;
    }

    const index = target.indexOf(node);

    if (verbose) {
      return {
        index,
        target,
        node: target[index]
      };
    }

    return index;
  }

  nextNode(node: Node): Node | null {
    const { target, index } = this.index(node, true) as any;
    return target[index + 1] || null;
  }

  nextVisibleNode(node: Node): Node | null {
    if (node.hasChildren() && node.expanded()) {
      return node.first();
    }

    const nextNode = this.nextNode(node);

    if (!nextNode && node.parent) {
      return node.parent.next();
    }

    return nextNode;
  }

  prevNode(node: Node): Node | null {
    const { target, index } = this.index(node, true) as any;
    return target[index - 1] || null;
  }

  prevVisibleNode(node: Node): Node | null {
    const prevNode = this.prevNode(node);

    if (!prevNode) {
      return node.parent;
    }

    if (prevNode.hasChildren() && prevNode.expanded()) {
      return prevNode.last();
    }

    return prevNode;
  }

  // Node manipulation
  addToModel(node: TreeNodeData, index: number = this.model.length): Node {
    const newNode = this.objectToNode(node);

    this.model.splice(index, 0, newNode);
    this.recurseDown([newNode], n => {
      n.tree = this;
    });

    this.emit('node:added', { node: newNode });
    return newNode;
  }

  append(criteria: any, nodeData: TreeNodeData): Node | false {
    const targetNode = this.find(criteria) as Node;

    if (targetNode) {
      return targetNode.append(nodeData) as Node;
    }

    return false;
  }

  prepend(criteria: any, nodeData: TreeNodeData): Node | false {
    const targetNode = this.find(criteria) as Node;

    if (targetNode) {
      return targetNode.prepend(nodeData) as Node;
    }

    return false;
  }

  before(targetNode: any, sourceNode: TreeNodeData): Node | false {
    const target = this.find(targetNode) as Node;
    const position = this.index(target, true) as any;
    const node = this.objectToNode(sourceNode);

    if (position.index === -1) {
      return false;
    }

    position.target.splice(position.index, 0, node);
    node.parent = target.parent;
    
    this.emit('node:added', { node });
    return node;
  }

  after(targetNode: any, sourceNode: TreeNodeData): Node | false {
    const target = this.find(targetNode) as Node;
    const position = this.index(target, true) as any;
    const node = this.objectToNode(sourceNode);

    if (position.index === -1) {
      return false;
    }

    position.target.splice(position.index + 1, 0, node);
    node.parent = target.parent;
    
    this.emit('node:added', { node });
    return node;
  }

  remove(criteria: any): boolean {
    const node = this.find(criteria) as Node;
    
    if (node) {
      return node.remove();
    }
    
    return false;
  }

  // Sorting
  private _sort(source: Node[], compareFn?: SortFn<Node>, deep?: boolean): void {
    if (deep !== false) {
      this.recurseDown(source, node => {
        if (node.hasChildren()) {
          sort(node.children, compareFn);
        }
      });
    }

    sort(source, compareFn);
  }

  sortTree(compareFn?: SortFn<Node>, deep?: boolean): void {
    this._sort(this.model, compareFn, deep);
  }

  sort(query: any, compareFn?: SortFn<Node>, deep?: boolean): void {
    const targetNodes = this.find(query, true) as Node[];

    if (!targetNodes || !compareFn) {
      return;
    }

    targetNodes.forEach(node => {
      this._sort(node.children, compareFn, deep);
    });
  }

  // Async data loading
  loadChildren(node: Node): Promise<any> {
    if (!node) {
      return Promise.resolve();
    }

    this.emit('tree:data:fetch', { node });

    // Set loading state if node has a view model
    if ((node as any).vm) {
      (node as any).vm.loading = true;
    }

    const result = this.fetch(node)
      .then(children => {
        node.append(children);
        node.isBatch = false;

        if (this.options.autoCheckChildren) {
          if (node.checked()) {
            node.recurseDown(child => {
              child.state('checked', true);
            });
          }

          node.refreshIndeterminateState();
        }

        this.emit('tree:data:received', { node });
        return children;
      });

    return Promise.all([
      fetchDelay(this.options.minFetchDelay!),
      result
    ]).then(([, data]) => {
      if ((node as any).vm) {
        (node as any).vm.loading = false;
      }
      return data;
    });
  }

  fetch(node: Node, parseData: boolean = true): Promise<any> {
    if (!this.options.fetchData) {
      return Promise.resolve([]);
    }

    let result: any = (this.options.fetchData as FetchDataFunction)(node);

    // Convert to Promise if it's not already one
    if (!result || typeof result.then !== 'function') {
      result = Promise.resolve(result);
    }

    if (parseData === false) {
      return result;
    }

    return result
      .then((data: any) => {
        try {
          return this.parse(data);
        } catch (e) {
          throw new Error(String(e));
        }
      })
      .catch(this.options.onFetchError!);
  }

  fetchInitData(): Promise<any> {
    // Simulate root node
    const node = new Node(this, {
      id: 'root',
      text: 'root'
    });

    return this.fetch(node, false);
  }

  // Serialization methods for v-model support
  serialize(): TreeNodeData[] {
    return this.model.map(node => this.serializeNode(node));
  }

  private serializeNode(node: Node): TreeNodeData {
    return {
      id: node.id,
      text: node.text,
      data: { ...node.data },
      state: { ...node.states },
      children: node.children.map(child => this.serializeNode(child))
    };
  }

  getSelectedKeys(): Key[] {
    return this.selectedNodes.map(node => node.id);
  }

  getCheckedKeys(): Key[] {
    return this.checkedNodes.map(node => node.id);
  }

  getExpandedKeys(): Key[] {
    const expanded: Key[] = [];
    
    this.recurseDown(node => {
      if (node.expanded()) {
        expanded.push(node.id);
      }
    });
    
    return expanded;
  }

  // Set states by keys (for v-model integration)
  setSelectedKeys(keys: Key[]): void {
    this.unselectAll();
    
    keys.forEach(key => {
      const node = this.find({ id: key }) as Node;
      if (node) {
        this.select(node, true);
      }
    });
  }

  setCheckedKeys(keys: Key[]): void {
    this.uncheckAll();
    
    keys.forEach(key => {
      const node = this.find({ id: key }) as Node;
      if (node) {
        node.check();
      }
    });
  }

  setExpandedKeys(keys: Key[]): void {
    this.collapseAll();
    
    keys.forEach(key => {
      const node = this.find({ id: key }) as Node;
      if (node) {
        node.expand();
      }
    });
  }

  // Model value generation for v-model
  getModelValue(): any {
    if (this.options.checkbox) {
      return this.getCheckedKeys();
    } else {
      return this.options.multiple 
        ? this.getSelectedKeys() 
        : this.getSelectedKeys()[0] || null;
    }
  }

  setModelValue(value: any): void {
    if (this.options.checkbox) {
      this.setCheckedKeys(Array.isArray(value) ? value : []);
    } else {
      const keys = Array.isArray(value) ? value : [value].filter(v => v != null);
      this.setSelectedKeys(keys);
    }
  }
}
