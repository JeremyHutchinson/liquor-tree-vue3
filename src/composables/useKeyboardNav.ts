import { type Ref, onMounted, onUnmounted } from 'vue'
import type { Tree } from '../core/Tree'
import type { Node } from '../core/Node'

/**
 * Keyboard navigation composable for tree component
 * Handles arrow keys, Enter, Space for navigation and interaction
 */
export function useKeyboardNav(tree: Ref<Tree | null>, rootElement: Ref<HTMLElement | null>) {
  /**
   * Navigate to previous visible node
   */
  function focusUp(currentNode: Node): void {
    const prevNode = tree.value?.prevVisibleNode(currentNode)

    if (!prevNode) {
      return
    }

    if (prevNode.disabled()) {
      return focusUp(prevNode)
    }

    prevNode.focus()
  }

  /**
   * Navigate to next visible node
   */
  function focusDown(currentNode: Node): void {
    const nextNode = tree.value?.nextVisibleNode(currentNode)

    if (!nextNode) {
      return
    }

    if (nextNode.disabled()) {
      return focusDown(nextNode)
    }

    nextNode.focus()
  }

  /**
   * Handle left arrow key - collapse or go to parent
   */
  function leftArrow(node: Node): void {
    if (node.expanded()) {
      node.collapse()
    } else {
      const parent = node.parent

      if (parent) {
        parent.focus()
      }
    }
  }

  /**
   * Handle right arrow key - expand or go to first child
   */
  function rightArrow(node: Node): void {
    if (node.collapsed() && (node.hasChildren() || node.isBatch)) {
      node.expand()
    } else if (node.expanded()) {
      const first = node.first()

      if (first) {
        first.focus()
      }
    }
  }

  /**
   * Toggle checkbox state for node
   */
  function checkNode(node: Node): void {
    if (!tree.value?.options.checkbox) {
      return
    }

    if (node.checked()) {
      node.uncheck()
    } else {
      node.check()
    }
  }

  /**
   * Handle keyboard events
   */
  function handleKeyDown(event: KeyboardEvent): void {
    // Respect keyboardNavigation: false option
    if (tree.value?.options.keyboardNavigation === false) {
      return
    }

    const node = tree.value?.activeElement

    if (!node || !tree.value?.isNode(node)) {
      return
    }

    // Don't handle navigation keys when node is being edited
    if (node.isEditing) {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        node.stopEditing(false)
      }
      return
    }

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault()
        event.stopPropagation()
        focusUp(node)
        break
      case 'ArrowDown':
        event.preventDefault()
        event.stopPropagation()
        focusDown(node)
        break
      case 'ArrowLeft':
        event.preventDefault()
        event.stopPropagation()
        leftArrow(node)
        break
      case 'ArrowRight':
        event.preventDefault()
        event.stopPropagation()
        rightArrow(node)
        break
      case ' ':
      case 'Enter':
        if (tree.value?.options.checkbox) {
          event.preventDefault()
          event.stopPropagation()
          checkNode(node)
        }
        break
      case 'F2':
        if (tree.value?.options.editing !== false) {
          event.preventDefault()
          event.stopPropagation()
          node.startEditing()
        }
        break
    }
  }

  // Set up event listener when mounted
  onMounted(() => {
    if (rootElement.value) {
      rootElement.value.addEventListener('keydown', handleKeyDown, true)
    }
  })

  // Clean up event listener when unmounted
  onUnmounted(() => {
    if (rootElement.value) {
      rootElement.value.removeEventListener('keydown', handleKeyDown, true)
    }
  })

  return {
    handleKeyDown,
    focusUp,
    focusDown,
    leftArrow,
    rightArrow,
    checkNode
  }
}
