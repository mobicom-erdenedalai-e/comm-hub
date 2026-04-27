import { test, expect } from '@playwright/test'

test.describe('Weekly Report Generation', () => {
  test('unauthenticated user is redirected to login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page shows GitHub sign-in button', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('button', { name: /sign in with github/i })).toBeVisible()
  })
})
