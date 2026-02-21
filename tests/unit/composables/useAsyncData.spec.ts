import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAsyncData } from '../../../src/composables/useAsyncData'
import { Tree } from '../../../src/core/Tree'
import { Node } from '../../../src/core/Node'
import type { TreeOptions } from '../../../src/types'

describe('useAsyncData', () => {
  let tree: Tree
  let options: TreeOptions

  beforeEach(() => {
    options = {}
    tree = new Tree(options)
  })

  describe('fetchData as function', () => {
    it('should call fetchData when node expands with isBatch flag', async () => {
      const mockFetchData = vi.fn().mockResolvedValue([
        { text: 'Child 1' },
        { text: 'Child 2' }
      ])

      options.fetchData = mockFetchData
      const { loadChildren } = useAsyncData(tree, options)

      const parentNode = new Node(tree, { text: 'Parent', isBatch: true })

      await loadChildren(parentNode)

      expect(mockFetchData).toHaveBeenCalledWith(parentNode)
      expect(parentNode.children.length).toBe(2)
      expect(parentNode.children[0].text).toBe('Child 1')
      expect(parentNode.children[1].text).toBe('Child 2')
    })

    it('should track loading state during fetch', async () => {
      const mockFetchData = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve([{ text: 'Child' }]), 100)
        })
      })

      options.fetchData = mockFetchData
      const { loadChildren, isLoading } = useAsyncData(tree, options)

      const parentNode = new Node(tree, { text: 'Parent', isBatch: true })

      expect(isLoading.value).toBe(false)

      const loadPromise = loadChildren(parentNode)
      expect(isLoading.value).toBe(true)

      await loadPromise
      expect(isLoading.value).toBe(false)
    })

    it('should handle fetch errors and call onFetchError callback', async () => {
      const error = new Error('Network error')
      const mockFetchData = vi.fn().mockRejectedValue(error)
      const onFetchError = vi.fn()

      options.fetchData = mockFetchData
      options.onFetchError = onFetchError

      const { loadChildren } = useAsyncData(tree, options)
      const parentNode = new Node(tree, { text: 'Parent', isBatch: true })

      await loadChildren(parentNode)

      expect(onFetchError).toHaveBeenCalledWith(error, parentNode)
      expect(parentNode.children.length).toBe(0)
    })

    it('should set loading state on the node during fetch', async () => {
      const mockFetchData = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve([{ text: 'Child' }]), 50)
        })
      })

      options.fetchData = mockFetchData
      const { loadChildren } = useAsyncData(tree, options)

      const parentNode = new Node(tree, { text: 'Parent', isBatch: true })

      expect(parentNode.states.loading).toBeUndefined()

      const loadPromise = loadChildren(parentNode)
      expect(parentNode.states.loading).toBe(true)

      await loadPromise
      expect(parentNode.states.loading).toBe(false)
    })
  })

  describe('fetchData as URL template string', () => {
    it('should replace placeholders in URL template with node properties', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve([{ text: 'Child 1' }])
      })
      vi.stubGlobal('fetch', mockFetch)

      options.fetchData = '/api/data-{id}.json?text={text}'
      const { loadChildren } = useAsyncData(tree, options)

      const parentNode = new Node(tree, {
        text: 'Parent Node',
        id: 123,
        isBatch: true
      })

      await loadChildren(parentNode)

      expect(mockFetch).toHaveBeenCalledWith('/api/data-123.json?text=Parent Node')
      expect(parentNode.children.length).toBe(1)
    })

    it('should handle multiple placeholder replacements', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        json: () => Promise.resolve([])
      })
      vi.stubGlobal('fetch', mockFetch)

      options.fetchData = '/api/{category}/{id}/items?filter={filter}'
      const { loadChildren } = useAsyncData(tree, options)

      const parentNode = new Node(tree, {
        text: 'Node 1',
        id: 'node-1',
        category: 'products',
        filter: 'active',
        isBatch: true
      })

      await loadChildren(parentNode)

      expect(mockFetch).toHaveBeenCalledWith('/api/products/node-1/items?filter=active')
    })

    it('should handle fetch errors with URL template', async () => {
      const error = new Error('404 Not Found')
      const mockFetch = vi.fn().mockRejectedValue(error)
      vi.stubGlobal('fetch', mockFetch)
      const onFetchError = vi.fn()

      options.fetchData = '/api/data-{id}.json'
      options.onFetchError = onFetchError
      const { loadChildren } = useAsyncData(tree, options)

      const parentNode = new Node(tree, { text: 'Parent', id: 999, isBatch: true })

      await loadChildren(parentNode)

      expect(onFetchError).toHaveBeenCalledWith(error, parentNode)
    })
  })

  describe('no fetchData configured', () => {
    it('should not attempt to load if fetchData is not configured', async () => {
      const { loadChildren } = useAsyncData(tree, {})
      const parentNode = new Node(tree, { text: 'Parent', isBatch: true })

      await loadChildren(parentNode)

      expect(parentNode.children.length).toBe(0)
    })
  })

  describe('node without isBatch flag', () => {
    it('should not load children if node does not have isBatch flag', async () => {
      const mockFetchData = vi.fn().mockResolvedValue([{ text: 'Child' }])
      options.fetchData = mockFetchData

      const { loadChildren } = useAsyncData(tree, options)
      const parentNode = new Node(tree, { text: 'Parent' })

      await loadChildren(parentNode)

      // Should still call fetchData if explicitly requested
      expect(mockFetchData).toHaveBeenCalled()
    })
  })

  describe('prevent duplicate loads', () => {
    it('should not load children if already loaded', async () => {
      const mockFetchData = vi.fn().mockResolvedValue([{ text: 'Child' }])
      options.fetchData = mockFetchData

      const { loadChildren } = useAsyncData(tree, options)
      const parentNode = new Node(tree, { text: 'Parent', isBatch: true })

      // First load
      await loadChildren(parentNode)
      expect(mockFetchData).toHaveBeenCalledTimes(1)
      expect(parentNode.children.length).toBe(1)

      // Second load attempt
      await loadChildren(parentNode)
      expect(mockFetchData).toHaveBeenCalledTimes(1) // Should not call again
    })

    it('should not start multiple concurrent loads', async () => {
      let resolveCount = 0
      const mockFetchData = vi.fn().mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolveCount++
            resolve([{ text: `Child ${resolveCount}` }])
          }, 100)
        })
      })

      options.fetchData = mockFetchData
      const { loadChildren } = useAsyncData(tree, options)
      const parentNode = new Node(tree, { text: 'Parent', isBatch: true })

      // Start multiple loads concurrently
      const load1 = loadChildren(parentNode)
      const load2 = loadChildren(parentNode)
      const load3 = loadChildren(parentNode)

      await Promise.all([load1, load2, load3])

      expect(mockFetchData).toHaveBeenCalledTimes(1) // Should only call once
      expect(parentNode.children.length).toBe(1)
    })
  })
})
