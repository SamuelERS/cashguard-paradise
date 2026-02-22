# 01 — Investigación Root Cause: Duplicación de Rutas de Imágenes

## Hallazgo Principal

Las rutas de las 11 imágenes de denominaciones están definidas en **3 lugares** del código:

1. `src/utils/denomination-images.tsx` — La utilidad central (single source of truth)
2. `src/components/cash-counting/DeliveryFieldView.tsx` — Función `getIcon()` local (líneas 173–238)
3. `src/components/cash-counting/GuidedFieldView.tsx` — Función `getIcon()` local (líneas 192–304)

---

## Evidencia Técnica: denomination-images.tsx (Single Source of Truth)

**Archivo:** `src/utils/denomination-images.tsx` (88 líneas)

```typescript
export const DENOMINATION_IMAGE_MAP: Record<keyof CashCount, string> = {
  penny:       '/monedas-recortadas-dolares/moneda-dos-caras-penny.webp',
  nickel:      '/monedas-recortadas-dolares/moneda-dos-caras-nickel.webp',
  dime:        '/monedas-recortadas-dolares/moneda-dos-caras-dime.webp',
  quarter:     '/monedas-recortadas-dolares/moneda-dos-caras-quarter.webp',
  dollarCoin:  '/monedas-recortadas-dolares/moneda-un-dollar-nueva.webp',
  bill1:       '/monedas-recortadas-dolares/billete-1.webp',
  bill5:       '/monedas-recortadas-dolares/billete-5.webp',
  bill10:      '/monedas-recortadas-dolares/billete-10.webp',
  bill20:      '/monedas-recortadas-dolares/billete-20.webp',
  bill50:      '/monedas-recortadas-dolares/billete-cincuenta-dolares-sobre-fondo-blanco(1).webp',
  bill100:     '/monedas-recortadas-dolares/billete-100.webp',
};
```

**Estado:** ✅ Rutas correctas (actualizado en commits `8d966ba` + `4d2c7e7`)

**Problema:** `getDenominationImageElement()` NO tiene `onError` handler:
```typescript
// FALTA:
// onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
```

---

## Evidencia Técnica: DeliveryFieldView.tsx (Duplicado #1)

**Archivo:** `src/components/cash-counting/DeliveryFieldView.tsx`
**Función:** `getIcon()` — líneas 173–238 (66 líneas)

### Rutas hardcodeadas (líneas 193–238):
```typescript
const getIcon = (): React.ReactNode => {
  const isCoin = ['penny', 'nickel', 'dime', 'quarter', 'dollarCoin'].includes(currentFieldName);

  // Mapa interno de rutas — DUPLICA denomination-images.tsx
  const imageMap: Record<string, string> = {
    penny:      '/monedas-recortadas-dolares/moneda-dos-caras-penny.webp',
    nickel:     '/monedas-recortadas-dolares/moneda-dos-caras-nickel.webp',
    dime:       '/monedas-recortadas-dolares/moneda-dos-caras-dime.webp',
    quarter:    '/monedas-recortadas-dolares/moneda-dos-caras-quarter.webp',
    dollarCoin: '/monedas-recortadas-dolares/moneda-un-dollar-nueva.webp',
    bill1:      '/monedas-recortadas-dolares/billete-1.webp',
    bill5:      '/monedas-recortadas-dolares/billete-5.webp',
    bill10:     '/monedas-recortadas-dolares/billete-10.webp',
    bill20:     '/monedas-recortadas-dolares/billete-20.webp',
    bill50:     '/monedas-recortadas-dolares/billete-cincuenta-dolares-sobre-fondo-blanco(1).webp',
    bill100:    '/monedas-recortadas-dolares/billete-100.webp',
  };

  const imagePath = imageMap[currentFieldName];

  // Coin rendering (responsive clamp)
  if (isCoin && imagePath) {
    return (
      <img
        src={imagePath}
        alt={label}
        className="object-contain"
        style={{
          width: 'clamp(234.375px, 58.59vw, 390.625px)',
          aspectRatio: '2.4 / 1'
        }}
        loading="lazy"
        decoding="async"
        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}  // ← tiene onError
      />
    );
  }

  // Bill rendering
  if (imagePath) {
    return (
      <img
        src={imagePath}
        alt={label}
        className="object-contain w-full h-full"
        loading="lazy"
        decoding="async"
        onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}  // ← tiene onError
      />
    );
  }

  return null;
};
```

### Diferencias vs denomination-images.tsx:
| Aspecto | denomination-images.tsx | DeliveryFieldView.getIcon() |
|---------|------------------------|----------------------------|
| onError | ❌ FALTA | ✅ Tiene (`/placeholder.svg`) |
| CSS monedas | `clamp(1.5rem,6vw,2rem)` | `clamp(234.375px,58.59vw,390.625px)` + `aspectRatio: 2.4/1` |
| CSS billetes | `object-contain` | `object-contain w-full h-full` |
| Contexto UI | General (Phase2VerificationSection) | Panel grande de conteo guiado |

> **Nota importante:** Los CSS son diferentes porque `DeliveryFieldView` muestra imágenes
> en un panel grande de conteo (display prominente), mientras que `denomination-images.tsx`
> usa tamaños pequeños para la grilla de verificación. La migración debe preservar estos
> CSS específicos del contexto.

---

## Evidencia Técnica: GuidedFieldView.tsx (Duplicado #2)

**Archivo:** `src/components/cash-counting/GuidedFieldView.tsx`
**Función:** `getIcon()` — líneas 192–304 (113 líneas)

### Estructura (más compleja):
```typescript
const getIcon = (): React.ReactNode => {
  // ── Sección 1: 4 logos de pagos electrónicos (NO son CashCount keys) ──
  if (currentFieldName === 'credomatic') {
    return <img src="/bac-logo.webp" ... />;
  }
  if (currentFieldName === 'promerica') {
    return <img src="/banco promerica logo.png" ... />;
  }
  if (currentFieldName === 'bankTransfer') {
    return <img src="/transferencia-bancaria.png" ... />;
  }
  if (currentFieldName === 'paypal') {
    return <img src="/paypal-logo.png" ... />;
  }

  // ── Sección 2: 11 denominaciones (DUPLICA denomination-images.tsx) ──
  const isCoin = ['penny', 'nickel', 'dime', 'quarter', 'dollarCoin'].includes(currentFieldName);

  const imageMap: Record<string, string> = {
    penny:      '/monedas-recortadas-dolares/moneda-dos-caras-penny.webp',
    nickel:     '/monedas-recortadas-dolares/moneda-dos-caras-nickel.webp',
    dime:       '/monedas-recortadas-dolares/moneda-dos-caras-dime.webp',
    quarter:    '/monedas-recortadas-dolares/moneda-dos-caras-quarter.webp',
    dollarCoin: '/monedas-recortadas-dolares/moneda-un-dollar-nueva.webp',
    bill1:      '/monedas-recortadas-dolares/billete-1.webp',
    bill5:      '/monedas-recortadas-dolares/billete-5.webp',
    bill10:     '/monedas-recortadas-dolares/billete-10.webp',
    bill20:     '/monedas-recortadas-dolares/billete-20.webp',
    bill50:     '/monedas-recortadas-dolares/billete-cincuenta-dolares-sobre-fondo-blanco(1).webp',
    bill100:    '/monedas-recortadas-dolares/billete-100.webp',
  };

  const imagePath = imageMap[currentFieldName];

  if (isCoin && imagePath) {
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

  if (imagePath) {
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
  }

  return null;
};
```

### Los 4 logos electrónicos (NO migrar):
| Campo | Archivo | Notas |
|-------|---------|-------|
| `credomatic` | `/bac-logo.webp` | NO es `keyof CashCount` |
| `promerica` | `/banco promerica logo.png` | NO es `keyof CashCount`, nombre con espacios |
| `bankTransfer` | `/transferencia-bancaria.png` | NO es `keyof CashCount` |
| `paypal` | `/paypal-logo.png` | NO es `keyof CashCount` |

---

## Comparativa de las 11 Rutas (Tres Versiones)

| Key | denomination-images.tsx | DeliveryFieldView | GuidedFieldView |
|-----|------------------------|-------------------|-----------------|
| penny | `moneda-dos-caras-penny.webp` | `moneda-dos-caras-penny.webp` | `moneda-dos-caras-penny.webp` |
| nickel | `moneda-dos-caras-nickel.webp` | `moneda-dos-caras-nickel.webp` | `moneda-dos-caras-nickel.webp` |
| dime | `moneda-dos-caras-dime.webp` | `moneda-dos-caras-dime.webp` | `moneda-dos-caras-dime.webp` |
| quarter | `moneda-dos-caras-quarter.webp` | `moneda-dos-caras-quarter.webp` | `moneda-dos-caras-quarter.webp` |
| dollarCoin | `moneda-un-dollar-nueva.webp` | `moneda-un-dollar-nueva.webp` | `moneda-un-dollar-nueva.webp` |
| bill1 | `billete-1.webp` | `billete-1.webp` | `billete-1.webp` |
| bill5 | `billete-5.webp` | `billete-5.webp` | `billete-5.webp` |
| bill10 | `billete-10.webp` | `billete-10.webp` | `billete-10.webp` |
| bill20 | `billete-20.webp` | `billete-20.webp` | `billete-20.webp` |
| bill50 | `billete-cincuenta...webp` | `billete-cincuenta...webp` | `billete-cincuenta...webp` |
| bill100 | `billete-100.webp` | `billete-100.webp` | `billete-100.webp` |

✅ **Las 3 versiones tienen las mismas rutas** (gracias a los commits de corrección).

---

## Dónde se Usa denomination-images.tsx Actualmente

Búsqueda confirmada: `Phase2VerificationSection.tsx` línea ~491 usa `getDenominationImageElement()`.
Esto valida que la utilidad funciona correctamente en producción para la grilla de verificación.

---

## Resumen del Root Cause

**Causa raíz:** Históricamente, `DeliveryFieldView` y `GuidedFieldView` fueron creados
antes de que `denomination-images.tsx` existiera como utilidad centralizada, o sin
conocimiento de su existencia. Como resultado, cada componente implementó su propio
mapeo de imágenes de forma independiente.

**Efecto:** 3× duplicación de las mismas 11 rutas + ausencia del `onError` handler en
la utilidad central (que sí lo tienen los componentes que la deberían reemplazar).

**Solución:** Agregar `onError` a `denomination-images.tsx` y migrar los `getIcon()`
de ambos componentes para usar `DENOMINATION_IMAGE_MAP` directamente.
