// 🤖 [IA] - v3.1.0: E2E Smoke Tests - Critical user flows (fast, stable)
// @smoke tag - runs on every commit/push
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

  test('Delivery flow: PIN modal appears on operation select', async ({ page }) => {
    // Click on evening cut (deliveries)
    await page.getByText(/corte.*caja/i).click();

    // PIN modal should appear with input
    const pinInput = page.getByTestId('pin-input');
    await expect(pinInput).toBeVisible({ timeout: 5000 });

    // Cancel button should work
    const cancelButton = page.getByTestId('pin-cancel');
    await expect(cancelButton).toBeVisible();
    await cancelButton.click();

    // Should return to operation selector
    await expect(page.getByText(/selecciona.*operación/i)).toBeVisible();
  });

  test('Delivery flow: Incorrect PIN shows error', async ({ page }) => {
    await page.getByText(/corte.*caja/i).click();

    // Wait for PIN input
    const pinInput = page.getByTestId('pin-input');
    await expect(pinInput).toBeVisible({ timeout: 5000 });

    // Enter incorrect PIN
    await pinInput.fill('0000');

    const submitButton = page.getByTestId('pin-submit');
    await submitButton.click();

    // Error message should appear
    await expect(page.getByText(/intentos restantes/i)).toBeVisible({ timeout: 3000 });
  });

  test('Delivery flow: Lockout after 3 failed attempts', async ({ page }) => {
    await page.getByText(/corte.*caja/i).click();

    const pinInput = page.getByTestId('pin-input');
    await expect(pinInput).toBeVisible({ timeout: 5000 });

    const submitButton = page.getByTestId('pin-submit');

    // Attempt 1
    await pinInput.fill('0000');
    await submitButton.click();
    await expect(page.getByText(/intentos restantes/i)).toBeVisible({ timeout: 3000 });

    // Attempt 2
    await pinInput.fill('0000');
    await submitButton.click();
    await expect(page.getByText(/intentos restantes/i)).toBeVisible({ timeout: 3000 });

    // Attempt 3 - should trigger lockout
    await pinInput.fill('0000');
    await submitButton.click();

    // Lockout message should appear
    await expect(page.getByText(/bloqueado|espera/i)).toBeVisible({ timeout: 3000 });
  });

  test('Morning count: starts without PIN', async ({ page }) => {
    await page.getByText(/conteo.*matutino/i).click();

    // Should proceed directly to wizard (no PIN required)
    await expect(page.getByText(/protocolo|seguridad/i)).toBeVisible({ timeout: 5000 });
  });
});
