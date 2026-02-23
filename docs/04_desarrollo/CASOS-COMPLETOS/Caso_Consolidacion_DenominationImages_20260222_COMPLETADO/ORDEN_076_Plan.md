# ORDEN TECNICA #076-UTILS-ONERROR-TDD
## TDD Baseline: Confirmar tests existentes y escribir Suite 4 fallida para onError

**Fecha:** 2026-02-22
**Prioridad:** ALTA
**Modulos:** `src/utils/denomination-images.tsx`, `src/utils/__tests__/denomination-images.test.tsx`
**Meta:** Suite 4 escrita, confirmada FALLANDO, commitada — baseline TDD limpio para implementar onError (DACC D-03)

---

## 0) PRINCIPIO DE ESTA ORDEN

Esta orden abre el caso de consolidación `Caso_Consolidacion_DenominationImages_20260222`.

**Contexto:** La DACC identificó que `getDenominationImageElement()` en `denomination-images.tsx` NO tiene el handler `onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}` que sí tienen `DeliveryFieldView` y `GuidedFieldView`. Antes de agregar ese handler, la Directiva D-03 exige: **test que falle primero, implementación después.**

Esta orden cubre únicamente el paso de TDD previo:
1. Verificar que el estado base (Suites 1, 2, 3) está limpio.
2. Escribir la Suite 4 que verifica el comportamiento `onError`.
3. Confirmar que la Suite 4 **FALLA** (porque `onError` no existe aún).
4. Hacer commit del test fallido.

**STOP condition:** Si Suite 3 falla en la Tarea A, detenerse completamente y reportar. No continuar hasta resolver.

---

## 1) ENTREGABLES OBLIGATORIOS (DOCS)

1) `docs/04_desarrollo/Caso_Consolidacion_DenominationImages_20260222/ORDEN_076_Plan.md` — Esta orden (ya creada por el Director)
2) `src/utils/__tests__/denomination-images.test.tsx` — Archivo de tests modificado con Suite 4 agregada

---

## 2) TAREA A — Confirmar baseline: Suites 1-3 pasan, TypeScript limpio

### Objetivo
Verificar que el estado del repositorio es el esperado antes de tocar nada. Dos condiciones deben cumplirse:
- Las tres suites existentes (Suite 1, 2, 3) pasan en Docker.
- TypeScript no tiene errores.

### Cambios requeridos
Ninguno. Esta tarea es de solo lectura / verificación.

Comandos a ejecutar (en orden):

```bash
./Scripts/docker-test-commands.sh test src/utils/__tests__/denomination-images.test.tsx
```

```bash
npx tsc --noEmit
```

### Criterio de aceptacion
- Suites 1, 2 y 3 reportan `✓ pass` o equivalente en la salida de Vitest.
- `npx tsc --noEmit` devuelve 0 errores.
- **Si Suite 3 falla → STOP. No continuar con Tarea B. Reportar al Director.**

---

## 3) TAREA B — Agregar Suite 4 al archivo de tests (test que debe FALLAR)

### Objetivo
Agregar la Suite 4 `getDenominationImageElement — onError fallback` al archivo de tests. Ejecutar y confirmar que **FALLA** porque `onError` no existe en el código de producción todavía.

### Cambios requeridos

**Archivo:** `src/utils/__tests__/denomination-images.test.tsx`

**Cambio 1 — Modificar la línea de imports de `@testing-library/react`:**

Localizar la línea que importa `render` de `@testing-library/react` y agregar `fireEvent`:

```typescript
// ANTES:
import { render } from '@testing-library/react';

// DESPUÉS:
import { render, fireEvent } from '@testing-library/react';
```

**Cambio 2 — Agregar Suite 4 al final del archivo** (después de la Suite 3, antes del cierre del archivo):

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

### Criterio de aceptacion
- Al ejecutar `./Scripts/docker-test-commands.sh test src/utils/__tests__/denomination-images.test.tsx`, la Suite 4 **FALLA** con un mensaje que indica que `img.src` no contiene `placeholder.svg`.
- Las Suites 1, 2 y 3 siguen pasando (`✓` sin cambios).
- **Si Suite 4 pasa sin haber modificado `denomination-images.tsx` → STOP. Algo está mal. Reportar al Director antes de continuar.**

---

## 4) TAREA C — Commit del test fallido

### Objetivo
Registrar el estado TDD en git: test escrito y confirmado como fallido. Esto es evidencia de cumplimiento de DACC D-03.

### Cambios requeridos

```bash
git add src/utils/__tests__/denomination-images.test.tsx
git commit -m "test(denomination-images): add failing Suite 4 for onError fallback (TDD - DACC D-03)

- Adds Suite 4: verifies that getDenominationImageElement() has onError
  that changes src to /placeholder.svg on image load failure
- Test intentionally FAILS: onError not yet implemented in denomination-images.tsx
- Compliance with DACC Directive D-03 (TDD mandatory before implementation)
- fireEvent import added to @testing-library/react imports

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

### Criterio de aceptacion
- `git log --oneline -1` muestra el commit con el mensaje `test(denomination-images): add failing Suite 4...`
- `git status` muestra working tree clean.

---

## 5) SMOKE TESTS (OBLIGATORIOS)

### S0: Baseline limpio antes de tocar nada
- Ejecutar: `./Scripts/docker-test-commands.sh test src/utils/__tests__/denomination-images.test.tsx`
- Resultado esperado: 3 suites passing, 0 failing
- **STOP si falla Suite 3**

### S1: TypeScript sin errores pre-cambio
- Ejecutar: `npx tsc --noEmit`
- Resultado esperado: 0 errors, 0 warnings

### S2: Suite 4 falla correctamente
- Ejecutar: `./Scripts/docker-test-commands.sh test src/utils/__tests__/denomination-images.test.tsx`
- Resultado esperado: Suites 1, 2, 3 → `✓ pass` | Suite 4 → `✗ fail`
- El mensaje de fallo debe ser algo como: `expect(img.src).toContain('placeholder.svg')` con el src actual que NO contiene `placeholder.svg`

### S3: TypeScript sin errores post-cambio
- Ejecutar: `npx tsc --noEmit`
- Resultado esperado: 0 errors (el test usa tipos correctos, `HTMLImageElement` está bien tipado)

---

## 6) VEREDICTO DE CIERRE

- **PASS:** S0 ✓, S1 ✓, Suite 4 falla correctamente ✓, S3 ✓, commit creado ✓
- **PARCIAL:** S0 y S1 pasan, Suite 4 se escribió, pero TypeScript tiene errores en S3 → reportar al Director antes de commit
- **FAIL:** Suite 3 falla en S0, o Suite 4 pasa sin implementación (estado inconsistente) → STOP y reportar al Director

---

## 7) NOTAS DE HIGIENE

- Cero `any` en TypeScript. El cast `as HTMLImageElement` es correcto y necesario (querySelector retorna `Element | null`).
- No agregar lógica de producción en esta orden. Solo el archivo de tests se modifica.
- No ejecutar `./Scripts/docker-test-commands.sh test` completo (todos los tests) — solo el archivo específico para mantener el ciclo rápido.
- Si hay dudas sobre si Suite 4 debe fallar o no: leer `src/utils/denomination-images.tsx` y verificar que `getDenominationImageElement()` NO tiene `onError` en el JSX del `<img>`. Si lo tiene, reportar al Director — el estado sería inesperado.

---

**Referencia al plan completo:** `docs/plans/2026-02-22-consolidacion-denomination-images.md`
**Caso completo:** `docs/04_desarrollo/Caso_Consolidacion_DenominationImages_20260222/`
