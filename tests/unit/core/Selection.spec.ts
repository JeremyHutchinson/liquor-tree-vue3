import { describe, it, expect, beforeEach } from 'vitest'
import { Selection } from '../../../src/core/Selection'
import { Tree } from '../../../src/core/Tree'
import { Node } from '../../../src/core/Node'
import type { TreeNodeData } from '../../../src/types'

describe('Selection', () => {
  let tree: Tree
  let nodes: Node[]

  beforeEach(() => {
    tree = new Tree({ multiple: true, checkbox: true })
    const data: TreeNodeData[] = [
      {
        id: 'node-1',
        text: 'Node 1',
        children: [
          { id: 'node-1-1', text: 'Child 1.1' },
          { id: 'node-1-2', text: 'Child 1.2' }
        ]
      },
      { id: 'node-2', text: 'Node 2' },
      { id: 'node-3', text: 'Node 3' }
    ]
    tree.setModel(data)
    nodes = [tree.model[0], tree.model[1], tree.model[2]]
  })

  describe('constructor', () => {
    it('should create selection from array of nodes', () => {
      const selection = new Selection(tree, nodes)

      expect(selection).toBeInstanceOf(Selection)
      expect(selection.tree).toBe(tree)
      expect(selection.length).toBe(3)
      expect(selection[0]).toBe(nodes[0])
    })

    it('should create empty selection', () => {
      const selection = new Selection(tree)

      expect(selection.length).toBe(0)
    })

    it('should be iterable like an array', () => {
      const selection = new Selection(tree, nodes)
      const collected: Node[] = []

      for (const node of selection) {
        collected.push(node)
      }

      expect(collected).toHaveLength(3)
      expect(collected[0]).toBe(nodes[0])
    })
  })

  describe('array-like behavior', () => {
    it('should support array methods', () => {
      const selection = new Selection(tree, nodes)

      // map returns a Selection, so convert to array for comparison
      const mapped = Array.from(selection.map(n => n.text))
      expect(mapped).toEqual(['Node 1', 'Node 2', 'Node 3'])

      const filtered = selection.filter(n => n.text.includes('1'))
      expect(filtered).toHaveLength(1)

      expect(selection.some(n => n.text === 'Node 2')).toBe(true)
      expect(selection.every(n => n.text.startsWith('Node'))).toBe(true)
    })

    it('should support push and pop', () => {
      const selection = new Selection(tree, [nodes[0]])

      selection.push(nodes[1])
      expect(selection.length).toBe(2)

      const popped = selection.pop()
      expect(popped).toBe(nodes[1])
      expect(selection.length).toBe(1)
    })
  })

  describe('get()', () => {
    it('should get node by index', () => {
      const selection = new Selection(tree, nodes)

      expect(selection.get(0)).toBe(nodes[0])
      expect(selection.get(1)).toBe(nodes[1])
      expect(selection.get(2)).toBe(nodes[2])
    })

    it('should return undefined for invalid index', () => {
      const selection = new Selection(tree, nodes)

      expect(selection.get(99)).toBeUndefined()
      expect(selection.get(-1)).toBeUndefined()
    })
  })

  describe('node()', () => {
    it('should get first node', () => {
      const selection = new Selection(tree, nodes)

      expect(selection.node()).toBe(nodes[0])
    })

    it('should return null for empty selection', () => {
      const selection = new Selection(tree)

      expect(selection.node()).toBeNull()
    })
  })

  describe('forEach()', () => {
    it('should iterate over all nodes', () => {
      const selection = new Selection(tree, nodes)
      const visited: string[] = []

      selection.forEach((node) => {
        visited.push(node.text)
      })

      expect(visited).toEqual(['Node 1', 'Node 2', 'Node 3'])
    })

    it('should provide index and selection in callback', () => {
      const selection = new Selection(tree, nodes)
      let lastIndex = -1
      let lastSelection: Node[] | null = null

      selection.forEach((_node, index, sel) => {
        lastIndex = index
        lastSelection = sel
      })

      expect(lastIndex).toBe(2)
      expect(lastSelection).toBe(selection)
    })
  })

  describe('empty()', () => {
    it('should clear all nodes', () => {
      const selection = new Selection(tree, nodes)

      selection.empty()

      expect(selection.length).toBe(0)
    })

    it('should return this for chaining', () => {
      const selection = new Selection(tree, nodes)

      const result = selection.empty()

      expect(result).toBe(selection)
    })
  })

  describe('add()', () => {
    it('should add a node', () => {
      const selection = new Selection(tree)

      selection.add(nodes[0])

      expect(selection.length).toBe(1)
      expect(selection[0]).toBe(nodes[0])
    })

    it('should add multiple nodes', () => {
      const selection = new Selection(tree)

      selection.add(nodes[0], nodes[1])

      expect(selection.length).toBe(2)
    })

    it('should return this for chaining', () => {
      const selection = new Selection(tree)

      const result = selection.add(nodes[0])

      expect(result).toBe(selection)
    })
  })

  describe('remove()', () => {
    it('should remove a node', () => {
      const selection = new Selection(tree, nodes)

      selection.remove(nodes[1])

      expect(selection.length).toBe(2)
      expect(selection.includes(nodes[1])).toBe(false)
    })

    it('should do nothing if node not in selection', () => {
      const selection = new Selection(tree, [nodes[0]])
      const child = tree.find('node-1-1')!

      selection.remove(child)

      expect(selection.length).toBe(1)
    })

    it('should return this for chaining', () => {
      const selection = new Selection(tree, nodes)

      const result = selection.remove(nodes[0])

      expect(result).toBe(selection)
    })
  })

  describe('bulk operations', () => {
    describe('select()', () => {
      it('should select all nodes in selection', () => {
        const selection = new Selection(tree, nodes)

        selection.select()

        nodes.forEach(node => {
          expect(node.selected()).toBe(true)
        })
      })

      it('should return this for chaining', () => {
        const selection = new Selection(tree, nodes)

        const result = selection.select()

        expect(result).toBe(selection)
      })
    })

    describe('unselect()', () => {
      it('should unselect all nodes in selection', () => {
        const selection = new Selection(tree, nodes)

        selection.select()
        selection.unselect()

        nodes.forEach(node => {
          expect(node.selected()).toBe(false)
        })
      })
    })

    describe('check()', () => {
      it('should check all nodes in selection', () => {
        const selection = new Selection(tree, nodes)

        selection.check()

        nodes.forEach(node => {
          expect(node.checked()).toBe(true)
        })
      })
    })

    describe('uncheck()', () => {
      it('should uncheck all nodes in selection', () => {
        const selection = new Selection(tree, nodes)

        selection.check()
        selection.uncheck()

        nodes.forEach(node => {
          expect(node.checked()).toBe(false)
        })
      })
    })

    describe('expand()', () => {
      it('should expand all nodes in selection', () => {
        const selection = new Selection(tree, nodes)

        selection.expand()

        nodes.forEach(node => {
          expect(node.expanded()).toBe(true)
        })
      })
    })

    describe('collapse()', () => {
      it('should collapse all nodes in selection', () => {
        const selection = new Selection(tree, nodes)

        selection.expand()
        selection.collapse()

        nodes.forEach(node => {
          expect(node.expanded()).toBe(false)
        })
      })
    })
  })

  describe('method chaining', () => {
    it('should support method chaining', () => {
      const selection = new Selection(tree, nodes)

      const result = selection
        .select()
        .expand()
        .check()

      expect(result).toBe(selection)
      nodes.forEach(node => {
        expect(node.selected()).toBe(true)
        expect(node.expanded()).toBe(true)
        expect(node.checked()).toBe(true)
      })
    })
  })
})
