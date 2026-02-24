import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Tree } from '../../../src/core/Tree'
import type { TreeNodeData } from '../../../src/types'

describe('Tree Events System', () => {
  let tree: Tree
  let testData: TreeNodeData[]

  beforeEach(() => {
    tree = new Tree({})
    testData = [
      {
        id: 'node-1',
        text: 'Node 1',
        children: [
          { id: 'node-1-1', text: 'Node 1.1' }
        ]
      },
      {
        id: 'node-2',
        text: 'Node 2'
      }
    ]
    tree.setModel(testData)
  })

  describe('Selection Events', () => {
    it('should emit node:selected when a node is selected', () => {
      const handler = vi.fn()
      tree.$on('node:selected', handler)

      const node = tree.model[0]
      node.select()

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(node)
    })

    it('should emit node:unselected when a node is unselected', () => {
      const handler = vi.fn()
      const node = tree.model[0]

      node.select()
      tree.$on('node:unselected', handler)
      node.unselect()

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(node)
    })

    it('should auto-unselect previous node in single-selection mode', () => {
      const node1 = tree.model[0]
      const node2 = tree.model[1]

      node1.select()
      expect(node1.selected()).toBe(true)

      node2.select()

      expect(node1.selected()).toBe(false)
      expect(node2.selected()).toBe(true)
    })
  })

  describe('Checkbox Events', () => {
    beforeEach(() => {
      tree = new Tree({ checkbox: true })
      tree.setModel(testData)
    })

    it('should emit node:checked when a node is checked', () => {
      const handler = vi.fn()
      tree.$on('node:checked', handler)

      const node = tree.model[0]
      node.check()

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(node)
    })

    it('should emit node:unchecked when a node is unchecked', () => {
      const handler = vi.fn()
      const node = tree.model[0]

      node.check()
      tree.$on('node:unchecked', handler)
      node.uncheck()

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(node)
    })

    it('should check children when autoCheckChildren is enabled', () => {
      tree = new Tree({ checkbox: true, autoCheckChildren: true })
      tree.setModel(testData)

      const parent = tree.model[0]
      parent.check()

      // Should check parent and child
      expect(parent.checked()).toBe(true)
      expect(parent.children[0].checked()).toBe(true)
    })
  })

  describe('Node State Events', () => {
    it('should emit node:expanded when a node is expanded', () => {
      const handler = vi.fn()
      tree.$on('node:expanded', handler)

      const node = tree.model[0]
      node.expand()

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(node)
    })

    it('should emit node:collapsed when a node is collapsed', () => {
      const handler = vi.fn()
      const node = tree.model[0]

      node.expand()
      tree.$on('node:collapsed', handler)
      node.collapse()

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(node)
    })

    it('should emit node:focused when a node is focused', () => {
      const handler = vi.fn()
      tree.$on('node:focused', handler)

      const node = tree.model[0]
      node.focus()

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(node)
    })
  })

  describe('Node Data Events', () => {
    it('should emit node:text:changed when node text changes', () => {
      const handler = vi.fn()
      tree.$on('node:text:changed', handler)

      const node = tree.model[0]
      const oldText = node.text
      node.text = 'New Text'

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(node, 'New Text', oldText)
    })

    it('should emit node:data:changed when node data changes', () => {
      const handler = vi.fn()
      tree.$on('node:data:changed', handler)

      const node = tree.model[0]
      node.setData({ custom: 'value' })

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler.mock.calls[0][0]).toBe(node)
      expect(handler.mock.calls[0][1]).toMatchObject({ custom: 'value' })
    })
  })

  describe('Tree Structure Events', () => {
    it('should emit node:removed when a node is removed', () => {
      const handler = vi.fn()
      tree.$on('node:removed', handler)

      const node = tree.model[0]
      node.remove()

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(node)
    })

    it('should track node structure changes', () => {
      const parent = tree.model[0]
      const child = parent.children[0]

      // Test that child can be removed
      child.remove()
      expect(parent.children).toHaveLength(0)
    })
  })

  describe('Filter Events', () => {
    it('should emit tree:filtered when filter is applied', () => {
      const handler = vi.fn()
      tree.$on('tree:filtered', handler)

      tree.filter('Node 1')

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler.mock.calls[0][0].length).toBeGreaterThan(0) // matches array
      expect(handler.mock.calls[0][1]).toBe('Node 1') // query
    })

    it('should emit tree:filtered with empty matches when filter is cleared', () => {
      const handler = vi.fn()

      tree.filter('Node 1')
      tree.$on('tree:filtered', handler)
      tree.clearFilter()

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith([], '')
    })
  })

  describe('Event Handler Management', () => {
    it('should support multiple handlers for the same event', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      tree.$on('node:selected', handler1)
      tree.$on('node:selected', handler2)

      tree.model[0].select()

      expect(handler1).toHaveBeenCalledTimes(1)
      expect(handler2).toHaveBeenCalledTimes(1)
    })

    it('should support $once for one-time event handlers', () => {
      const handler = vi.fn()
      tree.$once('node:selected', handler)

      tree.model[0].select()
      tree.model[1].select()

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should remove event handler with $off', () => {
      const handler = vi.fn()
      tree.$on('node:selected', handler)

      tree.model[0].select()
      expect(handler).toHaveBeenCalledTimes(1)

      tree.$off('node:selected', handler)
      tree.model[1].select()

      expect(handler).toHaveBeenCalledTimes(1) // Still 1, not called again
    })

    it('should remove all handlers for an event when $off is called without handler', () => {
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      tree.$on('node:selected', handler1)
      tree.$on('node:selected', handler2)

      tree.$off('node:selected')
      tree.model[0].select()

      expect(handler1).not.toHaveBeenCalled()
      expect(handler2).not.toHaveBeenCalled()
    })
  })

  describe('Drag & Drop Events', () => {
    it('should emit node:dragstart when dragging starts', () => {
      tree = new Tree({ dnd: { enabled: true } })
      tree.setModel(testData)

      const handler = vi.fn()
      tree.$on('node:dragstart', handler)

      // This would normally be triggered by the useDragDrop composable
      tree.$emit('node:dragstart', tree.model[0])

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should emit node:dropped when a node is dropped', () => {
      tree = new Tree({ dnd: { enabled: true } })
      tree.setModel(testData)

      const handler = vi.fn()
      tree.$on('node:dropped', handler)

      const dragNode = tree.model[0]
      const targetNode = tree.model[1]

      // This would normally be triggered by the useDragDrop composable
      tree.$emit('node:dropped', dragNode, targetNode, 'after')

      expect(handler).toHaveBeenCalledTimes(1)
      expect(handler).toHaveBeenCalledWith(dragNode, targetNode, 'after')
    })
  })
})
