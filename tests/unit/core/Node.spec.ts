import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Node } from '../../../src/core/Node'
import { Tree } from '../../../src/core/Tree'
import type { TreeNodeData } from '../../../src/types'

describe('Node', () => {
  let tree: Tree
  let mockEmit: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Create a minimal tree mock for testing
    mockEmit = vi.fn()
    tree = {
      options: {
        autoCheckChildren: true
      },
      $emit: mockEmit
    } as any
  })

  describe('constructor', () => {
    it('should create a node with required properties', () => {
      const data: TreeNodeData = {
        text: 'Test Node'
      }

      const node = new Node(tree, data)

      expect(node.text).toBe('Test Node')
      expect(node.tree).toBe(tree)
      expect(node.id).toBeDefined()
      expect(node.children).toEqual([])
      expect(node.parent).toBeNull()
    })

    it('should use provided id', () => {
      const data: TreeNodeData = {
        id: 'custom-id',
        text: 'Test Node'
      }

      const node = new Node(tree, data)

      expect(node.id).toBe('custom-id')
    })

    it('should generate id if not provided', () => {
      const data: TreeNodeData = {
        text: 'Test Node'
      }

      const node = new Node(tree, data)

      expect(node.id).toBeTruthy()
      expect(typeof node.id).toBe('string')
    })

    it('should initialize states from data', () => {
      const data: TreeNodeData = {
        text: 'Test Node',
        state: {
          selected: true,
          expanded: true,
          disabled: false
        }
      }

      const node = new Node(tree, data)

      expect(node.states.selected).toBe(true)
      expect(node.states.expanded).toBe(true)
      expect(node.states.disabled).toBe(false)
    })

    it('should store custom data', () => {
      const data: TreeNodeData = {
        text: 'Test Node',
        data: {
          customField: 'custom value',
          count: 42
        }
      }

      const node = new Node(tree, data)

      expect(node.data.customField).toBe('custom value')
      expect(node.data.count).toBe(42)
    })

    it('should throw error if tree is not provided', () => {
      const data: TreeNodeData = {
        text: 'Test Node'
      }

      expect(() => new Node(null as any, data)).toThrow('Node must have a Tree context')
    })

    it('should throw error if data is not provided', () => {
      expect(() => new Node(tree, null as any)).toThrow('Node can not be empty')
    })
  })

  describe('text property', () => {
    it('should get node text', () => {
      const node = new Node(tree, { text: 'Original Text' })

      expect(node.text).toBe('Original Text')
    })

    it('should set node text', () => {
      const node = new Node(tree, { text: 'Original Text' })

      node.text = 'Updated Text'

      expect(node.text).toBe('Updated Text')
      expect(node.data.text).toBe('Updated Text')
    })

    it('should emit text:changed event when text changes', () => {
      const node = new Node(tree, { text: 'Original Text' })

      node.text = 'Updated Text'

      expect(mockEmit).toHaveBeenCalledWith('node:text:changed', node, 'Updated Text', 'Original Text')
    })

    it('should not emit event if text does not change', () => {
      const node = new Node(tree, { text: 'Same Text' })

      node.text = 'Same Text'

      expect(mockEmit).not.toHaveBeenCalled()
    })
  })

  describe('parent/child relationships', () => {
    it('should have null parent for root nodes', () => {
      const node = new Node(tree, { text: 'Root' })

      expect(node.parent).toBeNull()
    })

    it('should maintain parent reference', () => {
      const parent = new Node(tree, { text: 'Parent' })
      const child = new Node(tree, { text: 'Child' })

      child.parent = parent

      expect(child.parent).toBe(parent)
    })

    it('should store children array', () => {
      const parent = new Node(tree, { text: 'Parent' })
      const child1 = new Node(tree, { text: 'Child 1' })
      const child2 = new Node(tree, { text: 'Child 2' })

      parent.children = [child1, child2]

      expect(parent.children).toHaveLength(2)
      expect(parent.children[0]).toBe(child1)
      expect(parent.children[1]).toBe(child2)
    })

    it('should calculate depth correctly', () => {
      const root = new Node(tree, { text: 'Root' })
      const level1 = new Node(tree, { text: 'Level 1' })
      const level2 = new Node(tree, { text: 'Level 2' })

      level1.parent = root
      level2.parent = level1

      expect(root.depth).toBe(0)
      expect(level1.depth).toBe(1)
      expect(level2.depth).toBe(2)
    })

    it('should return path from node to root', () => {
      const root = new Node(tree, { text: 'Root' })
      const level1 = new Node(tree, { text: 'Level 1' })
      const level2 = new Node(tree, { text: 'Level 2' })

      level1.parent = root
      level2.parent = level1

      const path = level2.getPath()

      expect(path).toHaveLength(3)
      expect(path[0]).toBe(level2)
      expect(path[1]).toBe(level1)
      expect(path[2]).toBe(root)
    })
  })

  describe('state management', () => {
    it('should get state value', () => {
      const node = new Node(tree, {
        text: 'Test',
        state: { selected: true }
      })

      expect(node.state('selected')).toBe(true)
    })

    it('should set state value', () => {
      const node = new Node(tree, { text: 'Test' })

      node.state('selected', true)

      expect(node.state('selected')).toBe(true)
    })

    it('should have convenience methods for common states', () => {
      const node = new Node(tree, {
        text: 'Test',
        state: { selected: true }
      })

      expect(node.selected()).toBe(true)
    })
  })

  describe('hasChildren', () => {
    it('should return false for nodes without children', () => {
      const node = new Node(tree, { text: 'Leaf' })

      expect(node.hasChildren()).toBe(false)
    })

    it('should return true for nodes with children', () => {
      const parent = new Node(tree, { text: 'Parent' })
      const child = new Node(tree, { text: 'Child' })

      parent.children = [child]

      expect(parent.hasChildren()).toBe(true)
    })
  })

  describe('recurseUp', () => {
    it('should traverse up the tree', () => {
      const root = new Node(tree, { text: 'Root' })
      const level1 = new Node(tree, { text: 'Level 1' })
      const level2 = new Node(tree, { text: 'Level 2' })

      level1.parent = root
      level2.parent = level1

      const visited: Node[] = []
      level2.recurseUp((node) => {
        visited.push(node)
      })

      expect(visited).toHaveLength(2)
      expect(visited[0]).toBe(level1)
      expect(visited[1]).toBe(root)
    })

    it('should stop if callback returns false', () => {
      const root = new Node(tree, { text: 'Root' })
      const level1 = new Node(tree, { text: 'Level 1' })
      const level2 = new Node(tree, { text: 'Level 2' })

      level1.parent = root
      level2.parent = level1

      const visited: Node[] = []
      level2.recurseUp((node) => {
        visited.push(node)
        return false // Stop at first parent
      })

      expect(visited).toHaveLength(1)
      expect(visited[0]).toBe(level1)
    })
  })

  describe('recurseDown', () => {
    it('should traverse down the tree', () => {
      const root = new Node(tree, { text: 'Root' })
      const child1 = new Node(tree, { text: 'Child 1' })
      const child2 = new Node(tree, { text: 'Child 2' })
      const grandchild = new Node(tree, { text: 'Grandchild' })

      root.children = [child1, child2]
      child1.children = [grandchild]
      child1.parent = root
      child2.parent = root
      grandchild.parent = child1

      const visited: string[] = []
      root.recurseDown((node) => {
        visited.push(node.text)
      })

      expect(visited).toContain('Root')
      expect(visited).toContain('Child 1')
      expect(visited).toContain('Child 2')
      expect(visited).toContain('Grandchild')
    })

    it('should optionally skip the starting node', () => {
      const root = new Node(tree, { text: 'Root' })
      const child1 = new Node(tree, { text: 'Child 1' })

      root.children = [child1]
      child1.parent = root

      const visited: string[] = []
      root.recurseDown((node) => {
        visited.push(node.text)
      }, true) // Skip root

      expect(visited).not.toContain('Root')
      expect(visited).toContain('Child 1')
    })
  })

  describe('setData', () => {
    it('should merge data with existing data', () => {
      const node = new Node(tree, {
        text: 'Test',
        data: { existing: 'value' }
      })

      node.setData({ new: 'value' })

      expect(node.data.existing).toBe('value')
      expect(node.data.new).toBe('value')
    })

    it('should emit data:changed event', () => {
      const node = new Node(tree, { text: 'Test' })

      node.setData({ custom: 'data' })

      expect(mockEmit).toHaveBeenCalledWith('node:data:changed', node, expect.objectContaining({
        custom: 'data'
      }))
    })
  })

  describe('expand/collapse', () => {
    it('should expand a collapsed node', () => {
      const node = new Node(tree, {
        text: 'Test',
        state: { expanded: false }
      })

      node.expand()

      expect(node.expanded()).toBe(true)
    })

    it('should not change state when expanding already expanded node', () => {
      const node = new Node(tree, {
        text: 'Test',
        state: { expanded: true }
      })

      node.expand()

      expect(node.expanded()).toBe(true)
    })

    it('should emit node:expanded event when expanding', () => {
      const node = new Node(tree, {
        text: 'Test',
        state: { expanded: false }
      })

      node.expand()

      expect(mockEmit).toHaveBeenCalledWith('node:expanded', node)
    })

    it('should collapse an expanded node', () => {
      const node = new Node(tree, {
        text: 'Test',
        state: { expanded: true }
      })

      node.collapse()

      expect(node.expanded()).toBe(false)
    })

    it('should not change state when collapsing already collapsed node', () => {
      const node = new Node(tree, {
        text: 'Test',
        state: { expanded: false }
      })

      node.collapse()

      expect(node.expanded()).toBe(false)
    })

    it('should emit node:collapsed event when collapsing', () => {
      const node = new Node(tree, {
        text: 'Test',
        state: { expanded: true }
      })

      node.collapse()

      expect(mockEmit).toHaveBeenCalledWith('node:collapsed', node)
    })

    it('should toggle from collapsed to expanded', () => {
      const node = new Node(tree, {
        text: 'Test',
        state: { expanded: false }
      })

      node.toggleExpand()

      expect(node.expanded()).toBe(true)
    })

    it('should toggle from expanded to collapsed', () => {
      const node = new Node(tree, {
        text: 'Test',
        state: { expanded: true }
      })

      node.toggleExpand()

      expect(node.expanded()).toBe(false)
    })
  })
})
