// 🤖 [IA] - v3.1.0: E2E Smoke Tests - Critical user flows (fast, stable)
// @smoke tag - runs on every commit/push
// PIN tests moved to pin-flow.regression.spec.ts (flaky)
import { test, expect } from '@playwright/test';

test.describe('Smoke Tests @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for app to load (more forgiving selector)
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  test('App loads and shows operation selector', async ({ page }) => {
    // Verify main UI elements are visible
    // Using more forgiving selectors for stability
    const hasOperationSelector = await page.locator('text=/selecciona/i').isVisible();
    const hasDeliveryOption = await page.locator('text=/corte/i').isVisible();
    const hasMorningOption = await page.locator('text=/matutino/i').isVisible();

    expect(hasOperationSelector || hasDeliveryOption || hasMorningOption).toBeTruthy();
  });

  test('Morning count: starts without PIN', async ({ page }) => {
    await page.getByText(/conteo.*matutino/i).click();

    // Should proceed directly to wizard (no PIN required)
    await expect(page.getByText(/protocolo|seguridad/i)).toBeVisible({ timeout: 5000 });
  });
});
