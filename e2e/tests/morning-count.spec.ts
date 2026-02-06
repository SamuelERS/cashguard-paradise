// 🤖 [IA] - v1.1.17: E2E tests for morning count flow - simulates real cashier interactions
// @regression tag - comprehensive morning count flow
import { test, expect } from '@playwright/test';

test.describe('Morning Count Flow - $50 Cash Verification @regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the operation selector to be visible
    await expect(page.locator('text=Selecciona la Operación')).toBeVisible({ timeout: 10000 });
  });

  test('Complete morning count flow with exact $50', async ({ page }) => {
    // 🤖 [IA] - FASE 2: Migrated to stable data-testid selectors
    // Step 1: Select morning count operation
    await page.click('text=Conteo de Caja');

    // Step 2: Morning count wizard appears
    await expect(page.locator('text=Conteo Matutino')).toBeVisible();

    // Step 3: Select store - Los Héroes
    await page.click('button:has-text("Seleccionar sucursal")');
    await page.click('text=Los Héroes');

    // Step 4: Select cashier - Maria Lopez
    await page.click('[data-testid="wizard-button-next"]');
    await page.click('button:has-text("Seleccionar cajero")');
    await page.click('text=Maria Lopez');

    // Step 5: Select witness - Juan Carlos
    await page.click('[data-testid="wizard-button-next"]');
    await page.click('button:has-text("Seleccionar testigo")');
    await page.click('text=Juan Carlos');

    // Step 6: Complete wizard
    await page.click('[data-testid="wizard-button-complete"]');
    
    // Wait for cash counter to load
    await expect(page.locator('text=Fase 1:')).toBeVisible({ timeout: 10000 });
    
    // Step 7: Count bills to reach $50
    // Enter $20 bills (2 x $20 = $40)
    await page.fill('input[placeholder*="$20"]', '2');
    await page.click('button:has-text("Confirmar")');
    
    // Enter $5 bills (2 x $5 = $10) 
    await page.fill('input[placeholder*="$5"]', '2');
    await page.click('button:has-text("Confirmar")');
    
    // Skip all other denominations with 0
    const denominations = ['$100', '$50', '$10', '$1', '25¢', '10¢', '5¢', '1¢'];
    for (const denom of denominations) {
      const input = page.locator(`input[placeholder*="${denom}"]`).first();
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        await input.fill('0');
        await page.click('button:has-text("Confirmar")');
      }
    }
    
    // Step 8: Confirm total cash
    await expect(page.locator('text=Total Efectivo')).toBeVisible();
    await page.fill('input[placeholder*="Total efectivo"]', '50');
    await page.click('button:has-text("Confirmar")');
    
    // Step 9: Complete Phase 1
    await page.click('button:has-text("Completar Fase 1")');
    
    // Step 10: Should skip Phase 2 (morning count always skips)
    await expect(page.locator('text=Conteo Matutino Completado')).toBeVisible({ timeout: 10000 });
    
    // Verify final report shows $50
    await expect(page.locator('text=$50.00')).toBeVisible();
    await expect(page.locator('text=Efectivo inicial verificado correctamente')).toBeVisible();
    
    // Verify report buttons are present
    await expect(page.locator('button:has-text("WhatsApp")')).toBeVisible();
    await expect(page.locator('button:has-text("Reporte")')).toBeVisible();
    await expect(page.locator('button:has-text("Copiar")')).toBeVisible();
    await expect(page.locator('button:has-text("Finalizar")')).toBeVisible();
  });

  test('Morning count with shortage alert', async ({ page }) => {
    // 🤖 [IA] - FASE 2: Migrated to stable data-testid selectors
    // Select morning count
    await page.click('text=Conteo de Caja');

    // Quick wizard completion
    await page.click('button:has-text("Seleccionar sucursal")');
    await page.click('text=Los Héroes');
    await page.click('[data-testid="wizard-button-next"]');

    await page.click('button:has-text("Seleccionar cajero")');
    await page.click('text=Tito Gomez');
    await page.click('[data-testid="wizard-button-next"]');

    await page.click('button:has-text("Seleccionar testigo")');
    await page.click('text=Maria Lopez');
    await page.click('[data-testid="wizard-button-complete"]');
    
    // Count only $45 (shortage)
    await page.fill('input[placeholder*="$20"]', '2'); // $40
    await page.click('button:has-text("Confirmar")');
    
    await page.fill('input[placeholder*="$5"]', '1'); // $5
    await page.click('button:has-text("Confirmar")');
    
    // Fill zeros for remaining denominations
    const skipDenoms = ['$100', '$50', '$10', '$1', '25¢', '10¢', '5¢', '1¢'];
    for (const denom of skipDenoms) {
      const input = page.locator(`input[placeholder*="${denom}"]`).first();
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        await input.fill('0');
        await page.click('button:has-text("Confirmar")');
      }
    }
    
    // Confirm total
    await page.fill('input[placeholder*="Total efectivo"]', '45');
    await page.click('button:has-text("Confirmar")');
    
    // Complete Phase 1
    await page.click('button:has-text("Completar Fase 1")');
    
    // Verify shortage alert appears
    await expect(page.locator('text=Faltante detectado')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=$5.00 menos de lo esperado')).toBeVisible();
  });

  test('Morning count with excess alert', async ({ page }) => {
    // 🤖 [IA] - FASE 2: Migrated to stable data-testid selectors
    // Select morning count
    await page.click('text=Conteo de Caja');

    // Quick wizard completion
    await page.click('button:has-text("Seleccionar sucursal")');
    await page.click('text=Los Héroes');
    await page.click('[data-testid="wizard-button-next"]');

    await page.click('button:has-text("Seleccionar cajero")');
    await page.click('text=Ana Martinez');
    await page.click('[data-testid="wizard-button-next"]');

    await page.click('button:has-text("Seleccionar testigo")');
    await page.click('text=Pedro Sanchez');
    await page.click('[data-testid="wizard-button-complete"]');
    
    // Count $55 (excess)
    await page.fill('input[placeholder*="$20"]', '2'); // $40
    await page.click('button:has-text("Confirmar")');
    
    await page.fill('input[placeholder*="$10"]', '1'); // $10
    await page.click('button:has-text("Confirmar")');
    
    await page.fill('input[placeholder*="$5"]', '1'); // $5
    await page.click('button:has-text("Confirmar")');
    
    // Fill zeros for remaining
    const skipDenoms = ['$100', '$50', '$1', '25¢', '10¢', '5¢', '1¢'];
    for (const denom of skipDenoms) {
      const input = page.locator(`input[placeholder*="${denom}"]`).first();
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        await input.fill('0');
        await page.click('button:has-text("Confirmar")');
      }
    }
    
    // Confirm total
    await page.fill('input[placeholder*="Total efectivo"]', '55');
    await page.click('button:has-text("Confirmar")');
    
    // Complete Phase 1
    await page.click('button:has-text("Completar Fase 1")');
    
    // Verify excess alert appears
    await expect(page.locator('text=Sobrante detectado')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=$5.00 más de lo esperado')).toBeVisible();
  });

  test('Mobile responsiveness for morning count', async ({ page, viewport }) => {
    // 🤖 [IA] - FASE 2: Migrated to stable data-testid selectors
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Select morning count
    await page.click('text=Conteo de Caja');

    // Verify mobile-optimized layout
    await expect(page.locator('.sm\\:max-w-md')).toBeVisible();

    // Complete wizard on mobile
    await page.click('button:has-text("Seleccionar sucursal")');
    await page.click('text=Los Héroes');
    await page.click('[data-testid="wizard-button-next"]');

    await page.click('button:has-text("Seleccionar cajero")');
    await page.click('text=Maria Lopez');
    await page.click('[data-testid="wizard-button-next"]');

    await page.click('button:has-text("Seleccionar testigo")');
    await page.click('text=Juan Carlos');
    await page.click('[data-testid="wizard-button-complete"]');
    
    // Verify guided view is mobile-optimized
    await expect(page.locator('text=Paso 1 de 12')).toBeVisible();
    
    // Test numeric keyboard appears on mobile
    const input = page.locator('input[placeholder*="$20"]').first();
    await input.click();
    
    // Verify input has proper mobile attributes
    const inputType = await input.getAttribute('type');
    const inputMode = await input.getAttribute('inputMode');
    expect(inputType).toBe('tel');
    expect(inputMode).toBe('numeric');
  });
});