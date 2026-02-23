# Módulo Correctivo H3: E2E Smoke Test Roto

| Campo     | Valor                              |
|-----------|------------------------------------|
| Severidad | 🟠 Alto                            |
| Estado    | 🔴 Pendiente                       |
| Tipo      | Test E2E / Playwright              |
| Archivo   | `e2e/tests/smoke.spec.ts`          |

---

## Hallazgo Original

> Falla por selector ambiguo en smoke.spec.ts (line 18) (`locator('text=/corte/i')` en strict mode). Resultado: 1/2 tests failed en `npm run test:e2e:smoke`.

## Root Cause

El selector `text=/corte/i` es un regex demasiado amplio que:
1. Matchea cualquier texto conteniendo "corte" (substring)
2. En strict mode de Playwright, si hay múltiples matches, falla
3. A medida que crece la UI, probabilidad de colisión aumenta

## Código Problemático

```typescript
// e2e/tests/smoke.spec.ts ~ línea 18
const hasDeliveryOption = await page.locator('text=/corte/i').isVisible();
```

## Estrategia Correctiva

### Opción A: Selector por texto exacto (Recomendada)

```typescript
const hasDeliveryOption = await page.locator('text=Corte de Caja').isVisible();
```

**Ventaja:** Específico, no ambiguo, legible.
**Riesgo:** Si el texto UI cambia, el test rompe (aceptable — es un smoke test).

### Opción B: Selector por `data-testid`

```typescript
const hasDeliveryOption = await page.locator('[data-testid="operation-card-cut"]').isVisible();
```

**Ventaja:** Desacoplado del texto UI.
**Desventaja:** Requiere agregar `data-testid` al componente.

### Opción C: Selector por rol + nombre

```typescript
const hasDeliveryOption = await page.getByRole('button', { name: /corte de caja/i }).isVisible();
```

**Ventaja:** Semántico y específico.
**Dependencia:** Requiere que H2 (accesibilidad) se resuelva primero (tarjetas como `button`).

### Decisión: **Opción C** si H2 se resuelve primero, **Opción A** como fallback

## Plan de Ejecución

### Paso 1: Auditar todos los selectores del smoke test

Revisar las 3 líneas de selectores (líneas ~17-19) para identificar otros posibles ambiguos.

### Paso 2: Reemplazar selectores

```typescript
// ANTES:
const hasOperationSelector = await page.locator('text=/selecciona/i').isVisible();
const hasDeliveryOption = await page.locator('text=/corte/i').isVisible();
const hasMorningOption = await page.locator('text=/matutino/i').isVisible();

// DESPUÉS (con H2 resuelto):
const hasOperationSelector = await page.getByRole('heading', { name: /selecciona/i }).isVisible();
const hasDeliveryOption = await page.getByRole('button', { name: /corte de caja/i }).isVisible();
const hasMorningOption = await page.getByRole('button', { name: /conteo matutino/i }).isVisible();
```

### Paso 3: Validar

```bash
npm run test:e2e:smoke  # Debe pasar 2/2
```

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `e2e/tests/smoke.spec.ts` | Reemplazar 3 selectores regex por selectores estables |

## Criterio de Aceptación

- [ ] `npm run test:e2e:smoke` pasa 2/2 (o 100%)
- [ ] Selectores no usan regex parciales (`/corte/i`)
- [ ] Selectores son específicos (texto exacto, rol, o testid)
- [ ] No se introducen nuevas dependencias
