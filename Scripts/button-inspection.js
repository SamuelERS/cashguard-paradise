// Script de inspección forense para validar botones post-refactorización CSS
// Ejecutar con: node Scripts/button-inspection.js

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('🔍 INICIANDO INSPECCIÓN FORENSE DE BOTONES\n');
  console.log('═══════════════════════════════════════════\n');

  // Navegar a la aplicación
  await page.goto('http://localhost:5174/');
  console.log('✅ Navegación exitosa a localhost:5174\n');

  // 1. ABRIR INITIAL WIZARD MODAL
  console.log('📋 PASO 1: InitialWizardModal\n');

  // Trigger modal opening (wait for it to be visible)
  await page.waitForTimeout(2000);

  // Check if modal is already open or find trigger
  const modalVisible = await page.locator('[role="dialog"]').isVisible();

  if (modalVisible) {
    console.log('  → Modal ya visible al cargar página\n');

    // Inspeccionar botón Cancelar en InitialWizardModal
    const cancelButton1 = await page.locator('button:has-text("Cancelar")').first();

    if (await cancelButton1.isVisible()) {
      // Obtener clases del DOM
      const classes1 = await cancelButton1.getAttribute('class');
      console.log('  🔍 Botón "Cancelar" - InitialWizardModal:');
      console.log('     Classes DOM:', classes1?.substring(0, 150) + '...');

      // Obtener computed styles
      const styles1 = await cancelButton1.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          height: computed.height,
          paddingLeft: computed.paddingLeft,
          paddingRight: computed.paddingRight,
          backgroundColor: computed.backgroundColor,
          borderRadius: computed.borderRadius
        };
      });

      console.log('     Computed Styles:');
      console.log('       - Height:', styles1.height);
      console.log('       - Padding-left:', styles1.paddingLeft);
      console.log('       - Padding-right:', styles1.paddingRight);
      console.log('       - Background:', styles1.backgroundColor);
      console.log('       - Border-radius:', styles1.borderRadius);
      console.log('');

      // Verificar si tiene clases fluid
      const hasFluidClasses1 = classes1?.includes('h-fluid-3xl') && classes1?.includes('px-fluid-lg');
      console.log('     ✅ Tiene clases fluid:', hasFluidClasses1 ? 'SÍ' : 'NO ❌');
      console.log('');
    }

    // Cerrar modal o continuar flujo
    await page.locator('button:has-text("Siguiente")').click();
    await page.waitForTimeout(500);
  }

  // 2. CONTINUAR HASTA LLEGAR AL MODO DE CONTEO
  console.log('📋 PASO 2: Navegando al modo de conteo guiado\n');

  // Completar wizard si es necesario
  // ... (código adicional para completar el wizard)

  // 3. ABRIR GUIDED INSTRUCTIONS MODAL
  console.log('📋 PASO 3: GuidedInstructionsModal\n');

  // Buscar y clickear botón que abre el modal de instrucciones
  const guidedButton = await page.locator('button:has-text("Modo Guiado")').first();
  if (await guidedButton.isVisible()) {
    await guidedButton.click();
    await page.waitForTimeout(1000);

    // Inspeccionar botón Cancelar en GuidedInstructionsModal
    const cancelButton2 = await page.locator('button:has-text("Cancelar")').first();

    if (await cancelButton2.isVisible()) {
      // Obtener clases del DOM
      const classes2 = await cancelButton2.getAttribute('class');
      console.log('  🔍 Botón "Cancelar" - GuidedInstructionsModal:');
      console.log('     Classes DOM:', classes2?.substring(0, 150) + '...');

      // Obtener computed styles
      const styles2 = await cancelButton2.evaluate(el => {
        const computed = window.getComputedStyle(el);
        return {
          height: computed.height,
          paddingLeft: computed.paddingLeft,
          paddingRight: computed.paddingRight,
          backgroundColor: computed.backgroundColor,
          borderRadius: computed.borderRadius
        };
      });

      console.log('     Computed Styles:');
      console.log('       - Height:', styles2.height);
      console.log('       - Padding-left:', styles2.paddingLeft);
      console.log('       - Padding-right:', styles2.paddingRight);
      console.log('       - Background:', styles2.backgroundColor);
      console.log('       - Border-radius:', styles2.borderRadius);
      console.log('');

      // Verificar si tiene clases fluid
      const hasFluidClasses2 = classes2?.includes('h-fluid-3xl') && classes2?.includes('px-fluid-lg');
      console.log('     ✅ Tiene clases fluid:', hasFluidClasses2 ? 'SÍ' : 'NO ❌');
      console.log('');
    }
  }

  console.log('═══════════════════════════════════════════\n');
  console.log('🏁 INSPECCIÓN COMPLETADA\n');

  // Mantener browser abierto para inspección manual
  console.log('⚠️  Browser permanecerá abierto. Cierra manualmente cuando termines.\n');

  // await browser.close();
})();