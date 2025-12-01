import { ref } from 'vue'
import type { Tree } from '../core/Tree'
import { Node } from '../core/Node'
import type { TreeOptions, TreeNodeData } from '../types'

/**
 * Composable for handling async data loading in the tree
 * Supports both URL template strings and custom fetch functions
 */
export function useAsyncData(tree: Tree, options: TreeOptions) {
  const isLoading = ref(false)
  const loadingNodes = new Set<Node>()

  /**
   * Replaces placeholders in URL template with node properties
   * Example: "/api/data-{id}.json" + node.id=123 => "/api/data-123.json"
   */
  function buildUrlFromTemplate(template: string, node: Node): string {
    let result = template
    const re = /{([^}]+)}/g
    const matches = [...template.matchAll(re)]

    for (const match of matches) {
      const propertyName = match[1]
      // Check direct node properties first, then data object
      let propertyValue = (node as any)[propertyName]
      if (propertyValue === undefined && node.data) {
        propertyValue = node.data[propertyName]
      }
      result = result.replace(match[0], String(propertyValue ?? ''))
    }

    return result
  }

  /**
   * Fetches data using the configured fetchData option
   */
  async function fetchData(node: Node): Promise<TreeNodeData[]> {
    if (!options.fetchData) {
      return []
    }

    // Handle fetchData as function
    if (typeof options.fetchData === 'function') {
      return await options.fetchData(node)
    }

    // Handle fetchData as URL template string
    if (typeof options.fetchData === 'string') {
      const url = buildUrlFromTemplate(options.fetchData, node)
      const response = await fetch(url)
      return await response.json()
    }

    return []
  }

  /**
   * Loads children for a node
   * Handles loading state, error handling, and duplicate prevention
   */
  async function loadChildren(node: Node): Promise<void> {
    // Skip if no fetchData configured
    if (!options.fetchData) {
      return
    }

    // Prevent duplicate concurrent loads
    if (loadingNodes.has(node)) {
      return
    }

    // Prevent loading if already loaded (has children and not isBatch anymore)
    if (node.children.length > 0 && !node.isBatch) {
      return
    }

    try {
      // Mark as loading
      loadingNodes.add(node)
      isLoading.value = true
      node.states.loading = true

      // Fetch the data
      const childrenData = await fetchData(node)

      // Add children to the node
      if (childrenData && childrenData.length > 0) {
        childrenData.forEach(childData => {
          // Create a new Node instance from the data
          const childNode = new Node(tree, childData)
          node.append(childNode)
        })
      }

      // Mark node as no longer needing batch loading
      node.isBatch = false
    } catch (error) {
      // Call error handler if configured
      if (options.onFetchError) {
        options.onFetchError(error as Error, node)
      }
    } finally {
      // Clear loading state
      loadingNodes.delete(node)
      node.states.loading = false
      isLoading.value = loadingNodes.size > 0
    }
  }

  return {
    isLoading,
    loadChildren
  }
}
