# Consolidación denomination-images.tsx — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Eliminar la duplicación de las 11 rutas de imágenes de denominaciones en `DeliveryFieldView.tsx` y `GuidedFieldView.tsx`, consolidando en `DENOMINATION_IMAGE_MAP` como single source of truth, y agregar el `onError` fallback faltante en `denomination-images.tsx`.

**Architecture:** Se agrega `onError` a `getDenominationImageElement()`. Los `getIcon()` de los componentes se refactorizan para importar `DENOMINATION_IMAGE_MAP` directamente y construir sus propios `<img>` con CSS específicos de contexto. Los 4 logos electrónicos de GuidedFieldView se preservan intactos con early returns.

**Tech Stack:** React 18, TypeScript (strict, zero `any`), Vitest + Testing Library, `@testing-library/react` `fireEvent`

---

## Pre-requisitos

Antes de comenzar, ejecutar:
```bash
./Scripts/docker-test-commands.sh test src/utils/__tests__/denomination-images.test.tsx
```
Confirmar que Suite 1 y Suite 2 pasan, y **Suite 3 también pasa** (archivos físicos presentes).
Si Suite 3 falla → STOP. No continuar hasta resolver la existencia de los archivos.

---

## Task 0: Confirmar estado de tests actuales

**Files:**
- Read: `src/utils/__tests__/denomination-images.test.tsx`
- Read: `src/utils/denomination-images.tsx`

**Step 1: Ejecutar tests actuales**

```bash
./Scripts/docker-test-commands.sh test src/utils/__tests__/denomination-images.test.tsx
```

Expected: Suite 1 ✅, Suite 2 ✅, Suite 3 ✅ (3/3 suites passing)

**Step 2: Confirmar TypeScript limpio**

```bash
npx tsc --noEmit
```

Expected: 0 errors

---

## Task 1: Test TDD — Suite 4 onError (DACC D-03)

> **Esta task implementa la Directiva D-03 de la DACC: test que falla ANTES de la implementación.**

**Files:**
- Modify: `src/utils/__tests__/denomination-images.test.tsx`

**Step 1: Agregar import `fireEvent` al archivo de tests**

En la línea de imports de `@testing-library/react`, agregar `fireEvent`:

```typescript
import { render, fireEvent } from '@testing-library/react';
```

**Step 2: Agregar Suite 4 al final del archivo**

```typescript
// ── Suite 4: onError fallback ────────────────────────────
describe('getDenominationImageElement — onError fallback', () => {
  it('el <img> tiene onError que cambia src a /placeholder.svg al fallar', () => {
    const element = getDenominationImageElement('penny', 'Un centavo');
    expect(element).not.toBeNull();
    const { container } = render(<>{element}</>);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).not.toBeNull();
    // Simular error de carga de imagen
    fireEvent.error(img);
    // El src debe cambiar a /placeholder.svg
    expect(img.src).toContain('placeholder.svg');
  });
});
```

**Step 3: Ejecutar el test nuevo — debe FALLAR**

```bash
./Scripts/docker-test-commands.sh test src/utils/__tests__/denomination-images.test.tsx
```

Expected: Suite 4 FAIL — `expect(img.src).toContain('placeholder.svg')` falla porque
`onError` no existe y el src no cambia.

> **Si el test pasa sin hacer nada**, algo está mal — revisar que el `onError` realmente
> no existe en `denomination-images.tsx` antes de continuar.

**Step 4: Commit del test fallido**

```bash
git add src/utils/__tests__/denomination-images.test.tsx
git commit -m "test(denomination-images): add failing Suite 4 for onError fallback (TDD - DACC D-03)"
```

---

## Task 2: Implementar onError en denomination-images.tsx

**Files:**
- Modify: `src/utils/denomination-images.tsx`

**Step 1: Agregar `onError` al `<img>` en `getDenominationImageElement()`**

Localizar el return del `<img>` (aproximadamente líneas 75–85) y agregar el handler:

```typescript
// ANTES:
return (
  <img
    src={imagePath}
    alt={label}
    className={className}
    loading="lazy"
    decoding="async"
  />
);

// DESPUÉS:
return (
  <img
    src={imagePath}
    alt={label}
    className={className}
    loading="lazy"
    decoding="async"
    onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
  />
);
```

**Step 2: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors

**Step 3: Ejecutar Suite 4 — debe PASAR**

```bash
./Scripts/docker-test-commands.sh test src/utils/__tests__/denomination-images.test.tsx
```

Expected: Suite 1 ✅, Suite 2 ✅, Suite 3 ✅, Suite 4 ✅ (4/4 suites passing)

**Step 4: Ejecutar tests completos — verificar sin regressions**

```bash
./Scripts/docker-test-commands.sh test
```

Expected: Todos los tests pasando (mismo número que antes + 1 nuevo)

**Step 5: Commit**

```bash
git add src/utils/denomination-images.tsx src/utils/__tests__/denomination-images.test.tsx
git commit -m "fix(denomination-images): add onError fallback to getDenominationImageElement

- Adds onError handler: on image load failure, src changes to /placeholder.svg
- Matches behavior of DeliveryFieldView and GuidedFieldView getIcon() functions
- TDD: Suite 4 test written first (DACC D-03 compliance)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 3: Migrar DeliveryFieldView.tsx

**Files:**
- Modify: `src/components/cash-counting/DeliveryFieldView.tsx`

**Step 1: Agregar import de DENOMINATION_IMAGE_MAP**

Localizar los imports existentes (inicio del archivo) y agregar:

```typescript
import { DENOMINATION_IMAGE_MAP } from '@/utils/denomination-images';
import type { CashCount } from '@/types/cash';
```

> Nota: Si `CashCount` ya está importado (es probable), no duplicar el import.

**Step 2: Reemplazar la función `getIcon()` (líneas 173–238)**

```typescript
// 🤖 [IA] - Consolidación denomination-images: Usa DENOMINATION_IMAGE_MAP
// en lugar de mapa local duplicado. Ver: docs/04_desarrollo/Caso_Consolidacion_DenominationImages_20260222/
const getIcon = (): React.ReactNode => {
  const isCoin = ['penny', 'nickel', 'dime', 'quarter', 'dollarCoin']
    .includes(currentFieldName);
  const imagePath = DENOMINATION_IMAGE_MAP[currentFieldName as keyof CashCount];

  if (!imagePath) return null;

  if (isCoin) {
    return (
      <img
        src={imagePath}
        alt={label}
        className="object-contain"
        style={{ width: 'clamp(234.375px, 58.59vw, 390.625px)', aspectRatio: '2.4 / 1' }}
        loading="lazy"
        decoding="async"
        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
      />
    );
  }

  return (
    <img
      src={imagePath}
      alt={label}
      className="object-contain w-full h-full"
      loading="lazy"
      decoding="async"
      onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
    />
  );
};
```

**Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors

**Step 4: Ejecutar tests completos**

```bash
./Scripts/docker-test-commands.sh test
```

Expected: Todos los tests pasando (sin regressions)

**Step 5: Commit**

```bash
git add src/components/cash-counting/DeliveryFieldView.tsx
git commit -m "refactor(DeliveryFieldView): replace local getIcon() imageMap with DENOMINATION_IMAGE_MAP

- Removes 66-line local imageMap duplication (lines 173-238)
- Uses DENOMINATION_IMAGE_MAP from denomination-images.tsx as single source of truth
- Preserves all CSS behavior: coin clamp + aspectRatio, bill w-full h-full
- Preserves onError fallback to /placeholder.svg
- No functional changes: same images, same CSS, same behavior

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 4: Migrar GuidedFieldView.tsx

**Files:**
- Modify: `src/components/cash-counting/GuidedFieldView.tsx`

**Step 1: Agregar import de DENOMINATION_IMAGE_MAP**

```typescript
import { DENOMINATION_IMAGE_MAP } from '@/utils/denomination-images';
import type { CashCount } from '@/types/cash';
```

> Nota: Si `CashCount` ya está importado, no duplicar.

**Step 2: Reemplazar la sección de denominaciones en `getIcon()` (líneas 192–304)**

La estructura resultante debe ser:

```typescript
// 🤖 [IA] - Consolidación denomination-images: Logos electrónicos preservados.
// Denominaciones usan DENOMINATION_IMAGE_MAP. Ver: docs/04_desarrollo/Caso_Consolidacion_DenominationImages_20260222/
const getIcon = (): React.ReactNode => {
  // ── Logos de pagos electrónicos (NO son keyof CashCount — NO migrar) ──
  if (currentFieldName === 'credomatic') {
    return (
      <img
        src="/bac-logo.webp"
        alt="Credomatic"
        className="object-contain w-full h-full"
        loading="lazy"
        decoding="async"
      />
    );
  }
  if (currentFieldName === 'promerica') {
    return (
      <img
        src="/banco promerica logo.png"
        alt="Banco Promerica"
        className="object-contain w-full h-full"
        loading="lazy"
        decoding="async"
      />
    );
  }
  if (currentFieldName === 'bankTransfer') {
    return (
      <img
        src="/transferencia-bancaria.png"
        alt="Transferencia bancaria"
        className="object-contain w-full h-full"
        loading="lazy"
        decoding="async"
      />
    );
  }
  if (currentFieldName === 'paypal') {
    return (
      <img
        src="/paypal-logo.png"
        alt="PayPal"
        className="object-contain w-full h-full"
        loading="lazy"
        decoding="async"
      />
    );
  }

  // ── Denominaciones de efectivo: usa DENOMINATION_IMAGE_MAP ──
  const isCoin = ['penny', 'nickel', 'dime', 'quarter', 'dollarCoin']
    .includes(currentFieldName);
  const imagePath = DENOMINATION_IMAGE_MAP[currentFieldName as keyof CashCount];

  if (!imagePath) return null;

  if (isCoin) {
    return (
      <img
        src={imagePath}
        alt={label}
        className="object-contain"
        style={{ width: 'clamp(234.375px, 58.59vw, 390.625px)', aspectRatio: '2.4 / 1' }}
        loading="lazy"
        decoding="async"
        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
      />
    );
  }

  return (
    <img
      src={imagePath}
      alt={label}
      className="object-contain w-full h-full"
      loading="lazy"
      decoding="async"
      onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
    />
  );
};
```

> **CRÍTICO:** Verificar que los 4 logos electrónicos en el código original tengan
> exactamente los mismos atributos CSS y no-onError behavior que el código actual.
> Si el código original tiene atributos adicionales (ej: `width`, `height`), preservarlos.

**Step 3: Verificar TypeScript**

```bash
npx tsc --noEmit
```

Expected: 0 errors

**Step 4: Ejecutar tests completos**

```bash
./Scripts/docker-test-commands.sh test
```

Expected: Todos los tests pasando

**Step 5: Commit**

```bash
git add src/components/cash-counting/GuidedFieldView.tsx
git commit -m "refactor(GuidedFieldView): replace local getIcon() imageMap with DENOMINATION_IMAGE_MAP

- Removes 113-line local imageMap duplication (lines 192-304)
- Uses DENOMINATION_IMAGE_MAP from denomination-images.tsx as single source of truth
- Preserves all 4 electronic payment logos (credomatic, promerica, bankTransfer, paypal)
  unchanged — these are not keyof CashCount
- Preserves all CSS behavior: coin clamp + aspectRatio, bill w-full h-full
- Preserves onError fallback to /placeholder.svg for denominations
- No functional changes: same images, same CSS, same behavior

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Task 5: Documentación final (DACC D-01 y D-02)

**Files:**
- Modify: `CLAUDE.md` (en raíz del proyecto — el historial de sesión)
- Modify: `docs/04_desarrollo/Caso_Consolidacion_DenominationImages_20260222/00_README.md` (actualizar estado)

**Step 1: Actualizar estado del caso en 00_README.md**

Cambiar:
```
| **Estado** | 🔵 Planificado — Esperando aprobación DIRM |
```
A:
```
| **Estado** | ✅ Completado |
```

Y completar la tabla de criterios de éxito marcando todos como `[x]`.

**Step 2: Agregar entrada en CLAUDE.md del proyecto**

Agregar una entrada de versión que documente:
- Fecha: 2026-02-22
- Qué se hizo: Consolidación de denomination-images, onError added, getIcon() migrated
- Archivos modificados
- Tests: X/X passing
- TypeScript: 0 errors

**Step 3: Ejecutar Docker tests finales**

```bash
./Scripts/docker-test-commands.sh test
```

Capturar el output completo (número de tests, timing).

**Step 4: Commit final de documentación**

```bash
git add CLAUDE.md docs/04_desarrollo/Caso_Consolidacion_DenominationImages_20260222/00_README.md
git commit -m "docs: update CLAUDE.md and close Caso_Consolidacion_DenominationImages_20260222

- Marks case as completed in 00_README.md
- Adds CLAUDE.md entry for denomination-images consolidation work
- All success criteria met: onError added, 2 components migrated, tests passing

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Resumen de Commits del Plan

| Orden | Commit | Archivos |
|-------|--------|---------|
| 0 | `test: add failing Suite 4 for onError (TDD)` | `denomination-images.test.tsx` |
| 1 | `fix: add onError fallback to getDenominationImageElement` | `denomination-images.tsx`, `denomination-images.test.tsx` |
| 2 | `refactor(DeliveryFieldView): replace local getIcon() imageMap` | `DeliveryFieldView.tsx` |
| 3 | `refactor(GuidedFieldView): replace local getIcon() imageMap` | `GuidedFieldView.tsx` |
| 4 | `docs: close Caso_Consolidacion_DenominationImages_20260222` | `CLAUDE.md`, `00_README.md` |

---

## Rollback Plan

Si algo sale mal en cualquier fase:
```bash
git log --oneline -10  # Ver commits recientes
git revert HEAD        # Revertir último commit
```

O revertir al estado antes de este plan:
```bash
git revert HEAD~N      # Donde N = número de commits a revertir
```
