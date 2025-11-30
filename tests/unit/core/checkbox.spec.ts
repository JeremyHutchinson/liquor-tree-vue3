import { describe, it, expect, beforeEach } from 'vitest'
import { Tree } from '../../../src/core/Tree'
import type { TreeOptions, TreeNodeData } from '../../../src/types'

describe('Checkbox State Management', () => {
  let tree: Tree
  const sampleData: TreeNodeData[] = [
    {
      id: '1',
      text: 'Parent 1',
      children: [
        { id: '1-1', text: 'Child 1-1' },
        { id: '1-2', text: 'Child 1-2' },
        { id: '1-3', text: 'Child 1-3' }
      ]
    },
    {
      id: '2',
      text: 'Parent 2',
      children: [
        {
          id: '2-1',
          text: 'Child 2-1',
          children: [
            { id: '2-1-1', text: 'Grandchild 2-1-1' },
            { id: '2-1-2', text: 'Grandchild 2-1-2' }
          ]
        }
      ]
    },
    { id: '3', text: 'Leaf Node' }
  ]

  beforeEach(() => {
    const options: TreeOptions = {
      checkbox: true,
      autoCheckChildren: true
    }
    tree = new Tree(options)
    tree.setModel(sampleData)
  })

  describe('Basic checkbox operations', () => {
    it('should check a node', () => {
      const node = tree.find('3')!
      node.check()

      expect(node.checked()).toBe(true)
      expect(tree.checkedNodes).toContain(node)
    })

    it('should uncheck a node', () => {
      const node = tree.find('3')!
      node.check()
      node.uncheck()

      expect(node.checked()).toBe(false)
      expect(tree.checkedNodes).not.toContain(node)
    })

    it('should track all checked nodes', () => {
      const node1 = tree.find('1-1')!
      const node2 = tree.find('2')!

      node1.check()
      node2.check()

      expect(tree.checkedNodes.length).toBeGreaterThanOrEqual(2)
      expect(tree.checkedNodes).toContain(node1)
      expect(tree.checkedNodes).toContain(node2)
    })
  })

  describe('Auto-check children', () => {
    it('should check all children when parent is checked', () => {
      const parent = tree.find('1')!
      const child1 = tree.find('1-1')!
      const child2 = tree.find('1-2')!
      const child3 = tree.find('1-3')!

      parent.check()

      expect(parent.checked()).toBe(true)
      expect(child1.checked()).toBe(true)
      expect(child2.checked()).toBe(true)
      expect(child3.checked()).toBe(true)
    })

    it('should check all descendants recursively', () => {
      const parent = tree.find('2')!
      const child = tree.find('2-1')!
      const grandchild1 = tree.find('2-1-1')!
      const grandchild2 = tree.find('2-1-2')!

      parent.check()

      expect(parent.checked()).toBe(true)
      expect(child.checked()).toBe(true)
      expect(grandchild1.checked()).toBe(true)
      expect(grandchild2.checked()).toBe(true)
    })

    it('should uncheck all children when parent is unchecked', () => {
      const parent = tree.find('1')!
      const child1 = tree.find('1-1')!
      const child2 = tree.find('1-2')!

      parent.check()
      parent.uncheck()

      expect(parent.checked()).toBe(false)
      expect(child1.checked()).toBe(false)
      expect(child2.checked()).toBe(false)
    })
  })

  describe('Indeterminate state', () => {
    it('should set parent to indeterminate when some children are checked', () => {
      const parent = tree.find('1')!
      const child1 = tree.find('1-1')!
      const child2 = tree.find('1-2')!

      child1.check()

      expect(parent.indeterminate()).toBe(true)
      expect(parent.checked()).toBe(false)
    })

    it('should set parent to checked (not indeterminate) when all children are checked', () => {
      const parent = tree.find('1')!
      const child1 = tree.find('1-1')!
      const child2 = tree.find('1-2')!
      const child3 = tree.find('1-3')!

      child1.check()
      child2.check()
      child3.check()

      expect(parent.checked()).toBe(true)
      expect(parent.indeterminate()).toBe(false)
    })

    it('should clear indeterminate when all children are unchecked', () => {
      const parent = tree.find('1')!
      const child1 = tree.find('1-1')!

      child1.check()
      expect(parent.indeterminate()).toBe(true)

      child1.uncheck()
      expect(parent.indeterminate()).toBe(false)
      expect(parent.checked()).toBe(false)
    })

    it('should propagate indeterminate state up multiple levels', () => {
      const grandparent = tree.find('2')!
      const parent = tree.find('2-1')!
      const grandchild1 = tree.find('2-1-1')!

      grandchild1.check()

      expect(grandchild1.checked()).toBe(true)
      expect(parent.indeterminate()).toBe(true)
      expect(grandparent.indeterminate()).toBe(true)
    })
  })

  describe('Without autoCheckChildren', () => {
    beforeEach(() => {
      const options: TreeOptions = {
        checkbox: true,
        autoCheckChildren: false
      }
      tree = new Tree(options)
      tree.setModel(sampleData)
    })

    it('should not check children when parent is checked', () => {
      const parent = tree.find('1')!
      const child1 = tree.find('1-1')!
      const child2 = tree.find('1-2')!

      parent.check()

      expect(parent.checked()).toBe(true)
      expect(child1.checked()).toBe(false)
      expect(child2.checked()).toBe(false)
    })

    it('should still update parent indeterminate state when child is checked', () => {
      const parent = tree.find('1')!
      const child1 = tree.find('1-1')!

      child1.check()

      expect(parent.indeterminate()).toBe(true)
    })
  })

  describe('Edge cases', () => {
    it('should handle checking leaf nodes without children', () => {
      const leaf = tree.find('3')!

      leaf.check()

      expect(leaf.checked()).toBe(true)
      expect(leaf.indeterminate()).toBe(false)
    })

    it('should handle double-checking (idempotent)', () => {
      const node = tree.find('3')!

      node.check()
      node.check()

      expect(node.checked()).toBe(true)
      expect(tree.checkedNodes.filter(n => n.id === '3').length).toBe(1)
    })

    it('should handle double-unchecking (idempotent)', () => {
      const node = tree.find('3')!

      node.check()
      node.uncheck()
      node.uncheck()

      expect(node.checked()).toBe(false)
      expect(tree.checkedNodes).not.toContain(node)
    })

    it('should remove node from checkedNodes when unchecked', () => {
      const node1 = tree.find('1-1')!
      const node2 = tree.find('1-2')!

      node1.check()
      node2.check()

      const initialCount = tree.checkedNodes.length
      node1.uncheck()

      expect(tree.checkedNodes.length).toBe(initialCount - 1)
      expect(tree.checkedNodes).not.toContain(node1)
      expect(tree.checkedNodes).toContain(node2)
    })
  })
})
