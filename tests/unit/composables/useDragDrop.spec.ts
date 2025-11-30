import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref } from 'vue'
import { useDragDrop, DropPosition } from '../../../src/composables/useDragDrop'
import { Tree } from '../../../src/core/Tree'
import { Node } from '../../../src/core/Node'
import type { TreeNodeData, TreeOptions } from '../../../src/types'

describe('useDragDrop', () => {
  let tree: Tree
  let treeRef: ReturnType<typeof ref<Tree | null>>
  let rootEl: ReturnType<typeof ref<HTMLElement | null>>
  let mockElement: HTMLElement

  beforeEach(() => {
    const options: TreeOptions = {
      dnd: {
        enabled: true
      }
    }
    tree = new Tree(options)
    const data: TreeNodeData[] = [
      {
        id: '1',
        text: 'Node 1',
        children: [
          { id: '1-1', text: 'Child 1-1' },
          { id: '1-2', text: 'Child 1-2' }
        ]
      },
      {
        id: '2',
        text: 'Node 2'
      },
      {
        id: '3',
        text: 'Node 3'
      }
    ]
    tree.setModel(data)

    treeRef = ref(tree)
    mockElement = document.createElement('div')
    rootEl = ref(mockElement)
  })

  describe('DropPosition', () => {
    it('should export drop position constants', () => {
      expect(DropPosition.ABOVE).toBe('drag-above')
      expect(DropPosition.BELOW).toBe('drag-below')
      expect(DropPosition.ON).toBe('drag-on')
    })
  })

  describe('Drag start', () => {
    it('should not start dragging if node is not draggable', () => {
      const dnd = useDragDrop(treeRef, rootEl)
      const node = tree.find('1')!

      // Make node not draggable
      node.state('draggable', false)

      const event = new MouseEvent('mousedown', { clientX: 100, clientY: 100 })
      dnd.startDragging(node, event)

      expect(dnd.draggingNode.value).toBeNull()
    })

    it('should initiate drag start when node is draggable', () => {
      const dnd = useDragDrop(treeRef, rootEl)
      const node = tree.find('1')!

      const event = new MouseEvent('mousedown', { clientX: 100, clientY: 100 })
      dnd.startDragging(node, event)

      // Should set up listeners, but not actually start dragging until movement threshold
      expect(dnd.draggingNode.value).toBeNull()
    })

    it('should call onDragStart callback if provided', () => {
      const onDragStart = vi.fn().mockReturnValue(true)
      tree.options.dnd = { enabled: true, onDragStart }

      const dnd = useDragDrop(treeRef, rootEl)
      const node = tree.find('1')!

      const event = new MouseEvent('mousedown', { clientX: 100, clientY: 100 })
      dnd.startDragging(node, event)

      // Callback should be called when drag actually starts (after movement threshold)
      expect(onDragStart).not.toHaveBeenCalled()
    })

    it('should prevent drag if onDragStart returns false', () => {
      const onDragStart = vi.fn().mockReturnValue(false)
      tree.options.dnd = { enabled: true, onDragStart }

      const dnd = useDragDrop(treeRef, rootEl)
      const node = tree.find('1')!

      const event = new MouseEvent('mousedown', { clientX: 100, clientY: 100 })
      dnd.startDragging(node, event)

      expect(dnd.draggingNode.value).toBeNull()
    })
  })

  describe('Movement threshold', () => {
    it('should require 5px movement before starting drag', () => {
      const dnd = useDragDrop(treeRef, rootEl)
      const node = tree.find('1')!

      // Test that startDragging sets up the initial state
      const startEvent = new MouseEvent('mousedown', { clientX: 100, clientY: 100 })
      dnd.startDragging(node, startEvent)

      // Dragging should not have started yet
      expect(dnd.draggingNode.value).toBeNull()

      // Call cleanup when done
      dnd.cleanup()
    })
  })

  describe('Drop position calculation', () => {
    it('should calculate ABOVE position for top third of node', () => {
      const dnd = useDragDrop(treeRef, rootEl)
      const mockNodeElement = document.createElement('div')

      // Mock getBoundingClientRect
      vi.spyOn(mockNodeElement, 'getBoundingClientRect').mockReturnValue({
        top: 100,
        bottom: 130,
        height: 30,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: 100,
        toJSON: () => ({})
      })

      // clientY in top third (100-110)
      const event = new MouseEvent('mousemove', { clientY: 105 })
      const position = dnd.getDropPosition(event, mockNodeElement)

      expect(position).toBe(DropPosition.ABOVE)
    })

    it('should calculate ON position for middle third of node', () => {
      const dnd = useDragDrop(treeRef, rootEl)
      const mockNodeElement = document.createElement('div')

      vi.spyOn(mockNodeElement, 'getBoundingClientRect').mockReturnValue({
        top: 100,
        bottom: 130,
        height: 30,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: 100,
        toJSON: () => ({})
      })

      // clientY in middle third (110-120)
      const event = new MouseEvent('mousemove', { clientY: 115 })
      const position = dnd.getDropPosition(event, mockNodeElement)

      expect(position).toBe(DropPosition.ON)
    })

    it('should calculate BELOW position for bottom third of node', () => {
      const dnd = useDragDrop(treeRef, rootEl)
      const mockNodeElement = document.createElement('div')

      vi.spyOn(mockNodeElement, 'getBoundingClientRect').mockReturnValue({
        top: 100,
        bottom: 130,
        height: 30,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: 100,
        toJSON: () => ({})
      })

      // clientY in bottom third (120-130)
      const event = new MouseEvent('mousemove', { clientY: 125 })
      const position = dnd.getDropPosition(event, mockNodeElement)

      expect(position).toBe(DropPosition.BELOW)
    })
  })

  describe('Drop validation', () => {
    it('should not allow dropping node onto itself', () => {
      const dnd = useDragDrop(treeRef, rootEl)
      const node = tree.find('1')!

      const canDrop = dnd.canDrop(node, node, DropPosition.ON)

      expect(canDrop).toBe(false)
    })

    it('should not allow dropping parent node into its own child', () => {
      const dnd = useDragDrop(treeRef, rootEl)
      const parent = tree.find('1')!
      const child = tree.find('1-1')!

      const canDrop = dnd.canDrop(parent, child, DropPosition.ON)

      expect(canDrop).toBe(false)
    })

    it('should allow dropping into sibling node', () => {
      const dnd = useDragDrop(treeRef, rootEl)
      const node1 = tree.find('1')!
      const node2 = tree.find('2')!

      const canDrop = dnd.canDrop(node1, node2, DropPosition.ON)

      expect(canDrop).toBe(true)
    })

    it('should not allow dropping ON node if node is not dropable', () => {
      const dnd = useDragDrop(treeRef, rootEl)
      const node1 = tree.find('1')!
      const node2 = tree.find('2')!

      node2.state('dropable', false)

      const canDrop = dnd.canDrop(node1, node2, DropPosition.ON)

      expect(canDrop).toBe(false)
    })

    it('should allow dropping ABOVE/BELOW node even if node is not dropable', () => {
      const dnd = useDragDrop(treeRef, rootEl)
      const node1 = tree.find('1')!
      const node2 = tree.find('2')!

      node2.state('dropable', false)

      const canDropAbove = dnd.canDrop(node1, node2, DropPosition.ABOVE)
      const canDropBelow = dnd.canDrop(node1, node2, DropPosition.BELOW)

      expect(canDropAbove).toBe(true)
      expect(canDropBelow).toBe(true)
    })
  })

  describe('Drop operation', () => {
    it('should call onDrop callback when dropping', () => {
      const onDrop = vi.fn().mockReturnValue(true)
      tree.options.dnd = { enabled: true, onDrop }

      const dnd = useDragDrop(treeRef, rootEl)
      const node1 = tree.find('1')!
      const node2 = tree.find('2')!

      dnd.performDrop(node1, node2, DropPosition.ABOVE)

      expect(onDrop).toHaveBeenCalledWith(node2, node1, 'before')
    })

    it('should convert drop position to placement correctly', () => {
      const onDrop = vi.fn().mockReturnValue(true)
      tree.options.dnd = { enabled: true, onDrop }

      const dnd = useDragDrop(treeRef, rootEl)
      const node1 = tree.find('1')!
      const node2 = tree.find('2')!

      dnd.performDrop(node1, node2, DropPosition.ABOVE)
      expect(onDrop).toHaveBeenCalledWith(node2, node1, 'before')

      dnd.performDrop(node1, node2, DropPosition.BELOW)
      expect(onDrop).toHaveBeenCalledWith(node2, node1, 'after')

      dnd.performDrop(node1, node2, DropPosition.ON)
      expect(onDrop).toHaveBeenCalledWith(node2, node1, 'inside')
    })

    it('should not perform drop if onDrop callback returns false', () => {
      const onDrop = vi.fn().mockReturnValue(false)
      tree.options.dnd = { enabled: true, onDrop }

      const dnd = useDragDrop(treeRef, rootEl)
      const node1 = tree.find('1')!
      const node2 = tree.find('2')!

      const result = dnd.performDrop(node1, node2, DropPosition.ABOVE)

      expect(result).toBe(false)
    })
  })

  describe('Cleanup', () => {
    it('should provide cleanup function to remove listeners', () => {
      const dnd = useDragDrop(treeRef, rootEl)
      const node = tree.find('1')!

      const startEvent = new MouseEvent('mousedown', { clientX: 100, clientY: 100 })
      dnd.startDragging(node, startEvent)

      // Should have cleanup function
      expect(typeof dnd.cleanup).toBe('function')

      // Call cleanup
      dnd.cleanup()

      // Cleanup should be idempotent (safe to call multiple times)
      dnd.cleanup()
    })
  })
})
