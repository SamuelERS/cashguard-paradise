# 4. PLAN DE TESTING - Vista Deliveries Pantalla Inicial

**Documento:** 4 de 5 | **Fecha:** 24 Oct 2025 | **Status:** ✅ COMPLETO

---

## 🎯 Objetivo Testing

Garantizar **funcionalidad correcta, performance óptima y UX excepcional** en todos los dispositivos Paradise (360px-430px móviles).

### Cobertura Target
- **Unit tests:** ≥85% coverage
- **Integration tests:** 100% flujos críticos
- **E2E tests:** 5-8 escenarios usuario real
- **Manual testing:** 10 devices mínimo

---

## 🧪 Unit Tests (8-10 tests)

### Suite 1: PinModal Component

**Archivo:** `src/components/ui/__tests__/pin-modal.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PinModal } from '../pin-modal';

describe('PinModal Component', () => {
  const mockProps = {
    isOpen: true,
    onSuccess: vi.fn(),
    onError: vi.fn(),
    onCancel: vi.fn(),
    isLocked: false,
    attempts: 0,
    maxAttempts: 3
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza modal cuando isOpen=true', () => {
    render(<PinModal {...mockProps} />);
    expect(screen.getByText('PIN Supervisor Requerido')).toBeInTheDocument();
  });

  it('NO renderiza modal cuando isOpen=false', () => {
    render(<PinModal {...mockProps} isOpen={false} />);
    expect(screen.queryByText('PIN Supervisor Requerido')).not.toBeInTheDocument();
  });

  it('muestra input PIN con type="password"', () => {
    render(<PinModal {...mockProps} />);
    const input = screen.getByPlaceholderText(/Ingrese PIN/i);
    expect(input).toHaveAttribute('type', 'password');
    expect(input).toHaveAttribute('inputMode', 'numeric');
  });

  it('muestra mensaje bloqueo cuando isLocked=true', () => {
    render(<PinModal {...mockProps} isLocked={true} />);
    expect(screen.getByText('Acceso bloqueado')).toBeInTheDocument();
    expect(screen.getByText(/Reintente en 5 minutos/i)).toBeInTheDocument();
  });

  it('deshabilita botón Validar si PIN < 4 dígitos', () => {
    render(<PinModal {...mockProps} />);
    const button = screen.getByText('Validar');
    expect(button).toBeDisabled();
    
    const input = screen.getByPlaceholderText(/Ingrese PIN/i);
    fireEvent.change(input, { target: { value: '123' } }); // 3 dígitos
    expect(button).toBeDisabled();
    
    fireEvent.change(input, { target: { value: '1234' } }); // 4 dígitos
    expect(button).not.toBeDisabled();
  });

  it('llama onCancel al clickear botón Cancelar', () => {
    render(<PinModal {...mockProps} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(mockProps.onCancel).toHaveBeenCalledTimes(1);
  });

  it('limpia input tras PIN incorrecto', async () => {
    render(<PinModal {...mockProps} />);
    const input = screen.getByPlaceholderText(/Ingrese PIN/i) as HTMLInputElement;
    
    fireEvent.change(input, { target: { value: '9999' } }); // PIN incorrecto
    fireEvent.submit(input.closest('form')!);
    
    await waitFor(() => {
      expect(input.value).toBe(''); // Input limpiado
      expect(mockProps.onError).toHaveBeenCalledTimes(1);
    });
  });

  it('muestra contador intentos restantes', () => {
    render(<PinModal {...mockProps} attempts={1} />);
    expect(screen.getByText('Intentos restantes: 2')).toBeInTheDocument();
  });
});
```

### Suite 2: DeliveryDashboardWrapper

**Archivo:** `src/components/deliveries/__tests__/DeliveryDashboardWrapper.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DeliveryDashboardWrapper } from '../DeliveryDashboardWrapper';

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('DeliveryDashboardWrapper', () => {
  it('muestra PinModal cuando requirePin=true', () => {
    renderWithRouter(<DeliveryDashboardWrapper requirePin={true} />);
    expect(screen.getByText('PIN Supervisor Requerido')).toBeInTheDocument();
  });

  it('muestra Dashboard directamente cuando requirePin=false', () => {
    renderWithRouter(<DeliveryDashboardWrapper requirePin={false} />);
    expect(screen.queryByText('PIN Supervisor Requerido')).not.toBeInTheDocument();
    // Verificar que dashboard se renderiza (buscar algún elemento único)
    expect(screen.getByText('Volver a Operaciones')).toBeInTheDocument();
  });

  it('muestra breadcrumb "Volver a Operaciones"', () => {
    renderWithRouter(<DeliveryDashboardWrapper requirePin={false} />);
    expect(screen.getByText('Volver a Operaciones')).toBeInTheDocument();
  });
});
```

---

## 🔗 Integration Tests (3-5 tests)

### Suite 3: Navegación Completa

**Archivo:** `src/__tests__/integration/delivery-view-navigation.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { OperationSelector } from '@/components/operation-selector/OperationSelector';

describe('Delivery View Navigation Integration', () => {
  it('muestra 3 tarjetas en OperationSelector', () => {
    render(
      <MemoryRouter>
        <OperationSelector onSelectMode={vi.fn()} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Inicio de Turno')).toBeInTheDocument();
    expect(screen.getByText('Fin de Turno')).toBeInTheDocument();
    expect(screen.getByText('Deliveries Pendientes')).toBeInTheDocument();
  });

  it('tarjeta Deliveries Pendientes es clickeable', () => {
    const handleSelectMode = vi.fn();
    
    render(
      <MemoryRouter>
        <OperationSelector onSelectMode={handleSelectMode} />
      </MemoryRouter>
    );
    
    const deliveryCard = screen.getByText('Deliveries Pendientes').closest('div')!;
    fireEvent.click(deliveryCard);
    
    expect(handleSelectMode).toHaveBeenCalledWith('delivery-view');
  });

  it('tarjeta tiene diseño correcto (icon, badge, bullets)', () => {
    render(
      <MemoryRouter>
        <OperationSelector onSelectMode={vi.fn()} />
      </MemoryRouter>
    );
    
    // Badge "COD"
    expect(screen.getByText('COD')).toBeInTheDocument();
    
    // Bullets características
    expect(screen.getByText(/Vista completa de envíos activos/i)).toBeInTheDocument();
    expect(screen.getByText(/Actualizar estados/i)).toBeInTheDocument();
    expect(screen.getByText(/Alertas automáticas/i)).toBeInTheDocument();
  });

  it('aplica animación hover (Framer Motion)', () => {
    render(
      <MemoryRouter>
        <OperationSelector onSelectMode={vi.fn()} />
      </MemoryRouter>
    );
    
    const card = screen.getByText('Deliveries Pendientes').closest('div')!;
    expect(card).toHaveAttribute('style'); // Verifica que tiene estilos inline
  });
});
```

### Suite 4: Flujo PIN Completo

**Archivo:** `src/__tests__/integration/pin-validation-flow.test.tsx`

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DeliveryDashboardWrapper } from '@/components/deliveries/DeliveryDashboardWrapper';

describe('PIN Validation Flow', () => {
  it('flujo completo: PIN correcto → Dashboard visible', async () => {
    render(
      <BrowserRouter>
        <DeliveryDashboardWrapper requirePin={true} />
      </BrowserRouter>
    );
    
    // 1. Modal PIN visible
    expect(screen.getByText('PIN Supervisor Requerido')).toBeInTheDocument();
    
    // 2. Ingresar PIN correcto (ejemplo: 1234)
    const input = screen.getByPlaceholderText(/Ingrese PIN/i);
    fireEvent.change(input, { target: { value: '1234' } });
    
    // 3. Submit
    fireEvent.submit(input.closest('form')!);
    
    // 4. Dashboard debe aparecer
    await waitFor(() => {
      expect(screen.getByText('Volver a Operaciones')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('PIN incorrecto: incrementa contador intentos', async () => {
    render(
      <BrowserRouter>
        <DeliveryDashboardWrapper requirePin={true} />
      </BrowserRouter>
    );
    
    const input = screen.getByPlaceholderText(/Ingrese PIN/i);
    
    // Intento 1: PIN incorrecto
    fireEvent.change(input, { target: { value: '9999' } });
    fireEvent.submit(input.closest('form')!);
    
    await waitFor(() => {
      expect(screen.getByText('Intentos restantes: 2')).toBeInTheDocument();
    });
  });
});
```

---

## 🌐 E2E Tests (5-8 scenarios)

### Herramientas
- **Playwright** (recomendado para PWA)
- Configuración: `e2e/playwright.config.ts`

### E2E-01: Flujo Usuario Completo Sin PIN

**Archivo:** `e2e/tests/delivery-view-access.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Delivery View - Acceso Sin PIN', () => {
  test('usuario accede a deliveries desde pantalla inicial', async ({ page }) => {
    // 1. Abrir PWA
    await page.goto('/');
    
    // 2. Verificar pantalla inicial
    await expect(page.locator('text=Seleccione Operación')).toBeVisible();
    
    // 3. Verificar 3 tarjetas
    await expect(page.locator('text=Inicio de Turno')).toBeVisible();
    await expect(page.locator('text=Fin de Turno')).toBeVisible();
    await expect(page.locator('text=Deliveries Pendientes')).toBeVisible();
    
    // 4. Click tarjeta Deliveries
    await page.locator('text=Deliveries Pendientes').click();
    
    // 5. Verificar navegación (si PIN deshabilitado)
    await expect(page).toHaveURL('/deliveries-pending');
    
    // 6. Verificar dashboard visible
    await expect(page.locator('text=Volver a Operaciones')).toBeVisible();
  });
});
```

### E2E-02: Flujo Con PIN Correcto

```typescript
test('usuario valida PIN correctamente', async ({ page }) => {
  await page.goto('/');
  
  // Click tarjeta
  await page.locator('text=Deliveries Pendientes').click();
  
  // Modal PIN aparece
  await expect(page.locator('text=PIN Supervisor Requerido')).toBeVisible();
  
  // Ingresar PIN (test: 1234)
  await page.fill('input[type="password"]', '1234');
  await page.click('text=Validar');
  
  // Dashboard visible
  await expect(page.locator('text=Volver a Operaciones')).toBeVisible({ timeout: 5000 });
});
```

### E2E-03: Bloqueo Tras 3 Intentos

```typescript
test('bloquea acceso tras 3 intentos fallidos', async ({ page }) => {
  await page.goto('/');
  await page.locator('text=Deliveries Pendientes').click();
  
  // 3 intentos con PIN incorrecto
  for (let i = 0; i < 3; i++) {
    await page.fill('input[type="password"]', '9999');
    await page.click('text=Validar');
    await page.waitForTimeout(500);
  }
  
  // Mensaje bloqueo
  await expect(page.locator('text=Acceso bloqueado')).toBeVisible();
  await expect(page.locator('text=Reintente en 5 minutos')).toBeVisible();
});
```

### E2E-04: Responsive Mobile

```typescript
test('responsive en móvil 360px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  
  // Tarjetas apiladas verticalmente
  const cards = page.locator('.cursor-pointer.group');
  await expect(cards).toHaveCount(3);
  
  // Click tarjeta Deliveries
  await cards.nth(2).click(); // Tercera tarjeta
  
  // Dashboard responsive
  await expect(page.locator('text=Volver a Operaciones')).toBeVisible();
});
```

### E2E-05: Breadcrumb Navegación

```typescript
test('breadcrumb Volver funciona correctamente', async ({ page }) => {
  await page.goto('/');
  await page.locator('text=Deliveries Pendientes').click();
  
  // Dashboard cargado
  await expect(page.locator('text=Volver a Operaciones')).toBeVisible();
  
  // Click Volver
  await page.click('text=Volver a Operaciones');
  
  // Retorna a OperationSelector
  await expect(page.locator('text=Seleccione Operación')).toBeVisible();
  await expect(page).toHaveURL('/');
});
```

---

## 📱 Manual Testing Checklist

### Devices Requeridos (10 mínimo)

**Móviles (prioridad alta):**
- [ ] iPhone 12 (390x844) - Safari iOS 16
- [ ] iPhone 16 Pro Max (430x932) - Safari iOS 18
- [ ] Samsung A50 (360x740) - Chrome Android 13
- [ ] Samsung Galaxy S21 (360x800) - Chrome Android 14
- [ ] Xiaomi Redmi Note 11 (393x851) - Chrome Android 12

**Tablets:**
- [ ] iPad (768x1024) - Safari iPadOS 17
- [ ] Samsung Tab A (768x1024) - Chrome Android

**Desktop (baja prioridad):**
- [ ] Chrome Windows (1920x1080)
- [ ] Safari macOS (1440x900)
- [ ] Firefox Windows (1920x1080)

### Checklist Funcional

**Pantalla Inicial:**
- [ ] Tarjeta "Deliveries Pendientes" visible
- [ ] Icon Package renderiza correctamente (verde)
- [ ] Badge "COD" visible
- [ ] 3 bullets características legibles
- [ ] Botón "Comenzar" visible
- [ ] Hover effect funciona (desktop)
- [ ] Click ejecuta navegación

**Modal PIN:**
- [ ] Aparece al clickear tarjeta (si requirePin=true)
- [ ] Input type="password" oculta texto
- [ ] inputMode="numeric" muestra teclado numérico (móvil)
- [ ] Botón Validar deshabilitado si <4 dígitos
- [ ] PIN correcto → Dashboard carga
- [ ] PIN incorrecto → Toast error + contador intentos
- [ ] 3 intentos → Bloqueo 5 minutos
- [ ] Botón Cancelar → Retorna a home

**Dashboard:**
- [ ] Breadcrumb "Volver a Operaciones" visible
- [ ] Lista deliveries pendientes carga
- [ ] Búsqueda por cliente funciona
- [ ] Filtros courier funcionan
- [ ] Click delivery → Modal detalles abre
- [ ] Marcar como pagado funciona
- [ ] Cancelar delivery funciona
- [ ] Exportar CSV funciona
- [ ] Alertas >7 días visibles

**Responsive:**
- [ ] Layout correcto 360px (móvil pequeño)
- [ ] Layout correcto 430px (iPhone 16 Pro Max)
- [ ] Layout correcto 768px (tablet)
- [ ] Layout correcto 1920px (desktop)
- [ ] Textos legibles en todos los tamaños
- [ ] Botones touch-friendly (≥44px height)
- [ ] Sin scroll horizontal en ningún device

**Performance:**
- [ ] Carga inicial <2s (Chrome DevTools)
- [ ] Navegación tarjeta → dashboard <1s
- [ ] Animaciones smooth 60fps
- [ ] Sin lag al buscar/filtrar
- [ ] localStorage funciona (persistencia)

---

## 🎯 Criterios de Aceptación Global

### Must-Have (Bloqueantes)
- ✅ Todos los unit tests pasan (100%)
- ✅ Todos los integration tests pasan (100%)
- ✅ Mínimo 5 E2E tests pasan (100%)
- ✅ Testing manual 10 devices OK (100%)
- ✅ TypeScript compila sin errores
- ✅ Zero console errors en runtime
- ✅ Performance <2s carga dashboard

### Should-Have (No bloqueantes pero importantes)
- ✅ Test coverage ≥85%
- ✅ Responsive perfecto 360px-430px-768px
- ✅ Animaciones 60fps consistente
- ✅ Accesibilidad WCAG AA (mínimo)

### Nice-to-Have (Mejoras futuras)
- ⭐ Test coverage ≥95%
- ⭐ E2E tests en CI/CD automático
- ⭐ Visual regression tests (screenshots)
- ⭐ Lighthouse score ≥90

---

## 🐛 Bugs Known (Para documentar si aparecen)

### Template Bug Report

```markdown
**Bug ID:** DV-001
**Severidad:** Alta/Media/Baja
**Componente:** PinModal / Dashboard / Tarjeta
**Descripción:** [Descripción detallada]
**Steps to Reproduce:**
1. Paso 1
2. Paso 2
3. Resultado esperado vs actual

**Device:** iPhone 12 - iOS 16 - Safari
**Screenshot:** [Adjuntar si aplica]
**Workaround:** [Si existe solución temporal]
**Status:** Open / In Progress / Fixed
```

---

## 📊 Reporte Final Testing

### Métricas Target

| Métrica | Target | Actual | Status |
|---------|--------|--------|--------|
| Unit test coverage | ≥85% | ___ % | ⏳ |
| Integration tests passing | 100% | ___ / ___ | ⏳ |
| E2E tests passing | 100% | ___ / 5 | ⏳ |
| Manual devices tested | ≥10 | ___ / 10 | ⏳ |
| Console errors | 0 | ___ | ⏳ |
| Performance (dashboard load) | <2s | ___s | ⏳ |
| TypeScript errors | 0 | ___ | ⏳ |
| ESLint warnings | 0 | ___ | ⏳ |

### Sign-Off

**Developer:** ___________________ **Fecha:** ___________  
**QA Tester:** ___________________ **Fecha:** ___________  
**Product Owner:** _______________ **Fecha:** ___________

---

**Última actualización:** 24 Oct 2025  
**Próximo documento:** [SUGERENCIAS_MEJORAS.md](./SUGERENCIAS_MEJORAS.md)
