import { ref, type Ref } from 'vue'
import type { Tree } from '../core/Tree'
import type { Node } from '../core/Node'
import type { DropPlacement } from '../types'

/**
 * Drop position constants (CSS classes)
 */
export const DropPosition = {
  ABOVE: 'drag-above',
  BELOW: 'drag-below',
  ON: 'drag-on'
} as const

export type DropPositionType = typeof DropPosition[keyof typeof DropPosition]

/**
 * Check if mouse has moved beyond threshold to start dragging
 */
function isMovingStarted(event: MouseEvent, start: [number, number]): boolean {
  return Math.abs(event.clientX - start[0]) > 5 || Math.abs(event.clientY - start[1]) > 5
}

/**
 * Get the tree node element from event path
 */
function getSelectedNode(event: MouseEvent): HTMLElement | null {
  let target = event.target as HTMLElement | null

  while (target) {
    if (target.classList?.contains('tree-node')) {
      return target
    }
    target = target.parentElement
  }

  return null
}

/**
 * Update helper CSS classes on element
 */
function updateHelperClasses(target: HTMLElement | null, className?: string): void {
  if (!target) {
    return
  }

  // Remove all drop position classes
  if (!className) {
    target.classList.remove(
      DropPosition.ABOVE,
      DropPosition.BELOW,
      DropPosition.ON,
      'dragging'
    )
  } else {
    target.classList.add(className)
  }
}

/**
 * Clear all drop position classes from parent element
 */
function clearDropClasses(parent: HTMLElement): void {
  const elements = parent.querySelectorAll(
    `.${DropPosition.ABOVE}, .${DropPosition.BELOW}, .${DropPosition.ON}`
  )
  elements.forEach((el) => updateHelperClasses(el as HTMLElement))
}

/**
 * Drag & Drop composable for tree nodes
 */
export function useDragDrop(tree: Ref<Tree | null>, rootElement: Ref<HTMLElement | null>) {
  const draggingNode = ref<Node | null>(null)
  const dragStartPosition = ref<[number, number] | null>(null)
  const possibleDragNode = ref<Node | null>(null)
  const dropDestination = ref<Node | null>(null)
  const currentDropPosition = ref<DropPositionType | null>(null)

  /**
   * Calculate drop position based on mouse Y coordinate
   * Divides node into thirds: top = ABOVE, middle = ON, bottom = BELOW
   */
  function getDropPosition(event: MouseEvent, element: HTMLElement): DropPositionType {
    const coords = element.getBoundingClientRect()
    const nodeSection = coords.height / 3

    if (coords.top + nodeSection >= event.clientY) {
      return DropPosition.ABOVE
    } else if (coords.top + nodeSection * 2 <= event.clientY) {
      return DropPosition.BELOW
    }

    return DropPosition.ON
  }

  /**
   * Check if drag node can be dropped on target node
   */
  function canDrop(
    dragNode: Node,
    targetNode: Node,
    position: DropPositionType
  ): boolean {
    // Cannot drop on itself
    if (dragNode === targetNode) {
      return false
    }

    // Cannot drop parent into its own children
    const targetPath = targetNode.getPath()
    if (targetPath.includes(dragNode)) {
      return false
    }

    // For ON position, check if target is dropable
    if (position === DropPosition.ON && !targetNode.isDropable()) {
      return false
    }

    // ABOVE and BELOW are always allowed (unless dropping on self or descendant)
    return true
  }

  /**
   * Convert drop position to placement type for callbacks
   */
  function positionToPlacement(position: DropPositionType): DropPlacement {
    if (position === DropPosition.ABOVE) {
      return 'before'
    } else if (position === DropPosition.BELOW) {
      return 'after'
    }
    return 'inside'
  }

  /**
   * Perform the drop operation
   */
  function performDrop(
    dragNode: Node,
    targetNode: Node,
    position: DropPositionType
  ): boolean {
    const placement = positionToPlacement(position)
    const dndOptions = tree.value?.options.dnd

    // Call onDrop callback if provided
    if (dndOptions && typeof dndOptions !== 'boolean' && dndOptions.onDrop) {
      const result = dndOptions.onDrop(targetNode, dragNode, placement)
      if (result === false) {
        return false
      }
    }

    // Perform the actual tree manipulation
    if (placement === 'before') {
      targetNode.insertBefore(dragNode)
    } else if (placement === 'after') {
      targetNode.insertAfter(dragNode)
    } else if (placement === 'inside') {
      targetNode.append(dragNode)
    }

    // Emit drop event
    tree.value?.$emit('node:dropped', dragNode, targetNode, placement)

    return true
  }

  /**
   * Handle mouse up - finish dragging
   */
  function onMouseUp(event: MouseEvent): void {
    // If drag was started
    if (draggingNode.value && dropDestination.value && currentDropPosition.value) {
      const targetElement = getSelectedNode(event)
      if (targetElement) {
        updateHelperClasses(targetElement, undefined)
      }

      // Perform the drop
      performDrop(draggingNode.value, dropDestination.value, currentDropPosition.value)

      draggingNode.value.state('dragging', false)
    }

    // Reset state
    dragStartPosition.value = null
    possibleDragNode.value = null
    draggingNode.value = null
    dropDestination.value = null
    currentDropPosition.value = null

    // Remove listeners
    window.removeEventListener('mousemove', onMouseMove, true)
    window.removeEventListener('mouseup', onMouseUp, true)
  }

  /**
   * Handle mouse move - update drag position and drop target
   */
  function onMouseMove(event: MouseEvent): void {
    // Check if movement threshold is met
    if (dragStartPosition.value && !isMovingStarted(event, dragStartPosition.value)) {
      return
    }

    // Start dragging if we haven't yet
    if (possibleDragNode.value && !draggingNode.value) {
      const node = possibleDragNode.value
      dragStartPosition.value = null
      possibleDragNode.value = null

      // Call onDragStart callback if provided
      const dndOptions = tree.value?.options.dnd
      if (dndOptions && typeof dndOptions !== 'boolean' && dndOptions.onDragStart) {
        const result = dndOptions.onDragStart(node, event as any)
        if (result === false) {
          window.removeEventListener('mousemove', onMouseMove, true)
          window.removeEventListener('mouseup', onMouseUp, true)
          return
        }
      }

      draggingNode.value = node
      node.state('dragging', true)
      tree.value?.$emit('node:dragstart', node)
    }

    if (!draggingNode.value) {
      return
    }

    // Find drop destination
    const targetElement = getSelectedNode(event)

    // Clear previous drop classes
    if (rootElement.value) {
      clearDropClasses(rootElement.value)
    }

    if (!targetElement) {
      dropDestination.value = null
      currentDropPosition.value = null
      return
    }

    const targetId = targetElement.getAttribute('data-id')
    if (!targetId) {
      return
    }

    // Don't process if hovering over self
    if (draggingNode.value.id === targetId) {
      return
    }

    // Find target node
    const targetNode = tree.value?.find(targetId)
    if (!targetNode) {
      return
    }

    dropDestination.value = targetNode

    // Calculate drop position
    const position = getDropPosition(event, targetElement)

    // Validate drop
    if (!canDrop(draggingNode.value, targetNode, position)) {
      currentDropPosition.value = null
      return
    }

    currentDropPosition.value = position

    // Add visual feedback
    updateHelperClasses(targetElement, position)
  }

  /**
   * Start dragging a node
   */
  function startDragging(node: Node, event: MouseEvent): void {
    // Check if drag is enabled
    const dndOptions = tree.value?.options.dnd
    if (!dndOptions) {
      return
    }

    // Check if node is draggable
    if (!node.isDraggable()) {
      return
    }

    // Store initial drag position
    dragStartPosition.value = [event.clientX, event.clientY]
    possibleDragNode.value = node

    // Add event listeners
    window.addEventListener('mousemove', onMouseMove, true)
    window.addEventListener('mouseup', onMouseUp, true)
  }

  /**
   * Cleanup function to remove event listeners
   */
  function cleanup(): void {
    window.removeEventListener('mousemove', onMouseMove, true)
    window.removeEventListener('mouseup', onMouseUp, true)
  }

  return {
    draggingNode,
    dropDestination,
    startDragging,
    getDropPosition,
    canDrop,
    performDrop,
    cleanup
  }
}
