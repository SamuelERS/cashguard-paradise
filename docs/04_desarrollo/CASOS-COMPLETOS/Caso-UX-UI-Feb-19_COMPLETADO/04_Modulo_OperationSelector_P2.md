# Módulo 04: Limpiar OperationSelector — P2

**Fecha:** 2026-02-19
**Caso:** `Caso-UX-UI-Feb-19/`
**Hallazgos:** 1.2, 1.3

**Skills aplicados:** `vercel-react-best-practices` (responsive patterns, clamp()), `systematic-debugging` (pattern migration)

---

## Tarea A: viewportScale Pattern (1.2)

### Problema

`OperationSelector.tsx` usa `viewportScale` calculado con `Math.min(window.innerWidth / 430, 1)` para escalar padding values. El resto del app usa `clamp()` puro para responsividad.

### Ubicación Exacta

**Archivo:** `src/components/operation-selector/OperationSelector.tsx`
**Línea 27:**
```tsx
const viewportScale = Math.min(window.innerWidth / 430, 1);
```

**Usos detectados:** Cálculos de padding como:
```tsx
padding: `clamp(20px, ${32 * viewportScale}px, 32px)`
```

### Contexto Importante

- **Corrección del plan original:** El plan decía "transform: scale()" pero la investigación confirmó que viewportScale se usa para **padding calculations**, no para transform. No causa layout shift.
- **Inconsistencia:** El patrón mixto (JS calculation + CSS clamp) es redundante — `clamp()` solo ya maneja responsividad.
- **Riesgo:** Migrar a `clamp()` puro requiere testing visual cuidadoso en múltiples viewports.

### Solución Propuesta

Evaluar reemplazar cálculos `${X * viewportScale}px` por valores `clamp()` puros. Ejemplo:
```tsx
// ANTES:
padding: `clamp(20px, ${32 * viewportScale}px, 32px)`

// DESPUÉS (si viewportScale se elimina):
padding: 'clamp(20px, 7.5vw, 32px)'
```

### Precaución

Esta tarea requiere **testing visual cuidadoso** en:
- iPhone SE (375px)
- iPhone 14 (390px)
- Dispositivo máximo (430px = breakpoint del scale)
- Desktop (1440px)

---

## Tarea B: Inline Styles Masivos (1.3)

### Problema

Cards del OperationSelector tienen 16 bloques `style={{}}` con múltiples propiedades inline cada uno. Dificulta mantenimiento y override de temas.

### Ubicación

**Archivo:** `src/components/operation-selector/OperationSelector.tsx`
**Distribución:** A lo largo de todo el componente

### Solución Propuesta

Mover propiedades repetidas a clases CSS/Tailwind. Priorizar:
1. Propiedades de layout (padding, margin, gap) → Tailwind utilities
2. Propiedades de glass morphism → clase CSS (resuelto en Módulo 02)
3. Propiedades de color/gradiente → Clases CSS custom si se repiten

### Consideraciones

- Algunos inline styles pueden ser dinámicos (dependen de `viewportScale`) — evaluar si pueden convertirse a `clamp()` (Tarea A)
- No mover propiedades que genuinamente necesitan ser dinámicas (ej: colores basados en props)
- Esta tarea puede reducirse significativamente si Tarea A elimina `viewportScale`

---

## Criterios de Aceptación

- [ ] Evaluar viabilidad de migrar `viewportScale` → `clamp()` puro
- [ ] Si viable: eliminar `viewportScale`, migrar paddings a `clamp()`
- [ ] Reducir inline styles donde sea posible sin cambiar comportamiento visual
- [ ] Testing visual en 375px, 390px, 430px, 1440px
- [ ] `npm run build` sin errores

## Siguiente Paso

→ Ver `05_Modulo_Cosmeticos_P3.md`
