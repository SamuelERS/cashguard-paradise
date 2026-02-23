# 02 — Riesgos y Bloqueadores

## BLOQUEADOR 1 (CRÍTICO): onError ausente en denomination-images.tsx

### Descripción
`getDenominationImageElement()` en `denomination-images.tsx` **no tiene** un handler
`onError`. Si una imagen falla al cargar, el `<img>` mostrará un ícono de imagen rota
en lugar del placeholder `/placeholder.svg` que usan los componentes actuales.

### Evidencia
```typescript
// denomination-images.tsx — ESTADO ACTUAL (sin onError)
export function getDenominationImageElement(
  denominationKey: keyof CashCount,
  label: string,
  className: string = "w-[clamp(1.5rem,6vw,2rem)] h-[clamp(1.5rem,6vw,2rem)] object-contain"
): React.ReactNode {
  const imagePath = DENOMINATION_IMAGE_MAP[denominationKey];
  if (!imagePath) return null;
  return (
    <img
      src={imagePath}
      alt={label}
      className={className}
      loading="lazy"
      decoding="async"
      // ← onError AUSENTE — imagen rota si archivo no existe
    />
  );
}
```

### Comportamiento esperado (en componentes actuales)
```typescript
// DeliveryFieldView.tsx + GuidedFieldView.tsx — tienen onError
onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
```

### Impacto si se ignora
Si se migran `DeliveryFieldView` y `GuidedFieldView` a usar `getDenominationImageElement()`
sin primero agregar `onError`, cualquier imagen que falle (archivo corrompido, nombre
incorrecto, error de red) mostrará un ícono roto en lugar del placeholder elegante.
Esto es una **regresión de UX** respecto al comportamiento actual.

### Resolución requerida
**ANTES de cualquier migración**, se debe:
1. Escribir test que falle: verificar que `<img>` tiene `onError` prop configurado
2. Agregar `onError` a `getDenominationImageElement()` con fallback a `/placeholder.svg`
3. Confirmar que el test pasa

---

## BLOQUEADOR 2 (IMPORTANTE): CSS diferente por contexto de uso

### Descripción
Los CSS de las imágenes son diferentes dependiendo del contexto:

| Contexto | CSS Monedas | CSS Billetes |
|----------|-------------|--------------|
| `denomination-images.tsx` (default) | `clamp(1.5rem,6vw,2rem)` cuadrado | `object-contain` (tamaño del contenedor) |
| `DeliveryFieldView.getIcon()` | `clamp(234.375px,58.59vw,390.625px)` + `aspectRatio: 2.4/1` | `object-contain w-full h-full` |
| `GuidedFieldView.getIcon()` | `clamp(234.375px,58.59vw,390.625px)` + `aspectRatio: 2.4/1` | `object-contain w-full h-full` |

### Por qué son diferentes
- `denomination-images.tsx` fue diseñado para la **grilla pequeña** de `Phase2VerificationSection`
  (íconos de ~1.5–2rem en una tabla compacta).
- `DeliveryFieldView` y `GuidedFieldView` muestran imágenes en **panel prominente** de
  conteo guiado (pantalla completa, las imágenes son el elemento central de la UI).

### Resolución
`getDenominationImageElement()` ya acepta un parámetro `className` opcional.
La migración debe pasar los CSS correctos al llamar la función:

```typescript
// Para DeliveryFieldView y GuidedFieldView — monedas:
getDenominationImageElement(
  key as keyof CashCount,
  label,
  "object-contain" // + style prop para clamp + aspectRatio
)

// Alternativa más limpia: usar DENOMINATION_IMAGE_MAP directamente
// y construir el <img> con los CSS correctos en el componente
const imagePath = DENOMINATION_IMAGE_MAP[currentFieldName as keyof CashCount];
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
```

> **Decisión arquitectónica:** Ver `03_Arquitectura_Propuesta.md` sección "Estrategia de CSS".

---

## RIESGO 1: Logos de Pagos Electrónicos en GuidedFieldView

### Descripción
`GuidedFieldView.getIcon()` maneja 4 rutas que **NO son denominaciones de efectivo**:
- `credomatic` → `/bac-logo.webp`
- `promerica` → `/banco promerica logo.png`
- `bankTransfer` → `/transferencia-bancaria.png`
- `paypal` → `/paypal-logo.png`

Estos keys NO existen en `CashCount` y **NO deben migrarse** a `denomination-images.tsx`.

### Plan de mitigación
Al refactorizar `GuidedFieldView.getIcon()`, estos 4 casos se manejan con early returns
**antes** de la lógica de denominaciones:

```typescript
// Mantener primero los logos electrónicos (no tocar)
if (currentFieldName === 'credomatic') return <img src="/bac-logo.webp" ... />;
if (currentFieldName === 'promerica') return <img src="/banco promerica logo.png" ... />;
if (currentFieldName === 'bankTransfer') return <img src="/transferencia-bancaria.png" ... />;
if (currentFieldName === 'paypal') return <img src="/paypal-logo.png" ... />;

// Luego usar DENOMINATION_IMAGE_MAP para las denominaciones
const imagePath = DENOMINATION_IMAGE_MAP[currentFieldName as keyof CashCount];
// ...
```

---

## RIESGO 2: Regresión en Phase2VerificationSection

### Descripción
`Phase2VerificationSection` ya usa `getDenominationImageElement()` con el CSS pequeño
(default de la función). Si se modifica el comportamiento de `getDenominationImageElement()`
(especialmente el CSS default), podría afectar la visualización en Phase2VerificationSection.

### Plan de mitigación
- Solo agregar `onError` como nuevo atributo al `<img>` existente. No cambiar `className` default.
- Los cambios de CSS solo ocurren cuando se pasa un `className` personalizado.
- El CSS default actual (`clamp(1.5rem,6vw,2rem) h-[clamp(1.5rem,6vw,2rem)] object-contain`)
  se preserva exactamente.

---

## RIESGO 3: Tests Suite 3 — Estado post-fix

### Descripción
La Suite 3 de `denomination-images.test.tsx` verifica la existencia física de los archivos.
Esta suite fue diseñada para **fallar antes del fix** (como confirmación del bug).
Después de los commits `8d966ba` + `4d2c7e7`, **debería pasar**.

### Verificación requerida
Antes de implementar, confirmar con Docker:
```bash
./Scripts/docker-test-commands.sh test src/utils/__tests__/denomination-images.test.tsx
```

Si Suite 3 falla, hay un problema con los archivos físicos que debe resolverse primero.

---

## RIESGO 4: Falta de Tests para onError (DACC D-03)

### Descripción
La DACC Directiva D-03 exige tests que fallen antes de cualquier implementación.
Actualmente, `denomination-images.test.tsx` NO tiene tests para el comportamiento
`onError`. Esto es una deuda de testing que debe saldarse en este caso.

### Tests requeridos (pre-implementación)
```typescript
// Suite 4: onError fallback
describe('getDenominationImageElement — onError fallback', () => {
  it('el <img> tiene handler onError configurado', () => {
    const element = getDenominationImageElement('penny', 'Un centavo');
    const { container } = render(<>{element}</>);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    // Verificar que onError existe como atributo del nodo React
    // (o simular error y verificar que src cambia a /placeholder.svg)
  });
});
```

Ver plan TDD completo en `docs/plans/2026-02-22-consolidacion-denomination-images.md`.

---

## Matriz de Riesgos

| Riesgo | Probabilidad | Impacto | Prioridad | Mitigación |
|--------|-------------|---------|-----------|------------|
| BLOQUEADOR 1: sin onError | Alta | Alto (regresión UX) | 🔴 CRÍTICA | Agregar onError en Fase 0 |
| BLOQUEADOR 2: CSS diferente | Alta | Medio (visual) | 🟡 ALTA | Pasar className correcto |
| Logos electrónicos | Media | Medio (funcional) | 🟡 ALTA | Early returns antes de denominations |
| Regresión Phase2 | Baja | Bajo | 🟢 BAJA | No cambiar className default |
| Suite 3 falla | Baja | Medio | 🟡 ALTA | Verificar con Docker antes |
| Sin tests onError | Alta | Medio (calidad) | 🔴 ALTA | TDD obligatorio (DACC D-03) |
