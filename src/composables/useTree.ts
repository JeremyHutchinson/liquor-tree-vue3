/**
 * useTree composable - Replaces TreeMixin from Vue 2
 * Provides tree instance management, model synchronization, and event bridging
 */

import { 
  ref, 
  reactive, 
  computed, 
  watch, 
  onMounted, 
  onUnmounted,
  nextTick,
  type Ref 
} from 'vue';
import { Tree, type TreeOptions, type TreeNodeData, type Key, Node } from '../core';
import initKeyboardNavigation from '../utils/keyboardNavigation';
import assert from '../utils/assert';

// Composable options interface
export interface UseTreeOptions extends Omit<TreeOptions, 'store'> {
  // Additional composable-specific options with extended store type
  store?: {
    store: any;
    mutations?: string[];
    getter: () => TreeNodeData[];
    dispatcher: (data: any) => void;
  };
}

// Emit function type for Vue component
type EmitFn = (event: string, ...args: any[]) => void;

// Props interface (what the component should pass)
export interface TreeProps {
  data?: TreeNodeData[] | Promise<TreeNodeData[]>;
  modelValue?: any;
  value?: any; // legacy v-model support
  options?: UseTreeOptions;
  filter?: string;
}

export function useTree(props: TreeProps, emit: EmitFn) {
  // Reactive state
  const treeInstance = ref<Tree | null>(null);
  const model = ref<Node[]>([]);
  const loading = ref(false);
  const matches = ref<Node[]>([]);
  
  // Merge options with defaults
  const opts = reactive<UseTreeOptions>({
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
    },
    ...props.options
  });

  // Computed properties
  const visibleModel = computed(() => {
    return model.value.filter(node => node && node.visible());
  });

  const visibleMatches = computed(() => {
    return matches.value.filter(node => node && node.visible());
  });

  // Initialize tree instance
  const initializeTree = () => {
    if (!treeInstance.value) {
      treeInstance.value = new Tree(opts);
    }
    return treeInstance.value;
  };

  // Event initialization - bridges internal mitt events to Vue component events
  const initEvents = (tree: Tree) => {
    const { multiple, checkbox } = opts;

    // Model value emitter for v-model support
    const emitModelValue = () => {
      const selected = tree.selected();
      const checked = tree.checked();

      // Vue 3 v-model (modelValue)
      if (!checkbox) {
        const value = multiple ? selected.toArray() : (selected.first() || null);
        emit('update:modelValue', value);
      } else {
        emit('update:modelValue', {
          selected: multiple ? selected.toArray() : (selected.first() || null),
          checked: checked?.toArray() || []
        });
      }

      // Legacy v-model support (input event)
      if (!checkbox) {
        const value = multiple ? selected.toArray() : (selected.first() || null);
        emit('input', value);
      } else {
        emit('input', {
          selected: multiple ? selected.toArray() : (selected.first() || null),
          checked: checked?.toArray() || []
        });
      }

      // Selection change event
      emit('selection:change', {
        selected: selected.toArray(),
        node: selected.first()
      });
    };

    // Initial emit
    emitModelValue();

    // Bridge internal events to component events
    tree.on('node:selected', (payload) => {
      emit('node:selected', payload);
      emitModelValue();
    });

    tree.on('node:unselected', (payload) => {
      emit('node:unselected', payload);
      emitModelValue();
    });

    tree.on('node:checked', (payload) => {
      emit('node:checked', payload);
      if (checkbox) emitModelValue();
    });

    tree.on('node:unchecked', (payload) => {
      emit('node:unchecked', payload);
      if (checkbox) emitModelValue();
    });

    tree.on('node:expand', (payload) => {
      emit('node:expand', payload);
      emit('node:toggle', payload);
    });

    tree.on('node:collapse', (payload) => {
      emit('node:collapse', payload);
      emit('node:toggle', payload);
    });

    tree.on('node:added', (payload) => {
      const { node } = payload;
      
      if (checkbox) {
        if (node.checked() && tree.checkedNodes.indexOf(node) === -1) {
          tree.check(node);
        }
        node.refreshIndeterminateState();
      }

      if (node.selected() && tree.selectedNodes.indexOf(node) === -1) {
        tree.select(node);
      }

      emit('node:added', payload);
      emitModelValue();
    });

    tree.on('node:removed', (payload) => {
      emit('node:removed', payload);
      emitModelValue();
    });

    tree.on('tree:filtered', (payload) => {
      matches.value = payload.matches;
      emit('tree:filtered', payload);
    });

    tree.on('tree:data:fetch', (payload) => {
      emit('tree:data:fetch', payload);
    });

    tree.on('tree:data:received', (payload) => {
      emit('tree:data:received', payload);
    });
  };

  // Store connection (Vuex/Pinia integration)
  const connectStore = (storeConfig: NonNullable<UseTreeOptions['store']>) => {
    const { store: Store, mutations, getter, dispatcher } = storeConfig;

    assert(typeof getter === 'function', '`getter` must be a function');
    assert(typeof dispatcher === 'function', '`dispatcher` must be a function');

    if (mutations !== undefined) {
      assert(Array.isArray(mutations), '`mutations` must be an array');
    }

    Store.subscribe((action: any, state: any) => {
      if (!mutations) {
        setModel(getter());
      } else if (mutations.includes(action.type)) {
        setModel(getter());
      }
    });

    setModel(getter());

    // Listen for internal changes and dispatch to store
    treeInstance.value?.on('selection:change', () => {
      nextTick(() => {
        dispatcher(toJSON());
      });
    });
  };

  // Data loading and model management
  const loadData = async () => {
    const tree = initializeTree();
    let dataProvider: Promise<TreeNodeData[]>;

    if (!props.data && opts.fetchData) {
      // Get initial data if we don't have data directly
      dataProvider = tree.fetchInitData();
    } else if (props.data && typeof (props.data as any).then === 'function') {
      // Handle Promise data
      dataProvider = props.data as Promise<TreeNodeData[]>;
      loading.value = true;
    } else {
      // Handle direct data
      dataProvider = Promise.resolve((props.data as TreeNodeData[]) || []);
    }

    try {
      const data = await dataProvider;

      if (opts.store) {
        connectStore(opts.store);
      } else {
        await tree.setModel(data || []);
        model.value = tree.model;
      }

      if (loading.value) {
        loading.value = false;
      }

      emit('tree:mounted', tree);
      initEvents(tree);
    } catch (error) {
      loading.value = false;
      opts.onFetchError?.(error);
    }
  };

  // Public API methods (exposed to component)
  const setModel = async (data: TreeNodeData[]) => {
    const tree = treeInstance.value;
    if (tree) {
      await tree.setModel(data);
      model.value = tree.model;
    }
  };

  const recurseDown = (fn: (node: Node) => void) => {
    treeInstance.value?.recurseDown(fn);
  };

  const selected = () => {
    return treeInstance.value?.selected() || null;
  };

  const checked = () => {
    return treeInstance.value?.checked() || null;
  };

  const append = (criteria: any, node?: TreeNodeData) => {
    if (!node) {
      return treeInstance.value?.addToModel(criteria, treeInstance.value.model.length);
    }
    return treeInstance.value?.append(criteria, node);
  };

  const prepend = (criteria: any, node?: TreeNodeData) => {
    if (!node) {
      return treeInstance.value?.addToModel(criteria, 0);
    }
    return treeInstance.value?.prepend(criteria, node);
  };

  const addChild = (criteria: any, node: TreeNodeData) => {
    return append(criteria, node);
  };

  const remove = (criteria: any) => {
    return treeInstance.value?.remove(criteria);
  };

  const before = (criteria: any, node?: TreeNodeData) => {
    if (!node) {
      return prepend(criteria);
    }
    return treeInstance.value?.before(criteria, node);
  };

  const after = (criteria: any, node?: TreeNodeData) => {
    if (!node) {
      return append(criteria);
    }
    return treeInstance.value?.after(criteria, node);
  };

  const find = (criteria: any, multiple?: boolean) => {
    return treeInstance.value?.find(criteria, multiple);
  };

  const findAll = (criteria: any) => {
    return treeInstance.value?.find(criteria, true);
  };

  const expandAll = () => {
    return treeInstance.value?.expandAll();
  };

  const collapseAll = () => {
    return treeInstance.value?.collapseAll();
  };

  const sortTree = (compareFn?: (a: Node, b: Node) => number, deep?: boolean) => {
    return treeInstance.value?.sortTree(compareFn, deep);
  };

  const sort = (compareFn?: (a: Node, b: Node) => number, deep?: boolean) => {
    return treeInstance.value?.sort(compareFn, deep);
  };

  const getRootNode = () => {
    if (!treeInstance.value) return null;
    return treeInstance.value.model.length === 1
      ? treeInstance.value.model[0]
      : treeInstance.value.model;
  };

  const toJSON = () => {
    return JSON.parse(JSON.stringify(model.value));
  };

  // Filter functionality
  const filterTree = (query?: string) => {
    if (treeInstance.value) {
      return treeInstance.value.filter(query);
    }
    return [];
  };

  // Watchers
  watch(() => props.data, () => {
    if (treeInstance.value && props.data) {
      loadData();
    }
  }, { deep: true });

  watch(() => props.filter, (newFilter) => {
    filterTree(newFilter);
  });

  watch(() => props.modelValue, (newValue) => {
    if (treeInstance.value && newValue !== undefined) {
      treeInstance.value.setModelValue(newValue);
    }
  }, { deep: true });

  // Legacy v-model support
  watch(() => props.value, (newValue) => {
    if (treeInstance.value && newValue !== undefined && props.modelValue === undefined) {
      treeInstance.value.setModelValue(newValue);
    }
  }, { deep: true });

  // Lifecycle hooks
  onMounted(async () => {
    await loadData();

    // Initialize keyboard navigation
    if (opts.keyboardNavigation !== false && treeInstance.value) {
      initKeyboardNavigation(treeInstance.value);
    }
  });

  onUnmounted(() => {
    // Cleanup event listeners if needed
    treeInstance.value?.off('node:selected');
    treeInstance.value?.off('node:unselected');
    // ... other cleanup
  });

  // Return reactive state and methods for the component
  return {
    // Reactive state
    tree: treeInstance,
    model,
    loading,
    matches,
    treeOptions: opts,
    visibleModel,
    visibleMatches,

    // Additional computed values for component compatibility
    selectedNodes: computed(() => treeInstance.value?.selectedNodes || []),
    checkedNodes: computed(() => treeInstance.value?.checkedNodes || []),

    // Methods
    setModel,
    recurseDown,
    selected,
    checked,
    append,
    prepend,
    addChild,
    remove,
    before,
    after,
    find,
    findAll,
    expandAll,
    collapseAll,
    sortTree,
    sort,
    getRootNode,
    toJSON,
    filter: filterTree
  };
}