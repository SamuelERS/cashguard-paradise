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
    // Verify operation cards are visible (exact text avoids strict-mode ambiguity)
    const hasCashCount = await page.getByText('Conteo de Caja').isVisible();
    const hasCashCut = await page.getByText('Corte de Caja').isVisible();
    const hasMorningOption = await page.getByText('Inicio de Turno').isVisible();

    expect(hasCashCount || hasCashCut || hasMorningOption).toBeTruthy();
  });

  test('Morning count: starts without PIN', async ({ page }) => {
    await page.getByText('Conteo de Caja').click();

    // Should proceed directly to wizard (no PIN required)
    await expect(page.getByText(/protocolo|seguridad/i)).toBeVisible({ timeout: 5000 });
  });
});
