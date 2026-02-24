import { test, expect } from '@playwright/test'

test.describe('Inline node editing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForSelector('.liquor-tree')
    // Navigate to the Editing tab
    await page.getByRole('button', { name: 'Editing' }).click()
    await page.waitForSelector('.tree-edit-input', { state: 'detached' })
  })

  test('double-click shows an input with the node text', async ({ page }) => {
    const firstText = page.locator('.tree-text').first()
    const nodeText = (await firstText.textContent())?.trim() ?? ''

    await firstText.dblclick()

    const input = page.locator('.tree-edit-input')
    await expect(input).toBeVisible()
    await expect(input).toHaveValue(nodeText)
  })

  test('input is focused automatically after double-click', async ({ page }) => {
    await page.locator('.tree-text').first().dblclick()
    const input = page.locator('.tree-edit-input')
    await expect(input).toBeFocused()
  })

  test('Enter key commits the new text', async ({ page }) => {
    const firstText = page.locator('.tree-text').first()
    await firstText.dblclick()

    const input = page.locator('.tree-edit-input')
    await input.fill('Renamed via Enter')
    await input.press('Enter')

    await expect(input).not.toBeVisible()
    await expect(firstText).toHaveText('Renamed via Enter')
    await expect(page.locator('.editing-status')).toContainText('Renamed via Enter')
  })

  test('clicking away (blur) commits the new text', async ({ page }) => {
    const firstText = page.locator('.tree-text').first()
    await firstText.dblclick()

    const input = page.locator('.tree-edit-input')
    await input.fill('Renamed via Blur')
    // Click somewhere outside the input
    await page.locator('h2').click()

    await expect(input).not.toBeVisible()
    await expect(firstText).toHaveText('Renamed via Blur')
  })

  test('Escape key cancels and restores original text', async ({ page }) => {
    const firstText = page.locator('.tree-text').first()
    const originalText = (await firstText.textContent())?.trim() ?? ''

    await firstText.dblclick()

    const input = page.locator('.tree-edit-input')
    await input.fill('Should Not Save')
    await input.press('Escape')

    await expect(input).not.toBeVisible()
    await expect(firstText).toHaveText(originalText)
  })

  test('status bar updates after a successful rename', async ({ page }) => {
    const firstText = page.locator('.tree-text').first()
    const originalText = (await firstText.textContent())?.trim() ?? ''

    await firstText.dblclick()
    await page.locator('.tree-edit-input').fill('My New Name')
    await page.locator('.tree-edit-input').press('Enter')

    await expect(page.locator('.editing-status')).toContainText(`"${originalText}"`)
    await expect(page.locator('.editing-status')).toContainText('"My New Name"')
  })

  test('status bar does not update after a cancelled edit', async ({ page }) => {
    await page.locator('.tree-text').first().dblclick()
    await page.locator('.tree-edit-input').fill('Cancelled Edit')
    await page.locator('.tree-edit-input').press('Escape')

    await expect(page.locator('.editing-status')).toHaveText('Last Change: No changes yet')
  })

  test('can edit a child node', async ({ page }) => {
    // Expand to see children — nodes start expanded in the demo
    const childText = page.locator('.tree-text').nth(1)
    await childText.dblclick()

    await expect(page.locator('.tree-edit-input')).toBeVisible()
    await page.locator('.tree-edit-input').fill('Edited Child')
    await page.locator('.tree-edit-input').press('Enter')

    await expect(childText).toHaveText('Edited Child')
  })

  test('only one input is visible at a time', async ({ page }) => {
    const texts = page.locator('.tree-text')
    await texts.first().dblclick()
    await expect(page.locator('.tree-edit-input')).toHaveCount(1)
  })

  test('F2 starts editing the focused node', async ({ page }) => {
    // Click node to focus it first
    await page.locator('.tree-text').first().click()

    // Press F2
    await page.keyboard.press('F2')

    const input = page.locator('.tree-edit-input')
    await expect(input).toBeVisible()
    await expect(input).toBeFocused()
  })

  test('keyboard navigation works after committing an edit with Enter', async ({ page }) => {
    const firstText = page.locator('.tree-text').first()
    await firstText.click()
    await page.keyboard.press('F2')
    await page.locator('.tree-edit-input').press('Enter')

    // Tree root should have focus again — arrow keys should navigate
    await expect(page.locator('.tree-edit-input')).not.toBeVisible()
    await page.keyboard.press('ArrowDown')
    // The focused highlight should have moved to the second node
    await expect(page.locator('.tree-content-focused').nth(0)).not.toHaveText(
      (await firstText.textContent()) ?? ''
    )
  })

  test('keyboard navigation works after cancelling an edit with Escape', async ({ page }) => {
    const firstText = page.locator('.tree-text').first()
    await firstText.click()
    await page.keyboard.press('F2')
    await page.locator('.tree-edit-input').press('Escape')

    await expect(page.locator('.tree-edit-input')).not.toBeVisible()
    // ArrowDown should move focus — if nav is broken this will time out
    await page.keyboard.press('ArrowDown')
    await expect(page.locator('.tree-content-focused')).toBeVisible()
  })
})
