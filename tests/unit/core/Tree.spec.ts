import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Tree } from '../../../src/core/Tree'
import { Node } from '../../../src/core/Node'
import type { TreeNodeData, TreeOptions } from '../../../src/types'

describe('Tree', () => {
  describe('constructor', () => {
    it('should create a tree with default options', () => {
      const tree = new Tree()

      expect(tree).toBeDefined()
      expect(tree.options).toBeDefined()
      expect(tree.model).toEqual([])
    })

    it('should create a tree with custom options', () => {
      const options: TreeOptions = {
        multiple: true,
        checkbox: true,
        autoCheckChildren: true
      }

      const tree = new Tree(options)

      expect(tree.options.multiple).toBe(true)
      expect(tree.options.checkbox).toBe(true)
      expect(tree.options.autoCheckChildren).toBe(true)
    })

    it('should initialize selected and checked node collections', () => {
      const tree = new Tree()

      expect(tree.selectedNodes).toBeDefined()
      expect(tree.checkedNodes).toBeDefined()
      expect(Array.isArray(tree.selectedNodes)).toBe(true)
      expect(Array.isArray(tree.checkedNodes)).toBe(true)
    })
  })

  describe('setModel', () => {
    it('should parse data and create node tree', () => {
      const tree = new Tree()
      const data: TreeNodeData[] = [
        {
          text: 'Root 1',
          children: [
            { text: 'Child 1.1' },
            { text: 'Child 1.2' }
          ]
        },
        {
          text: 'Root 2'
        }
      ]

      tree.setModel(data)

      expect(tree.model).toHaveLength(2)
      expect(tree.model[0]).toBeInstanceOf(Node)
      expect(tree.model[0].text).toBe('Root 1')
      expect(tree.model[0].children).toHaveLength(2)
      expect(tree.model[1].text).toBe('Root 2')
    })

    it('should set tree reference on all nodes', () => {
      const tree = new Tree()
      const data: TreeNodeData[] = [
        {
          text: 'Root',
          children: [
            { text: 'Child' }
          ]
        }
      ]

      tree.setModel(data)

      expect(tree.model[0].tree).toBe(tree)
      expect(tree.model[0].children[0].tree).toBe(tree)
    })

    it('should set parent references on child nodes', () => {
      const tree = new Tree()
      const data: TreeNodeData[] = [
        {
          text: 'Root',
          children: [
            { text: 'Child' }
          ]
        }
      ]

      tree.setModel(data)

      const root = tree.model[0]
      const child = root.children[0]

      expect(child.parent).toBe(root)
    })

    it('should collect initially selected nodes', () => {
      const tree = new Tree({ multiple: true })
      const data: TreeNodeData[] = [
        {
          text: 'Node 1',
          state: { selected: true }
        },
        {
          text: 'Node 2',
          state: { selected: true }
        }
      ]

      tree.setModel(data)

      expect(tree.selectedNodes).toHaveLength(2)
      expect(tree.selectedNodes[0].text).toBe('Node 1')
      expect(tree.selectedNodes[1].text).toBe('Node 2')
    })

    it('should collect initially checked nodes', () => {
      const tree = new Tree({ checkbox: true })
      const data: TreeNodeData[] = [
        {
          text: 'Node 1',
          state: { checked: true }
        },
        {
          text: 'Node 2',
          state: { checked: true }
        }
      ]

      tree.setModel(data)

      expect(tree.checkedNodes).toHaveLength(2)
    })

    it('should only keep one selected node if multiple is false', () => {
      const tree = new Tree({ multiple: false })
      const data: TreeNodeData[] = [
        {
          text: 'Node 1',
          state: { selected: true }
        },
        {
          text: 'Node 2',
          state: { selected: true }
        }
      ]

      tree.setModel(data)

      expect(tree.selectedNodes).toHaveLength(1)
    })
  })

  describe('find', () => {
    let tree: Tree

    beforeEach(() => {
      tree = new Tree()
      const data: TreeNodeData[] = [
        {
          id: 'node-1',
          text: 'Root 1',
          children: [
            { id: 'node-1-1', text: 'Child 1.1' },
            { id: 'node-1-2', text: 'Child 1.2' }
          ]
        },
        {
          id: 'node-2',
          text: 'Root 2'
        }
      ]
      tree.setModel(data)
    })

    it('should find node by id', () => {
      const node = tree.find('node-1-1')

      expect(node).toBeDefined()
      expect(node?.text).toBe('Child 1.1')
    })

    it('should find node by predicate function', () => {
      const node = tree.find((n: Node) => n.text === 'Child 1.2')

      expect(node).toBeDefined()
      expect(node?.text).toBe('Child 1.2')
    })

    it('should return null if node not found', () => {
      const node = tree.find('non-existent')

      expect(node).toBeNull()
    })

    it('should find all matching nodes', () => {
      const nodes = tree.findAll((n: Node) => n.text.includes('Child'))

      expect(nodes).toHaveLength(2)
      expect(nodes[0].text).toBe('Child 1.1')
      expect(nodes[1].text).toBe('Child 1.2')
    })
  })

  describe('selection management', () => {
    let tree: Tree

    beforeEach(() => {
      tree = new Tree({ multiple: true })
      const data: TreeNodeData[] = [
        { id: 'node-1', text: 'Node 1' },
        { id: 'node-2', text: 'Node 2' },
        { id: 'node-3', text: 'Node 3' }
      ]
      tree.setModel(data)
    })

    it('should select a node', () => {
      const node = tree.model[0]

      tree.select(node)

      expect(node.selected()).toBe(true)
      expect(tree.selectedNodes).toHaveLength(1)
      expect(tree.selectedNodes[0]).toBe(node)
    })

    it('should unselect a node', () => {
      const node = tree.model[0]
      tree.select(node)

      tree.unselect(node)

      expect(node.selected()).toBe(false)
      expect(tree.selectedNodes).toHaveLength(0)
    })

    it('should replace selection if multiple is false', () => {
      tree.options.multiple = false
      const node1 = tree.model[0]
      const node2 = tree.model[1]

      tree.select(node1)
      tree.select(node2)

      expect(node1.selected()).toBe(false)
      expect(node2.selected()).toBe(true)
      expect(tree.selectedNodes).toHaveLength(1)
    })

    it('should allow multiple selections if multiple is true and extendSelection is true', () => {
      const node1 = tree.model[0]
      const node2 = tree.model[1]

      tree.select(node1)
      tree.select(node2, true) // Pass extendSelection: true

      expect(node1.selected()).toBe(true)
      expect(node2.selected()).toBe(true)
      expect(tree.selectedNodes).toHaveLength(2)
    })

    it('should unselect all nodes', () => {
      tree.select(tree.model[0])
      tree.select(tree.model[1])

      tree.unselectAll()

      expect(tree.selectedNodes).toHaveLength(0)
      expect(tree.model[0].selected()).toBe(false)
      expect(tree.model[1].selected()).toBe(false)
    })
  })

  describe('checkbox management', () => {
    let tree: Tree

    beforeEach(() => {
      tree = new Tree({ checkbox: true, autoCheckChildren: true })
      const data: TreeNodeData[] = [
        {
          text: 'Parent',
          children: [
            { text: 'Child 1' },
            { text: 'Child 2' }
          ]
        }
      ]
      tree.setModel(data)
    })

    it('should check a node', () => {
      const node = tree.model[0]

      tree.check(node)

      expect(node.checked()).toBe(true)
      expect(tree.checkedNodes).toHaveLength(1)
    })

    it('should uncheck a node', () => {
      const node = tree.model[0]
      tree.check(node)

      tree.uncheck(node)

      expect(node.checked()).toBe(false)
      expect(tree.checkedNodes).toHaveLength(0)
    })

    it('should uncheck all nodes', () => {
      tree.check(tree.model[0])

      tree.uncheckAll()

      expect(tree.checkedNodes).toHaveLength(0)
    })
  })

  describe('recurseDown', () => {
    it('should traverse all nodes in tree', () => {
      const tree = new Tree()
      const data: TreeNodeData[] = [
        {
          text: 'Root 1',
          children: [
            { text: 'Child 1.1' },
            { text: 'Child 1.2' }
          ]
        },
        {
          text: 'Root 2'
        }
      ]
      tree.setModel(data)

      const visited: string[] = []
      tree.recurseDown((node) => {
        visited.push(node.text)
      })

      expect(visited).toHaveLength(4)
      expect(visited).toContain('Root 1')
      expect(visited).toContain('Child 1.1')
      expect(visited).toContain('Child 1.2')
      expect(visited).toContain('Root 2')
    })
  })

  describe('event emission', () => {
    it('should emit events', () => {
      const tree = new Tree()
      const handler = vi.fn()

      tree.$on('test:event', handler)
      tree.$emit('test:event', 'arg1', 'arg2')

      expect(handler).toHaveBeenCalledWith('arg1', 'arg2')
    })

    it('should support once listeners', () => {
      const tree = new Tree()
      const handler = vi.fn()

      tree.$once('test:event', handler)
      tree.$emit('test:event')
      tree.$emit('test:event')

      expect(handler).toHaveBeenCalledTimes(1)
    })

    it('should support off to remove listeners', () => {
      const tree = new Tree()
      const handler = vi.fn()

      tree.$on('test:event', handler)
      tree.$off('test:event', handler)
      tree.$emit('test:event')

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('sorting', () => {
    let tree: Tree

    beforeEach(() => {
      tree = new Tree()
      const data: TreeNodeData[] = [
        { text: 'Zebra' },
        { text: 'Apple' },
        { text: 'Mango' }
      ]
      tree.setModel(data)
    })

    it('should sort nodes', () => {
      tree.sort((a, b) => a.text.localeCompare(b.text))

      expect(tree.model[0].text).toBe('Apple')
      expect(tree.model[1].text).toBe('Mango')
      expect(tree.model[2].text).toBe('Zebra')
    })

    it('should sort nodes deeply', () => {
      const data: TreeNodeData[] = [
        {
          text: 'Root',
          children: [
            { text: 'Zebra' },
            { text: 'Apple' }
          ]
        }
      ]
      tree.setModel(data)

      tree.sort((a, b) => a.text.localeCompare(b.text), true)

      const root = tree.model[0]
      expect(root.children[0].text).toBe('Apple')
      expect(root.children[1].text).toBe('Zebra')
    })
  })

  describe('filtering', () => {
    let tree: Tree

    beforeEach(() => {
      tree = new Tree({
        filter: {
          matcher: (query: string, node: Node) => {
            return node.text.toLowerCase().includes(query.toLowerCase())
          }
        }
      })
      const data: TreeNodeData[] = [
        {
          text: 'Apple',
          children: [
            { text: 'Green Apple' },
            { text: 'Red Apple' }
          ]
        },
        {
          text: 'Banana'
        },
        {
          text: 'Orange'
        }
      ]
      tree.setModel(data)
    })

    it('should filter nodes by query', () => {
      const matches = tree.filter('apple')

      expect(matches).toHaveLength(3) // Apple, Green Apple, Red Apple
      expect(matches[0].text).toContain('Apple')
    })

    it('should mark matched nodes with matched state', () => {
      tree.filter('banana')

      const banana = tree.find((n: Node) => n.text === 'Banana')
      expect(banana?.state('matched')).toBe(true)
    })

    it('should clear filter', () => {
      tree.filter('apple')
      tree.clearFilter()

      tree.recurseDown((node) => {
        expect(node.state('matched')).toBeFalsy()
        expect(node.state('visible')).not.toBe(false)
      })
    })
  })
})
