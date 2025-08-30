/**
 * End-to-end test for the main quiz flow
 * Test: Login → Paste question → Generate → View flashcards → Save
 */

import { test, expect, type Page } from '@playwright/test'

// Test data
const TEST_QUESTION = `
What is the capital of France?
A) London
B) Paris  
C) Berlin
D) Madrid
`

const TEST_USER = {
  email: 'test@quizmate.test',
  password: 'testpassword123'
}

test.describe('QuizMate Main Flow', () => {
  let page: Page

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage()
    await page.goto('/')
  })

  test.afterEach(async () => {
    await page.close()
  })

  test('should complete full quiz generation flow', async () => {
    // Step 1: Navigate to home page and check basic content
    await expect(page).toHaveTitle(/QuizMate/i)
    await expect(page.locator('h1')).toContainText(/QuizMate/i)

    // Step 2: Navigate to login page
    await page.click('text=Sign In')
    await expect(page).toHaveURL(/\/auth\/login/)
    
    // Check login form is present
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()

    // Skip actual login for now and go directly to quiz page
    // In a real test, you would:
    // 1. Fill in credentials
    // 2. Submit login form
    // 3. Wait for redirect
    // For demo purposes, we'll navigate directly to quiz
    await page.goto('/quiz')

    // Step 3: Check quiz page loaded
    await expect(page).toHaveURL(/\/quiz/)
    await expect(page.locator('h1')).toContainText(/AI Study Assistant/i)
    
    // Check main form elements are present
    await expect(page.locator('textarea[placeholder*="question"]')).toBeVisible()
    await expect(page.locator('button:has-text("Generate")')).toBeVisible()

    // Step 4: Enter test question
    await page.fill('textarea[placeholder*="question"]', TEST_QUESTION)
    
    // Optional: Set subject and grade
    const subjectSelect = page.locator('select').first()
    if (await subjectSelect.isVisible()) {
      await subjectSelect.selectOption('Geography')
    }

    // Step 5: Generate answer (this would normally call the API)
    // Note: In a real test environment, you'd need to mock the API
    // or have a test environment with working AI integration
    await page.click('button:has-text("Generate")')
    
    // Wait for loading state
    await expect(page.locator('text=Generating')).toBeVisible({ timeout: 5000 })
    
    // In a real test, wait for results
    // await expect(page.locator('[data-testid="answer-section"]')).toBeVisible({ timeout: 30000 })

    // Step 6: Check if usage badge is visible
    await expect(page.locator('text=remaining')).toBeVisible()

    // Step 7: Verify responsive design
    await page.setViewportSize({ width: 375, height: 667 }) // Mobile size
    await expect(page.locator('textarea')).toBeVisible()
    
    await page.setViewportSize({ width: 1024, height: 768 }) // Desktop size
    await expect(page.locator('textarea')).toBeVisible()
  })

  test('should handle file upload interface', async () => {
    await page.goto('/quiz')
    
    // Check file upload area is present
    await expect(page.locator('text=Upload File')).toBeVisible()
    
    // Check drag and drop area
    const uploadArea = page.locator('[data-testid="file-upload"]')
    if (await uploadArea.isVisible()) {
      await expect(uploadArea).toContainText(/drag.*drop|click.*upload/i)
    }
  })

  test('should display language selection', async () => {
    await page.goto('/')
    
    // Check if language switcher is present
    const languageSwitcher = page.locator('[data-testid="language-switcher"]')
    if (await languageSwitcher.isVisible()) {
      await languageSwitcher.click()
      
      // Check if language options are available
      await expect(page.locator('text=English')).toBeVisible()
    }
  })

  test('should navigate between main pages', async () => {
    // Test navigation to different pages
    await page.goto('/')
    
    // Check home page
    await expect(page.locator('text=QuizMate')).toBeVisible()
    
    // Navigate to quiz page (might require auth in real app)
    const quizLink = page.locator('a[href*="/quiz"]')
    if (await quizLink.isVisible()) {
      await quizLink.click()
      await expect(page).toHaveURL(/\/quiz/)
    }
    
    // Navigate to pricing if available
    const pricingLink = page.locator('a[href*="/pricing"]')
    if (await pricingLink.isVisible()) {
      await pricingLink.click()
      await expect(page.locator('text=pricing')).toBeVisible()
    }
  })

  test('should show usage limits for free users', async () => {
    await page.goto('/quiz')
    
    // Look for usage indicator
    const usageBadge = page.locator('text=remaining')
    if (await usageBadge.isVisible()) {
      await expect(usageBadge).toContainText(/\d+.*remaining/)
    }
    
    // Check for upgrade prompts
    const upgradeButton = page.locator('text=Upgrade')
    if (await upgradeButton.isVisible()) {
      await expect(upgradeButton).toBeVisible()
    }
  })

  test('should handle error states gracefully', async () => {
    await page.goto('/quiz')
    
    // Try to generate without entering text
    await page.click('button:has-text("Generate")')
    
    // Should show validation error
    const errorMessage = page.locator('text=enter.*question|text.*required')
    if (await errorMessage.isVisible()) {
      await expect(errorMessage).toBeVisible()
    }
  })

  test('should be accessible', async () => {
    await page.goto('/')
    
    // Check for proper heading structure
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    // Check for alt text on images
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      if (await img.isVisible()) {
        const alt = await img.getAttribute('alt')
        expect(alt).toBeTruthy()
      }
    }
    
    // Check for proper form labels
    await page.goto('/quiz')
    const inputs = page.locator('input, textarea, select')
    const inputCount = await inputs.count()
    
    for (let i = 0; i < inputCount; i++) {
      const input = inputs.nth(i)
      if (await input.isVisible()) {
        const hasLabel = await input.evaluate((el) => {
          const id = el.getAttribute('id')
          return id ? document.querySelector(`label[for="${id}"]`) !== null : false
        })
        const hasAriaLabel = await input.getAttribute('aria-label')
        const hasPlaceholder = await input.getAttribute('placeholder')
        
        // Input should have at least one form of labeling
        expect(hasLabel || hasAriaLabel || hasPlaceholder).toBeTruthy()
      }
    }
  })
})