import { describe, it, expect, vi } from 'vitest'
import { Tree } from '../../../src/core/Tree'
import type { TreeNodeData, TreeOptions } from '../../../src/types'

const sampleData: TreeNodeData[] = [
  {
    id: '1',
    text: 'Node 1',
    children: [
      { id: '1-1', text: 'Child 1-1' },
      { id: '1-2', text: 'Child 1-2' }
    ]
  },
  { id: '2', text: 'Node 2' },
  { id: '3', text: 'Node 3', state: { disabled: true } }
]

function makeTree(options: TreeOptions = {}) {
  const tree = new Tree(options)
  tree.setModel(sampleData)
  return tree
}

describe('Node.editable()', () => {
  it('returns false by default when tree editing option is off', () => {
    const tree = makeTree()
    expect(tree.find('1')!.editable()).toBe(false)
  })

  it('returns true when tree.options.editing is true', () => {
    const tree = makeTree({ editing: true })
    expect(tree.find('1')!.editable()).toBe(true)
  })

  it('returns false for a disabled node even when editing is enabled globally', () => {
    const tree = makeTree({ editing: true })
    expect(tree.find('3')!.editable()).toBe(false)
  })

  it('per-node state overrides tree option — explicit true', () => {
    const tree = makeTree({ editing: false })
    const node = tree.find('1')!
    node.state('editable', true)
    expect(node.editable()).toBe(true)
  })

  it('per-node state overrides tree option — explicit false', () => {
    const tree = makeTree({ editing: true })
    const node = tree.find('1')!
    node.state('editable', false)
    expect(node.editable()).toBe(false)
  })
})

describe('Node.startEditing()', () => {
  it('sets isEditing to true when node is editable', () => {
    const tree = makeTree({ editing: true })
    const node = tree.find('1')!
    node.startEditing()
    expect(node.isEditing).toBe(true)
  })

  it('emits node:editing event', () => {
    const tree = makeTree({ editing: true })
    const handler = vi.fn()
    tree.$on('node:editing', handler)
    tree.find('1')!.startEditing()
    expect(handler).toHaveBeenCalled()
  })

  it('does nothing when node is not editable (editing option off)', () => {
    const tree = makeTree()
    const node = tree.find('1')!
    node.startEditing()
    expect(node.isEditing).toBe(false)
  })

  it('does nothing when node is disabled', () => {
    const tree = makeTree({ editing: true })
    const node = tree.find('3')!
    node.startEditing()
    expect(node.isEditing).toBe(false)
  })

  it('does nothing when per-node editable state is false', () => {
    const tree = makeTree({ editing: true })
    const node = tree.find('1')!
    node.state('editable', false)
    node.startEditing()
    expect(node.isEditing).toBe(false)
  })
})

describe('Node.stopEditing()', () => {
  it('clears isEditing', () => {
    const tree = makeTree({ editing: true })
    const node = tree.find('1')!
    node.startEditing()
    node.stopEditing(false)
    expect(node.isEditing).toBe(false)
  })

  it('saves new text when save=true', () => {
    const tree = makeTree({ editing: true })
    const node = tree.find('1')!
    node.startEditing()
    node.stopEditing(true, 'Renamed Node')
    expect(node.text).toBe('Renamed Node')
  })

  it('emits node:text:changed when text changes', () => {
    const tree = makeTree({ editing: true })
    const handler = vi.fn()
    tree.$on('node:text:changed', handler)
    const node = tree.find('1')!
    node.startEditing()
    node.stopEditing(true, 'New Name')
    expect(handler).toHaveBeenCalledWith(node, 'New Name', 'Node 1')
  })

  it('does not emit node:text:changed when text is unchanged', () => {
    const tree = makeTree({ editing: true })
    const handler = vi.fn()
    tree.$on('node:text:changed', handler)
    const node = tree.find('1')!
    node.startEditing()
    node.stopEditing(true, 'Node 1')
    expect(handler).not.toHaveBeenCalled()
  })

  it('does not save text when save=false (cancel)', () => {
    const tree = makeTree({ editing: true })
    const node = tree.find('1')!
    node.startEditing()
    node.stopEditing(false, 'Should Not Save')
    expect(node.text).toBe('Node 1')
  })

  it('emits node:editing:stopped event', () => {
    const tree = makeTree({ editing: true })
    const handler = vi.fn()
    tree.$on('node:editing:stopped', handler)
    const node = tree.find('1')!
    node.startEditing()
    node.stopEditing(false)
    expect(handler).toHaveBeenCalled()
  })

  it('is a no-op when node is not currently editing', () => {
    const tree = makeTree({ editing: true })
    const handler = vi.fn()
    tree.$on('node:editing:stopped', handler)
    const node = tree.find('1')!
    node.stopEditing(true, 'Should Not Apply')
    expect(node.text).toBe('Node 1')
    expect(handler).not.toHaveBeenCalled()
  })

  it('calling stopEditing twice only applies once', () => {
    const tree = makeTree({ editing: true })
    const handler = vi.fn()
    tree.$on('node:editing:stopped', handler)
    const node = tree.find('1')!
    node.startEditing()
    node.stopEditing(true, 'First Save')
    node.stopEditing(true, 'Second Save')
    expect(node.text).toBe('First Save')
    expect(handler).toHaveBeenCalledTimes(1)
  })
})

