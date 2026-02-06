// 🤖 [IA] - v3.1.0: PIN flow regression tests (moved from smoke - flaky)
// @regression tag - runs in full test suite only
import { test, expect } from '@playwright/test';

test.describe('PIN Flow Tests @regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible({ timeout: 10000 });
    await page.waitForLoadState('networkidle');
  });

  test('PIN modal appears on delivery operation select', async ({ page }) => {
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

  test('Incorrect PIN shows error', async ({ page }) => {
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

  test('Lockout after 3 failed attempts', async ({ page }) => {
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
});
