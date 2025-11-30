import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ref, type Ref } from 'vue'
import { useKeyboardNav } from '../../../src/composables/useKeyboardNav.ts'
import { Tree } from '../../../src/core/Tree'
import type { TreeOptions, TreeNodeData } from '../../../src/types'

describe('useKeyboardNav', () => {
  let tree: Tree
  let rootEl: Ref<HTMLDivElement | null>
  const sampleData: TreeNodeData[] = [
    {
      id: '1',
      text: 'Node 1',
      children: [
        { id: '1-1', text: 'Node 1-1' },
        { id: '1-2', text: 'Node 1-2' }
      ]
    },
    {
      id: '2',
      text: 'Node 2',
      children: [
        { id: '2-1', text: 'Node 2-1' }
      ]
    },
    { id: '3', text: 'Node 3' }
  ]

  beforeEach(() => {
    const options: TreeOptions = {}
    tree = new Tree(options)
    tree.setModel(sampleData)
    const el = document.createElement('div')
    document.body.appendChild(el)
    rootEl = ref(el)
  })

  describe('ArrowDown - Navigate down', () => {
    it('should move focus to next visible node', () => {
      const treeRef = ref(tree)
      const { handleKeyDown } = useKeyboardNav(treeRef, rootEl)

      // Set activeElement to first node
      const node1 = tree.find('1')!
      tree.activeElement = node1

      // Simulate ArrowDown
      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() })

      handleKeyDown(event)

      // Should focus on next visible node (which is node 2 since node 1's children are collapsed)
      expect(tree.activeElement?.id).toBe('2')
    })

    it('should skip disabled nodes', () => {
      const treeRef = ref(tree)
      const { handleKeyDown } = useKeyboardNav(treeRef, rootEl)

      const node1 = tree.find('1')!
      const node2 = tree.find('2')!
      const node3 = tree.find('3')!

      tree.activeElement = node1
      node2.state('disabled', true)

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() })

      handleKeyDown(event)

      // Should skip node2 (disabled) and go to node3
      expect(tree.activeElement?.id).toBe('3')
    })

    it('should include children when parent is expanded', () => {
      const treeRef = ref(tree)
      const { handleKeyDown } = useKeyboardNav(treeRef, rootEl)

      const node1 = tree.find('1')!
      node1.expand()
      tree.activeElement = node1

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() })

      handleKeyDown(event)

      // Should go to first child
      expect(tree.activeElement?.id).toBe('1-1')
    })
  })

  describe('ArrowUp - Navigate up', () => {
    it('should move focus to previous visible node', () => {
      const treeRef = ref(tree)
      const { handleKeyDown } = useKeyboardNav(treeRef, rootEl)

      const node2 = tree.find('2')!
      tree.activeElement = node2

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() })

      handleKeyDown(event)

      expect(tree.activeElement?.id).toBe('1')
    })

    it('should skip disabled nodes going up', () => {
      const treeRef = ref(tree)
      const { handleKeyDown } = useKeyboardNav(treeRef, rootEl)

      const node1 = tree.find('1')!
      const node2 = tree.find('2')!
      const node3 = tree.find('3')!

      tree.activeElement = node3
      node2.state('disabled', true)

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() })

      handleKeyDown(event)

      // Should skip node2 (disabled) and go to node1
      expect(tree.activeElement?.id).toBe('1')
    })
  })

  describe('ArrowLeft - Collapse or go to parent', () => {
    it('should collapse expanded node', () => {
      const treeRef = ref(tree)
      const { handleKeyDown } = useKeyboardNav(treeRef, rootEl)

      const node1 = tree.find('1')!
      node1.expand()
      tree.activeElement = node1

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() })

      handleKeyDown(event)

      expect(node1.expanded()).toBe(false)
    })

    it('should focus parent if node is collapsed', () => {
      const treeRef = ref(tree)
      const { handleKeyDown } = useKeyboardNav(treeRef, rootEl)

      const node1 = tree.find('1')!
      const child = tree.find('1-1')!
      node1.expand()
      tree.activeElement = child

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() })

      handleKeyDown(event)

      expect(tree.activeElement?.id).toBe('1')
    })
  })

  describe('ArrowRight - Expand or go to first child', () => {
    it('should expand collapsed node with children', () => {
      const treeRef = ref(tree)
      const { handleKeyDown } = useKeyboardNav(treeRef, rootEl)

      const node1 = tree.find('1')!
      tree.activeElement = node1

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() })

      handleKeyDown(event)

      expect(node1.expanded()).toBe(true)
    })

    it('should focus first child if node is already expanded', () => {
      const treeRef = ref(tree)
      const { handleKeyDown } = useKeyboardNav(treeRef, rootEl)

      const node1 = tree.find('1')!
      node1.expand()
      tree.activeElement = node1

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() })

      handleKeyDown(event)

      expect(tree.activeElement?.id).toBe('1-1')
    })

    it('should do nothing for leaf nodes', () => {
      const treeRef = ref(tree)
      const { handleKeyDown } = useKeyboardNav(treeRef, rootEl)

      const node3 = tree.find('3')!
      tree.activeElement = node3

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() })

      handleKeyDown(event)

      expect(tree.activeElement?.id).toBe('3')
    })
  })

  describe('Enter and Space - Check/uncheck node', () => {
    it('should check unchecked node when Enter is pressed', () => {
      const options: TreeOptions = { checkbox: true }
      const checkboxTree = new Tree(options)
      checkboxTree.setModel(sampleData)

      const treeRef = ref(checkboxTree)
      const { handleKeyDown, checkNode } = useKeyboardNav(treeRef, rootEl)

      const node1 = checkboxTree.find('1')!
      checkboxTree.activeElement = node1

      // Test calling checkNode directly first
      checkNode(node1)

      // Reset for actual test
      if (node1.checked()) {
        node1.uncheck()
      }

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() })

      handleKeyDown(event)

      expect(node1.checked()).toBe(true)
    })

    it('should uncheck checked node when Space is pressed', () => {
      const options: TreeOptions = { checkbox: true }
      const checkboxTree = new Tree(options)
      checkboxTree.setModel(sampleData)

      const treeRef = ref(checkboxTree)
      const { handleKeyDown } = useKeyboardNav(treeRef, rootEl)

      const node1 = checkboxTree.find('1')!
      node1.check()
      checkboxTree.activeElement = node1

      const event = new KeyboardEvent('keydown', { key: ' ' }) // Space key
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() })

      handleKeyDown(event)

      expect(node1.checked()).toBe(false)
    })

    it('should do nothing if checkbox is not enabled', () => {
      const treeRef = ref(tree)
      const { handleKeyDown } = useKeyboardNav(treeRef, rootEl)

      const node1 = tree.find('1')!
      tree.activeElement = node1

      const event = new KeyboardEvent('keydown', { key: 'Enter' })
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() })

      handleKeyDown(event)

      expect(node1.checked()).toBe(false)
    })
  })

  describe('Event handling', () => {
    it('should prevent default for arrow keys', () => {
      const treeRef = ref(tree)
      const { handleKeyDown } = useKeyboardNav(treeRef, rootEl)

      const node1 = tree.find('1')!
      tree.activeElement = node1

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      const preventDefaultSpy = vi.fn()
      Object.defineProperty(event, 'preventDefault', { value: preventDefaultSpy })

      handleKeyDown(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })

    it('should stop propagation for handled keys', () => {
      const treeRef = ref(tree)
      const { handleKeyDown } = useKeyboardNav(treeRef, rootEl)

      const node1 = tree.find('1')!
      tree.activeElement = node1

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      const stopPropagationSpy = vi.fn()
      Object.defineProperty(event, 'preventDefault', { value: vi.fn() })
      Object.defineProperty(event, 'stopPropagation', { value: stopPropagationSpy })

      handleKeyDown(event)

      expect(stopPropagationSpy).toHaveBeenCalled()
    })

    it('should not handle keys when no active element', () => {
      const treeRef = ref(tree)
      const { handleKeyDown } = useKeyboardNav(treeRef, rootEl)

      tree.activeElement = null

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      const preventDefaultSpy = vi.fn()
      Object.defineProperty(event, 'preventDefault', { value: preventDefaultSpy })

      handleKeyDown(event)

      // Should not prevent default when there's no active element
      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })
  })
})
