# ORDEN TECNICA #079-GUIDED-MIGRATION
## Migrar GuidedFieldView.tsx getIcon() → DENOMINATION_IMAGE_MAP

**Fecha:** 2026-02-22
**Prioridad:** ALTA
**Módulos:** `src/components/cash-counting/GuidedFieldView.tsx`
**Meta:** Eliminar rutas hardcodeadas en cases 'coin' y 'bill' usando DENOMINATION_IMAGE_MAP — preservar `case 'electronic'` intacto

---

## 0) PRINCIPIO DE ESTA ORDEN

OT #078 completó la migración de `DeliveryFieldView.tsx`.
Esta OT aplica el mismo patrón a `GuidedFieldView.tsx`.

**DIFERENCIA CRÍTICA vs OT #078:**
`GuidedFieldView.tsx` tiene un `case 'electronic'` con 4 logos de pagos electrónicos.
Este bloque **NO SE TOCA** — no es CashCount, no corresponde a DENOMINATION_IMAGE_MAP.

**Cambios requeridos:**
1. Agregar import `DENOMINATION_IMAGE_MAP` desde `@/utils/denomination-images`
2. Reemplazar `case 'coin'` — mismo patrón que OT #078
3. Reemplazar `case 'bill'` — mismo patrón que OT #078
4. `case 'electronic'` — NO MODIFICAR

---

## 1) ENTREGABLES OBLIGATORIOS

1) `src/components/cash-counting/GuidedFieldView.tsx` — archivo modificado

---

## 2) TAREA A — Implementar cambios

### Archivo: `src/components/cash-counting/GuidedFieldView.tsx`

**Cambio 1 — Agregar import** (después de la línea que importa `DENOMINATIONS`):
```typescript
import { DENOMINATION_IMAGE_MAP } from '@/utils/denomination-images';
```

**Cambio 2 — Reemplazar `case 'coin'` completo** (~líneas 194-219):

VIEJO:
```
      case 'coin': {
        // Determinar qué imagen de moneda mostrar basado en currentFieldName
        let coinImage = '/monedas-recortadas-dolares/moneda-centavo-front-inlay.webp';

        // Seleccionar la imagen correcta según el nombre del campo
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
              width: 'clamp(234.375px, 58.59vw, 390.625px)', // 🤖 [IA] - v1.3.3: Monedas 25% más grandes (segundo aumento adicional)
              aspectRatio: '2.4 / 1' // 🤖 [IA] - v1.3.0: Proporción rectangular como billetes
            }}
          />
        );
      }
```

NUEVO:
```
      case 'coin': {
        // 🤖 [IA] - OT #079: Migrado a DENOMINATION_IMAGE_MAP (SSOT) — eliminada duplicación
        const denomKey = (currentFieldName === 'dollar' ? 'dollarCoin' : currentFieldName) as keyof typeof DENOMINATION_IMAGE_MAP;
        const coinImage = DENOMINATION_IMAGE_MAP[denomKey] ?? DENOMINATION_IMAGE_MAP.penny;

        return (
          <img
            src={coinImage}
            alt={`Moneda de ${currentFieldLabel}`}
            className="object-contain"
            style={{
              width: 'clamp(234.375px, 58.59vw, 390.625px)', // 🤖 [IA] - v1.3.3: Monedas 25% más grandes (segundo aumento adicional)
              aspectRatio: '2.4 / 1' // 🤖 [IA] - v1.3.0: Proporción rectangular como billetes
            }}
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
        );
      }
```

**Cambio 3 — Reemplazar `case 'bill'` completo** (~líneas 221-254):

VIEJO:
```
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

NUEVO:
```
      case 'bill': {
        // 🤖 [IA] - OT #079: Migrado a DENOMINATION_IMAGE_MAP (SSOT) — eliminada duplicación
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

**`case 'electronic'` — NO MODIFICAR absolutamente nada.**

---

## 3) TAREA B — Verificar y commit

### TypeScript:
```bash
npx tsc --noEmit
```
Esperado: 0 errores. STOP si hay errores.

### Tests:
```bash
npx vitest run src/utils/__tests__/denomination-images.test.tsx 2>&1
```
Esperado: 8/8 passing.

### Commit:
```bash
git add src/components/cash-counting/GuidedFieldView.tsx
git commit -m "$(cat <<'EOF'
refactor(guided-field-view): migrate getIcon() to DENOMINATION_IMAGE_MAP

- Replaces hardcoded image paths with DENOMINATION_IMAGE_MAP lookup
- Adds onError fallback to coin <img> (was missing)
- Standardizes onError style across coin and bill cases
- Preserves case 'electronic' block unchanged (4 payment logos not in CashCount)
- Part of OT #079 consolidation: denomination-images SSOT

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

### Verificar:
```bash
git log --oneline -4
git status
```

---

## 4) SMOKE TESTS

- S1: TypeScript 0 errores ✓
- S2: 8/8 tests passing ✓
- S3: `case 'electronic'` intacto ✓
- S4: Commit creado ✓
