// 🤖 [IA] - v1.1.17: Visual regression tests with screenshot comparisons
import test from '@playwright/test';
const { expect } = test;

test.describe('Visual Regression Testing', () => {
  test('Homepage visual consistency across viewports', async ({ page }) => {
    // Desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Take desktop screenshot
    await expect(page).toHaveScreenshot('homepage-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05, // 5% tolerance
      animations: 'disabled'
    });
    
    // Tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
      animations: 'disabled'
    });
    
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
      animations: 'disabled'
    });
  });

  test('Initial wizard visual consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Open evening cut wizard
    await page.click('text=Corte de Caja');
    await page.waitForTimeout(500); // Wait for animation
    
    // Step 1: Security protocol
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('wizard-step1-protocol.png', {
      maxDiffPixelRatio: 0.05,
      animations: 'disabled'
    });
    
    // Check all security rules
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    for (const checkbox of checkboxes) {
      await checkbox.check();
    }
    await page.click('text=Siguiente');
    await page.waitForTimeout(300);
    
    // Step 2: Store selection
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('wizard-step2-store.png', {
      maxDiffPixelRatio: 0.05,
      animations: 'disabled'
    });
    
    await page.click('button:has-text("Seleccionar sucursal")');
    await page.waitForTimeout(300);
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('wizard-step2-store-open.png', {
      maxDiffPixelRatio: 0.05,
      animations: 'disabled'
    });
    
    await page.click('text=Los Héroes');
    await page.click('text=Siguiente');
    await page.waitForTimeout(300);
    
    // Step 3: Cashier selection
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('wizard-step3-cashier.png', {
      maxDiffPixelRatio: 0.05,
      animations: 'disabled'
    });
    
    await page.click('button:has-text("Seleccionar cajero")');
    await page.click('text=Maria Lopez');
    await page.click('text=Siguiente');
    await page.waitForTimeout(300);
    
    // Step 4: Witness selection
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('wizard-step4-witness.png', {
      maxDiffPixelRatio: 0.05,
      animations: 'disabled'
    });
    
    await page.click('button:has-text("Seleccionar testigo")');
    await page.click('text=Juan Carlos');
    await page.click('text=Siguiente');
    await page.waitForTimeout(300);
    
    // Step 5: Expected sales
    await expect(page.locator('[role="dialog"]')).toHaveScreenshot('wizard-step5-sales.png', {
      maxDiffPixelRatio: 0.05,
      animations: 'disabled'
    });
  });

  test('Initial wizard confirm button geometry and states on step 5', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open evening cut wizard
    await page.click('text=Corte de Caja');

    // Step 1: Check all security rules, go next
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    for (const checkbox of checkboxes) {
      await checkbox.check();
    }
    await page.click('text=Siguiente');

    // Step 2: Store selection
    await page.click('button:has-text("Seleccionar sucursal")');
    await page.click('text=Los Héroes');
    await page.click('text=Siguiente');

    // Step 3: Cashier selection
    await page.click('button:has-text("Seleccionar cajero")');
    await page.click('text=Maria Lopez');
    await page.click('text=Siguiente');

    // Step 4: Witness selection
    await page.click('button:has-text("Seleccionar testigo")');
    await page.click('text=Juan Carlos');
    await page.click('text=Siguiente');

    // Step 5: Expected sales
    const input = page.locator('#expected-sales');
    await expect(input).toBeVisible();

    const confirmBtn = page.locator('button[aria-label="Confirmar venta esperada"]');
    await expect(confirmBtn).toBeVisible();

    // Should be disabled until a valid value is entered
    await expect(confirmBtn).toBeDisabled();

    // Heights should match (button vs input wrapper)
    const wrapper = input.locator('xpath=..');
    const wrapperBox = await wrapper.boundingBox();
    const btnBox = await confirmBtn.boundingBox();

    expect(wrapperBox).not.toBeNull();
    expect(btnBox).not.toBeNull();
    if (wrapperBox && btnBox) {
      const heightDelta = Math.abs(wrapperBox.height - btnBox.height);
      expect(heightDelta).toBeLessThanOrEqual(1); // allow 1px variance
      expect(btnBox.height).toBeGreaterThanOrEqual(40); // minimum touch target
    }

    // Enter a valid expected sales value to enable the button
    await input.fill('500.00');
    // Small wait for validation/state update
    await page.waitForTimeout(100);

    await expect(confirmBtn).toBeEnabled();
  });

  test('Cash counter Phase 1 visual consistency', async ({ page }) => {
    // Quick navigation to cash counter
    await page.goto('/');
    await page.click('text=Corte de Caja');
    
    // Complete wizard quickly
    const checkboxes = await page.locator('input[type="checkbox"]').all();
    for (const checkbox of checkboxes) {
      await checkbox.check();
    }
    await page.click('text=Siguiente');
    
    await page.click('button:has-text("Seleccionar sucursal")');
    await page.click('text=Los Héroes');
    await page.click('text=Siguiente');
    
    await page.click('button:has-text("Seleccionar cajero")');
    await page.click('text=Maria Lopez');
    await page.click('text=Siguiente');
    
    await page.click('button:has-text("Seleccionar testigo")');
    await page.click('text=Juan Carlos');
    await page.click('text=Siguiente');
    
    await page.fill('input[placeholder*="esperada"]', '500.00');
    await page.click('text=Completar');
    
    // Wait for Phase 1 to load
    await expect(page.locator('text=Fase 1:')).toBeVisible();
    await page.waitForTimeout(500);
    
    // Desktop view of Phase 1
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page).toHaveScreenshot('phase1-desktop.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
      animations: 'disabled'
    });
    
    // Mobile view of Phase 1 (guided view)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    
    await expect(page).toHaveScreenshot('phase1-mobile-guided.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
      animations: 'disabled'
    });
    
    // Test input field appearance
    const firstInput = page.locator('input[type="tel"]').first();
    if (await firstInput.isVisible()) {
      await firstInput.click();
      await page.waitForTimeout(300);
      
      await expect(page.locator('input[type="tel"]').first()).toHaveScreenshot('phase1-input-focused.png', {
        maxDiffPixelRatio: 0.05,
        animations: 'disabled'
      });
    }
  });
});