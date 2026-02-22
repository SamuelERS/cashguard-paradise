# ORDEN TECNICA #078-DELIVERY-MIGRATION
## Migrar DeliveryFieldView.tsx getIcon() → DENOMINATION_IMAGE_MAP

**Fecha:** 2026-02-22
**Prioridad:** ALTA
**Módulos:** `src/components/cash-counting/DeliveryFieldView.tsx`
**Meta:** Eliminar rutas hardcodeadas duplicadas en getIcon(), usar DENOMINATION_IMAGE_MAP como SSOT, agregar onError a case 'coin'

---

## 0) PRINCIPIO DE ESTA ORDEN

OT #077 completó TDD GREEN: `denomination-images.tsx` tiene DENOMINATION_IMAGE_MAP completo + onError.
Esta OT migra `DeliveryFieldView.tsx` para usar ese SSOT en vez de rutas hardcodeadas duplicadas.

**Cambios requeridos:**
1. Agregar import `DENOMINATION_IMAGE_MAP` desde `@/utils/denomination-images`
2. Reemplazar `case 'coin'` (if/else chains) por lookup en mapa — agregar `onError`
3. Reemplazar `case 'bill'` (if/else chains) por lookup en mapa — actualizar `onError` al estilo nuevo

**STOP conditions:**
- TypeScript reporta errores → STOP
- Tests de regresión fallan → STOP

---

## 1) ENTREGABLES OBLIGATORIOS

1) `src/components/cash-counting/DeliveryFieldView.tsx` — archivo modificado

---

## 2) TAREA A — Implementar cambios

### Archivo: `src/components/cash-counting/DeliveryFieldView.tsx`

**Cambio 1 — Agregar import** (después de la línea que importa `DENOMINATIONS`):
```typescript
import { DENOMINATION_IMAGE_MAP } from '@/utils/denomination-images';
```

**Cambio 2 — Reemplazar `case 'coin'` completo** (bloque ~líneas 175-198):

ANTES:
```typescript
      case 'coin': {
        let coinImage = '/monedas-recortadas-dolares/moneda-centavo-front-inlay.webp';

        if (currentFieldName === 'nickel') {
          coinImage = '/monedas-recortadas-dolares/moneda-cinco-centavos-dos-caras.webp';
        } else if (currentFieldName === 'dime') {
          coinImage = '/monedas-recortadas-dolares/dime.webp';
        } else if (currentFieldName === 'quarter') {
          coinImage = '/monedas-recortadas-dolares/moneda-25-centavos-dos-caras.webp';
        } else if (currentFieldName === 'dollar' || currentFieldName === 'dollarCoin') {
          coinImage = '/monedas-recortadas-dolares/dollar-coin.webp';
        }

        return (
          <img
            src={coinImage}
            alt={`Moneda de ${currentFieldLabel}`}
            className="object-contain"
            style={{
              width: 'clamp(234.375px, 58.59vw, 390.625px)',
              aspectRatio: '2.4 / 1'
            }}
          />
        );
      }
```

DESPUÉS:
```typescript
      case 'coin': {
        // 🤖 [IA] - OT #078: Migrado a DENOMINATION_IMAGE_MAP (SSOT) — eliminada duplicación
        const denomKey = (currentFieldName === 'dollar' ? 'dollarCoin' : currentFieldName) as keyof typeof DENOMINATION_IMAGE_MAP;
        const coinImage = DENOMINATION_IMAGE_MAP[denomKey] ?? DENOMINATION_IMAGE_MAP.penny;

        return (
          <img
            src={coinImage}
            alt={`Moneda de ${currentFieldLabel}`}
            className="object-contain"
            style={{
              width: 'clamp(234.375px, 58.59vw, 390.625px)',
              aspectRatio: '2.4 / 1'
            }}
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
        );
      }
```

**Cambio 3 — Reemplazar `case 'bill'` completo** (bloque ~líneas 200-234):

ANTES:
```typescript
      case 'bill': {
        // 🤖 [IA] - v1.3.7T: Imágenes con fallback a placeholder.svg
        // Rutas originales preservadas para cuando se agreguen assets profesionales
        let billImage = '/monedas-recortadas-dolares/billete-1.webp';

        // Estándar canónico: solo verificar identificador único
        if (currentFieldName === 'bill1') {
          billImage = '/monedas-recortadas-dolares/billete-1.webp';
        } else if (currentFieldName === 'bill5') {
          billImage = '/monedas-recortadas-dolares/billete-5.webp';
        } else if (currentFieldName === 'bill10') {
          billImage = '/monedas-recortadas-dolares/billete-10.webp';
        } else if (currentFieldName === 'bill20') {
          billImage = '/monedas-recortadas-dolares/billete-20.webp';
        } else if (currentFieldName === 'bill50') {
          billImage = '/monedas-recortadas-dolares/billete-50.webp';
        } else if (currentFieldName === 'bill100') {
          billImage = '/monedas-recortadas-dolares/billete-100.webp';
        }

        return (
          <img
            src={billImage}
            alt={`Billete de ${currentFieldLabel}`}
            className="object-contain w-full h-full"
            onError={(e) => {
              // 🤖 [IA] - v1.3.7T: Fallback a placeholder.svg si imagen no existe
              const target = e.target as HTMLImageElement;
              if (target.src !== '/placeholder.svg') {
                target.src = '/placeholder.svg';
              }
            }}
          />
        );
      }
```

DESPUÉS:
```typescript
      case 'bill': {
        // 🤖 [IA] - OT #078: Migrado a DENOMINATION_IMAGE_MAP (SSOT) — eliminada duplicación
        const billImage = DENOMINATION_IMAGE_MAP[currentFieldName as keyof typeof DENOMINATION_IMAGE_MAP] ?? DENOMINATION_IMAGE_MAP.bill1;

        return (
          <img
            src={billImage}
            alt={`Billete de ${currentFieldLabel}`}
            className="object-contain w-full h-full"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
        );
      }
```

### Verificar TypeScript:
```bash
npx tsc --noEmit
```
Resultado esperado: 0 errores.

### Ejecutar tests (no hay tests específicos de este componente — verificar suite general):
```bash
npx vitest run --reporter=verbose 2>&1 | tail -20
```
Resultado esperado: misma cantidad de tests pasando que antes, sin nuevos failures.

### Criterio de aceptación:
- TypeScript: 0 errores
- Tests: sin regresiones nuevas
- `getIcon()` en DeliveryFieldView ya no tiene rutas hardcodeadas de monedas/billetes

---

## 3) TAREA B — Commit

```bash
git add src/components/cash-counting/DeliveryFieldView.tsx
git commit -m "$(cat <<'EOF'
refactor(delivery-field-view): migrate getIcon() to DENOMINATION_IMAGE_MAP

- Replaces hardcoded image paths with DENOMINATION_IMAGE_MAP lookup
- Adds onError fallback to coin <img> (was missing)
- Standardizes onError style across coin and bill cases
- Part of OT #078 consolidation: denomination-images SSOT

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

## 4) SMOKE TESTS

- S1: TypeScript 0 errores ✓
- S2: Sin regresiones en suite de tests ✓
- S3: Commit creado con mensaje correcto ✓

---

## 5) VEREDICTO DE CIERRE

- **PASS:** S1 ✓, S2 ✓, S3 ✓
- **FAIL:** TypeScript errores O nuevas regresiones → STOP y reportar
