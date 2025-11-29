import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import TreeRoot from '../../../src/components/TreeRoot.vue'
import type { TreeNodeData } from '../../../src/types'

describe('TreeRoot.vue', () => {
  const sampleData: TreeNodeData[] = [
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

  describe('component mounting', () => {
    it('should mount successfully', () => {
      const wrapper = mount(TreeRoot)

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.classes()).toContain('liquor-tree')
    })

    it('should accept data prop', () => {
      const wrapper = mount(TreeRoot, {
        props: {
          data: sampleData
        }
      })

      expect(wrapper.props('data')).toEqual(sampleData)
    })

    it('should accept options prop', () => {
      const wrapper = mount(TreeRoot, {
        props: {
          options: {
            multiple: true,
            checkbox: true
          }
        }
      })

      expect(wrapper.props('options')).toEqual({
        multiple: true,
        checkbox: true
      })
    })
  })

  describe('tree instance creation', () => {
    it('should create a Tree instance when data is provided', () => {
      const wrapper = mount(TreeRoot, {
        props: {
          data: sampleData
        }
      })

      // Access the component's internal tree instance
      const vm = wrapper.vm as any
      expect(vm.tree).toBeDefined()
      expect(vm.tree.model).toBeDefined()
      expect(vm.tree.model.length).toBe(2)
    })

    it('should update tree when data prop changes', async () => {
      const wrapper = mount(TreeRoot, {
        props: {
          data: sampleData
        }
      })

      const newData: TreeNodeData[] = [
        { text: 'New Root' }
      ]

      await wrapper.setProps({ data: newData })

      const vm = wrapper.vm as any
      expect(vm.tree.model.length).toBe(1)
      expect(vm.tree.model[0].text).toBe('New Root')
    })

    it('should merge options with defaults', () => {
      const wrapper = mount(TreeRoot, {
        props: {
          data: sampleData,
          options: {
            multiple: false
          }
        }
      })

      const vm = wrapper.vm as any
      expect(vm.tree.options.multiple).toBe(false)
      // Should have default checkbox value
      expect(vm.tree.options.checkbox).toBeDefined()
    })
  })

  describe('rendering', () => {
    it('should render tree root element', async () => {
      const wrapper = mount(TreeRoot, {
        props: {
          data: sampleData
        }
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.find('.tree-root').exists()).toBe(true)
    })

    it('should render root nodes', async () => {
      const wrapper = mount(TreeRoot, {
        props: {
          data: sampleData
        }
      })

      await wrapper.vm.$nextTick()

      const nodes = wrapper.findAll('.tree-node')
      expect(nodes.length).toBeGreaterThan(0)
    })

    it('should render empty state when no data', async () => {
      const wrapper = mount(TreeRoot, {
        props: {
          data: []
        }
      })

      await wrapper.vm.$nextTick()

      expect(wrapper.find('.tree-root').exists()).toBe(true)
      const nodes = wrapper.findAll('.tree-node')
      expect(nodes.length).toBe(0)
    })
  })

  describe('tree instance exposure', () => {
    it('should expose tree instance via ref', () => {
      const wrapper = mount(TreeRoot, {
        props: {
          data: sampleData
        }
      })

      // In Vue 3 with script setup, exposed properties are available on vm
      const vm = wrapper.vm as any
      expect(vm.tree).toBeDefined()
    })

    it('should allow finding nodes through exposed tree', () => {
      const dataWithIds: TreeNodeData[] = [
        {
          id: 'node-1',
          text: 'Node 1'
        },
        {
          id: 'node-2',
          text: 'Node 2'
        }
      ]

      const wrapper = mount(TreeRoot, {
        props: {
          data: dataWithIds
        }
      })

      const vm = wrapper.vm as any
      const node = vm.tree.find('node-1')

      expect(node).toBeDefined()
      expect(node.text).toBe('Node 1')
    })
  })

  describe('reactivity', () => {
    it('should reactively render when tree model changes', async () => {
      const wrapper = mount(TreeRoot, {
        props: {
          data: sampleData
        }
      })

      const newData: TreeNodeData[] = [
        { text: 'Updated Root 1' },
        { text: 'Updated Root 2' },
        { text: 'Updated Root 3' }
      ]

      await wrapper.setProps({ data: newData })
      await wrapper.vm.$nextTick()

      // Tree should re-render with new data
      const vm = wrapper.vm as any
      expect(vm.tree.model.length).toBe(3)
    })
  })
})
