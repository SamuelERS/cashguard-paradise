# ORDEN TECNICA #077-UTILS-ONERROR-IMPL
## TDD Green Phase: Implementar onError en getDenominationImageElement (Suite 4 debe PASAR)

**Fecha:** 2026-02-22
**Prioridad:** ALTA
**Modulos:** `src/utils/denomination-images.tsx`, `src/utils/__tests__/denomination-images.test.tsx`
**Meta:** Suite 4 pasa, 4/4 suites verdes, commit de implementación — TDD cycle completo (RED → GREEN)

---

## 0) PRINCIPIO DE ESTA ORDEN

**Contexto TDD:**
- OT #076 completó la fase RED: Suite 4 escrita, confirmada FALLANDO, commitada.
- Esta orden es la fase GREEN: agregar `onError` a `getDenominationImageElement()` para que Suite 4 pase.
- La DACC D-03 se satisface en la secuencia: test fallido (OT #076) → implementación (esta OT).

**Cambio requerido (quirúrgico):**
Agregar exactamente UNA línea al `<img>` de `getDenominationImageElement()` en `denomination-images.tsx`:
```
onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
```

Esta línea sincroniza el comportamiento de `denomination-images.tsx` con `DeliveryFieldView` y
`GuidedFieldView`, que ya tienen este handler desde antes.

**STOP conditions:**
- Si Tarea A muestra que Suite 4 YA PASA (sin haber tocado código) → STOP. Reportar al Director.
- Si después de implementar el cambio Suite 4 SIGUE FALLANDO → STOP. Reportar al Director con el
  output completo del error.
- Si `npx tsc --noEmit` reporta errores en cualquier punto → STOP. Reportar al Director.

---

## 1) ENTREGABLES OBLIGATORIOS (DOCS)

1) `docs/04_desarrollo/Caso_Consolidacion_DenominationImages_20260222/ORDEN_077_Plan.md` — Esta orden
2) `src/utils/denomination-images.tsx` — Archivo modificado con `onError` agregado

---

## 2) TAREA A — Pre-condición: Confirmar Suite 4 sigue FALLANDO antes de tocar código

### Objetivo
Verificar que el estado del repositorio es el esperado antes de implementar. Suite 4 debe seguir
fallando exactamente como la dejó OT #076.

### Cambios requeridos
Ninguno. Esta tarea es de solo verificación.

### Comandos a ejecutar

**Opción 1 (preferida — si Docker está disponible):**
```bash
./Scripts/docker-test-commands.sh test src/utils/__tests__/denomination-images.test.tsx
```

**Opción 2 (fallback — si Docker no está disponible):**
```bash
npx vitest run src/utils/__tests__/denomination-images.test.tsx
```

Registrar cuál opción se usó en el reporte final.

### Criterio de aceptación
- Suites 1, 2, 3: pasan (7 tests ✓)
- Suite 4: **FALLA** con mensaje similar a:
  `expected '...moneda-centavo-front-inlay.webp' to contain 'placeholder.svg'`
- **Si Suite 4 PASA → STOP. Reportar al Director antes de continuar.**

---

## 3) TAREA B — Implementar onError en denomination-images.tsx

### Objetivo
Agregar el handler `onError` al `<img>` de `getDenominationImageElement()`. Es un cambio de 1 línea
que hace que Suite 4 pase.

### Cambios requeridos

**Archivo:** `src/utils/denomination-images.tsx`

**Localizar el bloque return (aproximadamente líneas 79–87):**

```typescript
// ANTES — estado actual del archivo:
  return (
    <img
      src={imageSrc}
      alt={label}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
```

**Reemplazar por:**

```typescript
// DESPUÉS — agregar onError como última prop antes del cierre />:
  return (
    <img
      src={imageSrc}
      alt={label}
      className={className}
      loading="lazy"
      decoding="async"
      onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
    />
  );
```

**Regla estricta:** Solo se agrega esa línea. No modificar ninguna otra parte del archivo.
No cambiar el JSDoc, no reformatear, no tocar `DENOMINATION_IMAGE_MAP`.

### Verificar TypeScript después del cambio
```bash
npx tsc --noEmit
```
Resultado esperado: 0 errores.

### Ejecutar tests con las 4 suites
```bash
./Scripts/docker-test-commands.sh test src/utils/__tests__/denomination-images.test.tsx
```
O si Docker no está disponible:
```bash
npx vitest run src/utils/__tests__/denomination-images.test.tsx
```

### Criterio de aceptación
- Suite 1: ✓ pass (2 tests)
- Suite 2: ✓ pass (4 tests)
- Suite 3: ✓ pass (1 test)
- Suite 4: ✓ **PASA** — `el <img> tiene onError que cambia src a /placeholder.svg al fallar`
- Total: **8/8 tests passing**
- TypeScript: 0 errores
- **Si Suite 4 sigue fallando → STOP. Reportar al Director con output completo.**

---

## 4) TAREA C — Verificar no-regresiones y hacer commit

### Objetivo
Confirmar que el cambio no rompe nada en el resto del proyecto y crear el commit de implementación.

### Paso 1 — Verificar TypeScript del proyecto completo
```bash
npx tsc --noEmit
```
Resultado esperado: 0 errores.

### Paso 2 — Ejecutar solo el archivo específico (ya completado en Tarea B)
Los 4 suites ya confirmados en Tarea B.

### Paso 3 — Commit
```bash
git add src/utils/denomination-images.tsx
git commit -m "$(cat <<'EOF'
fix(denomination-images): add onError fallback to getDenominationImageElement

- Adds onError handler: on image load failure, src changes to /placeholder.svg
- Matches existing behavior of DeliveryFieldView and GuidedFieldView getIcon()
- TDD: Suite 4 written first in OT #076 (DACC D-03 compliance)
- All 4 test suites passing (8/8 tests)

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

### Verificar commit
```bash
git log --oneline -2
git status
```

### Criterio de aceptación
- `git log --oneline -1` muestra el commit `fix(denomination-images): add onError fallback...`
- `git log --oneline -2` muestra en orden: este commit encima del commit de OT #076
- `git status` muestra working tree limpio (o solo archivos doc pre-existentes no relacionados)

---

## 5) SMOKE TESTS (OBLIGATORIOS)

### S0: Pre-condición — Suite 4 sigue fallando antes de tocar código
- Ejecutar: tests del archivo específico (Tarea A)
- Resultado esperado: 7 passing, 1 failing (Suite 4)
- **STOP si Suite 4 ya pasa**

### S1: TypeScript pre-implementación
- Ejecutar: `npx tsc --noEmit`
- Resultado esperado: 0 errores

### S2: Suite 4 pasa post-implementación
- Ejecutar: tests del archivo específico (Tarea B)
- Resultado esperado: **8/8 passing** (Suites 1, 2, 3, 4 todas verdes)

### S3: TypeScript post-implementación
- Ejecutar: `npx tsc --noEmit`
- Resultado esperado: 0 errores

---

## 6) VEREDICTO DE CIERRE

- **PASS:** S0 ✓ (Suite 4 fallaba), S1 ✓, S2 ✓ (8/8 passing), S3 ✓, commit creado ✓
- **PARCIAL:** S0-S1 ok, S2 ok, pero TypeScript tiene errores en S3 → reportar antes de commit
- **FAIL — opción A:** Suite 4 ya pasaba antes de implementar → estado inconsistente → STOP
- **FAIL — opción B:** Suite 4 sigue fallando después del cambio → bug en implementación → STOP

---

## 7) NOTAS DE HIGIENE

- El cast `as HTMLImageElement` en el test es correcto: `querySelector` retorna `Element | null`,
  el cast es necesario para acceder a `.src`. No es violación de la política zero-`any`.
- No agregar imports innecesarios a `denomination-images.tsx`. El handler `onError` es JSX inline,
  no requiere ningún import adicional.
- No modificar la firma de `getDenominationImageElement()`. Solo se agrega una prop al JSX.
- Si Docker no está disponible: usar `npx vitest run` como fallback y documentarlo en el reporte.
- Esta OT NO toca `DeliveryFieldView.tsx` ni `GuidedFieldView.tsx`. Eso es OT #078 y OT #079.

---

**Referencia al plan completo:** `docs/plans/2026-02-22-consolidacion-denomination-images.md` (Task 2)
**Caso completo:** `docs/04_desarrollo/Caso_Consolidacion_DenominationImages_20260222/`
**OT anterior:** `ORDEN_076_Plan.md` (RED phase — test fallido commitado, hash: 9413df5)
