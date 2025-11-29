import { test, expect } from '@playwright/test'

test('tree should render with visible text', async ({ page }) => {
  await page.goto('/')

  // Wait for the page to load
  await page.waitForSelector('.liquor-tree')

  // Take a screenshot for debugging
  await page.screenshot({ path: 'test-results/tree-render.png' })

  // Check if tree-root exists
  const treeRoot = await page.locator('.tree-root').first()
  await expect(treeRoot).toBeVisible()

  // Check if tree nodes exist
  const treeNodes = await page.locator('.tree-node')
  await expect(treeNodes.first()).toBeVisible()

  // Check if we can see text
  const treeText = await page.locator('.tree-text').first()
  await expect(treeText).toBeVisible()

  // Get the actual text content
  const textContent = await treeText.textContent()
  console.log('First node text:', textContent)

  // Verify text is not empty
  expect(textContent).toBeTruthy()
  expect(textContent?.trim()).not.toBe('')
})

test('debug: print tree structure and styles', async ({ page }) => {
  await page.goto('/')

  await page.waitForSelector('.liquor-tree')

  // Get the HTML structure
  const html = await page.locator('.liquor-tree').first().innerHTML()
  console.log('Tree HTML:', html)

  // Get all tree text elements
  const allText = await page.locator('.tree-text').allTextContents()
  console.log('All node texts:', allText)

  // Get computed styles for the first tree-text element
  const styles = await page.locator('.tree-text').first().evaluate((el) => {
    const computed = window.getComputedStyle(el)
    return {
      color: computed.color,
      fontSize: computed.fontSize,
      display: computed.display,
      visibility: computed.visibility,
      opacity: computed.opacity,
      width: computed.width,
      height: computed.height,
      backgroundColor: computed.backgroundColor
    }
  })
  console.log('First .tree-text computed styles:', styles)

  // Get bounding box
  const box = await page.locator('.tree-text').first().boundingBox()
  console.log('First .tree-text bounding box:', box)
})
