# 03 — Arquitectura Propuesta

## Principio de Diseño

**Una sola fuente de verdad para las rutas de imágenes de denominaciones.**

`denomination-images.tsx` ya existe para este propósito. Los componentes que necesiten
imágenes de denominaciones deben:
1. Leer la ruta desde `DENOMINATION_IMAGE_MAP`
2. Construir el `<img>` con los atributos correctos para su contexto (CSS específico)
3. Incluir `onError` para resiliencia

---

## Estrategia de CSS (Decisión Arquitectónica)

Dado que los CSS son diferentes por contexto de uso, se presentan **dos opciones**:

### Opción A — Usar `DENOMINATION_IMAGE_MAP` directamente (Recomendada)

Los componentes importan solo `DENOMINATION_IMAGE_MAP` y construyen el `<img>` localmente
con sus CSS específicos:

```typescript
// En DeliveryFieldView.tsx (y GuidedFieldView para denominaciones)
import { DENOMINATION_IMAGE_MAP } from '@/utils/denomination-images';
import type { CashCount } from '@/types/cash';

const imagePath = DENOMINATION_IMAGE_MAP[currentFieldName as keyof CashCount];

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
```

**Ventajas:**
- Flexibilidad total de CSS por componente
- No contamina la API de `denomination-images.tsx` con múltiples variantes de CSS
- Los componentes expresan exactamente lo que necesitan
- `getDenominationImageElement()` sigue siendo útil para Phase2VerificationSection (CSS pequeño)

**Desventajas:**
- Aún hay algo de duplicación (la estructura del `<img>`)

### Opción B — Extender `getDenominationImageElement()` con parámetro de variante

```typescript
// denomination-images.tsx — extendido
type DenominationImageVariant = 'compact' | 'large';

export function getDenominationImageElement(
  denominationKey: keyof CashCount,
  label: string,
  className?: string,
  variant?: DenominationImageVariant
): React.ReactNode {
  // ...
}
```

**Desventajas:**
- Agrega complejidad a la API de denomination-images.tsx
- El componente debe saber sobre variantes que no le pertenecen
- Viola el principio de responsabilidad única

### Decisión: Opción A

La **Opción A** es la arquitectura más limpia. `DENOMINATION_IMAGE_MAP` es el single source
of truth para las **rutas**. Los componentes son el single source of truth para sus **CSS**.

---

## Fases de Implementación

### Fase 0 — Preparación (onError + Test)

**Objetivo:** Agregar el `onError` bloqueante y su test TDD.

**Archivos modificados:**
1. `src/utils/__tests__/denomination-images.test.tsx` — Agregar Suite 4 (onError test)
2. `src/utils/denomination-images.tsx` — Agregar `onError` handler

**Secuencia TDD:**
1. Escribir test Suite 4 → debe FALLAR
2. Agregar `onError` a `getDenominationImageElement()` → test debe PASAR
3. Commit: `test+fix(denomination-images): add onError fallback TDD`

**Código del test (Suite 4):**
```typescript
describe('getDenominationImageElement — onError fallback', () => {
  it('el <img> tiene atributo onError que cambia src a /placeholder.svg', () => {
    const element = getDenominationImageElement('penny', 'Un centavo');
    const { container } = render(<>{element}</>);
    const img = container.querySelector('img') as HTMLImageElement;
    expect(img).not.toBeNull();
    // Simular evento de error
    fireEvent.error(img);
    expect(img.src).toContain('placeholder.svg');
  });
});
```

**Código del fix:**
```typescript
// denomination-images.tsx — agregar onError
return (
  <img
    src={imagePath}
    alt={label}
    className={className}
    loading="lazy"
    decoding="async"
    onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}  // ← AGREGAR
  />
);
```

---

### Fase 1 — Migrar DeliveryFieldView.tsx

**Objetivo:** Reemplazar la función `getIcon()` de 66 líneas con DENOMINATION_IMAGE_MAP.

**Archivo modificado:** `src/components/cash-counting/DeliveryFieldView.tsx`

**Cambio:** Líneas 173–238 (función `getIcon()` local de 66 líneas) →
importar `DENOMINATION_IMAGE_MAP` y construir `<img>` con CSS de contexto.

**Código propuesto:**
```typescript
// ANTES: getIcon() interno con imageMap de 11 entradas (66 líneas)

// DESPUÉS: ~20 líneas usando DENOMINATION_IMAGE_MAP
import { DENOMINATION_IMAGE_MAP } from '@/utils/denomination-images';

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

**Reducción estimada:** 66 → ~25 líneas = −41 líneas

---

### Fase 2 — Migrar GuidedFieldView.tsx

**Objetivo:** Reemplazar la sección de denominaciones en `getIcon()` con DENOMINATION_IMAGE_MAP,
preservando los 4 logos electrónicos intactos.

**Archivo modificado:** `src/components/cash-counting/GuidedFieldView.tsx`

**Cambio:** Líneas 192–304 (113 líneas) → ~50 líneas preservando early returns para logos.

**Estructura post-migración:**
```typescript
import { DENOMINATION_IMAGE_MAP } from '@/utils/denomination-images';

const getIcon = (): React.ReactNode => {
  // ── Logos electrónicos: PRESERVADOS sin cambios ──
  if (currentFieldName === 'credomatic') {
    return <img src="/bac-logo.webp" alt="Credomatic" ... />;
  }
  if (currentFieldName === 'promerica') {
    return <img src="/banco promerica logo.png" alt="Banco Promerica" ... />;
  }
  if (currentFieldName === 'bankTransfer') {
    return <img src="/transferencia-bancaria.png" alt="Transferencia bancaria" ... />;
  }
  if (currentFieldName === 'paypal') {
    return <img src="/paypal-logo.png" alt="PayPal" ... />;
  }

  // ── Denominaciones: usa DENOMINATION_IMAGE_MAP ──
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

**Reducción estimada:** 113 → ~55 líneas = −58 líneas

---

## Resumen de Impacto

| Métrica | Antes | Después | Diferencia |
|---------|-------|---------|------------|
| Definiciones de rutas | 3 lugares | 1 lugar (denomination-images.tsx) | ✅ −2 duplicados |
| Líneas en DeliveryFieldView.getIcon() | 66 | ~25 | ✅ −41 líneas |
| Líneas en GuidedFieldView.getIcon() | 113 | ~55 | ✅ −58 líneas |
| onError en denomination-images.tsx | ❌ Ausente | ✅ Presente | ✅ +resiliencia |
| Tests onError | 0 | 1+ | ✅ +cobertura |

**Total de código eliminado:** ~99 líneas de duplicación.

---

## Invariantes a Preservar

1. **Los 4 logos electrónicos** en GuidedFieldView no cambian (rutas, CSS, comportamiento)
2. **Phase2VerificationSection** no se toca (ya usa getDenominationImageElement() correctamente)
3. **CSS default de getDenominationImageElement()** no cambia (clamp pequeño para grilla)
4. **Todos los tests existentes** siguen pasando
5. **TypeScript: 0 errors** antes y después de cada fase
