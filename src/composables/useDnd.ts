/**
 * useDnd composable - Replaces DndMixin from Vue 2
 * Provides drag and drop functionality for tree nodes
 */

import { ref, reactive, onMounted, onUnmounted } from 'vue';
import type { Tree, Node } from '../core';

// Drop position constants
export const DropPosition = {
  ABOVE: 'drag-above',
  BELOW: 'drag-below',
  ON: 'drag-on'
} as const;

export type DropPositionType = typeof DropPosition[keyof typeof DropPosition];

// DnD options interface
export interface DndOptions {
  onDragStart?: (node: Node) => boolean | void;
  onDragOn?: (sourceNode: Node, targetNode: Node, position: DropPositionType) => boolean | void;
  onDragFinish?: (sourceNode: Node, targetNode: Node, position: DropPositionType) => boolean | void;
}

// Emit function type
type EmitFn = (event: string, ...args: any[]) => void;

// Draggable node interface
interface DraggableNodeState {
  node: Node;
  left: number;
  top: number;
}

// Helper functions
function isMovingStarted(event: MouseEvent, start: [number, number]): boolean {
  return Math.abs(event.clientX - start[0]) > 5 || Math.abs(event.clientY - start[1]) > 5;
}

function composedPath(event: Event): EventTarget[] {
  let el = event.target as Element | null;
  const path: EventTarget[] = [];

  while (el) {
    path.push(el);

    if (el.tagName === 'HTML') {
      path.push(document);
      path.push(window);
      return path;
    }

    el = el.parentElement;
  }

  return path;
}

function getPath(event: Event): EventTarget[] {
  if ('path' in event && Array.isArray(event.path)) {
    return event.path;
  }

  if ('composedPath' in event && typeof event.composedPath === 'function') {
    return event.composedPath();
  }

  return composedPath(event);
}

function getSelectedNode(event: Event): Element | null {
  let className: string;
  let i = 0;

  const path = getPath(event);

  for (; i < path.length; i++) {
    const element = path[i] as Element;
    className = element.className || '';

    if (/tree-node/.test(className)) {
      return element;
    }
  }

  return null;
}

function getDropDestination(event: Event): Element | null {
  const selectedNode = getSelectedNode(event);

  if (!selectedNode) {
    return null;
  }

  return selectedNode;
}

function updateHelperClasses(target: Element | null, classes?: string | null): void {
  if (!target) {
    return;
  }

  let className = target.className;

  if (!classes) {
    // Remove all drop position classes
    for (const key in DropPosition) {
      className = className.replace(DropPosition[key as keyof typeof DropPosition], '');
    }
    className = className.replace('dragging', '');
  } else if (!new RegExp(classes).test(className)) {
    className += ' ' + classes;
  }

  target.className = className.replace(/\s+/g, ' ').trim();
}

function getDropPosition(event: MouseEvent, element: Element): DropPositionType {
  const coords = element.getBoundingClientRect();
  const nodeSection = coords.height / 3;

  let dropPosition: DropPositionType = DropPosition.ON;

  if (coords.top + nodeSection >= event.clientY) {
    dropPosition = DropPosition.ABOVE;
  } else if (coords.top + nodeSection * 2 <= event.clientY) {
    dropPosition = DropPosition.BELOW;
  }

  return dropPosition;
}

function callDndCallback(
  args: [Node, Node?, DropPositionType?], 
  options: DndOptions | undefined, 
  method: keyof DndOptions
): boolean {
  if (!options || !options[method] || typeof options[method] !== 'function') {
    return true;
  }

  const callback = options[method] as Function;
  return callback(...args) !== false;
}

function clearDropClasses(parent: Element): void {
  for (const key in DropPosition) {
    const elements = parent.querySelectorAll(`.${DropPosition[key as keyof typeof DropPosition]}`);

    for (let i = 0; i < elements.length; i++) {
      updateHelperClasses(elements[i]);
    }
  }
}

export function useDnd(
  tree: any, // Accept reactive tree ref
  treeOptions: any, // Tree options
  emit: EmitFn,
  rootElement?: HTMLElement
) {
  // Reactive state - simplified for now
  const draggableNode = ref<DraggableNodeState | null>(null);
  const isDragging = ref(false);

  // Drag start handler - simple implementation
  const onDragStart = (event: Event) => {
    event.preventDefault();
  };

  // Initialize dragging for a node - simplified
  const startDragging = (node: any, event: MouseEvent) => {
    // For now, just emit an event - full DnD will be implemented later
    emit('drag:start', { node, event });
  };

  // Cleanup function
  const cleanup = () => {
    draggableNode.value = null;
    isDragging.value = false;
  };

  onUnmounted(() => {
    cleanup();
  });

  return {
    // State
    draggableNode,
    isDragging,

    // Methods
    onDragStart,
    startDragging,
    cleanup,

    // Constants
    DropPosition
  };
}
