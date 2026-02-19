# Módulo 02: Unificar Glass Morphism — P0 (Crítico)

**Fecha:** 2026-02-19
**Caso:** `Caso-UX-UI-Feb-19/`
**Hallazgos:** 7.1, 7.2, 1.1, 3.2, 6.1, 6.3

**Skills aplicados:** `systematic-debugging` (root cause analysis), `vercel-react-best-practices` (CSS-in-JS vs utility classes)

---

## Problema Raíz

El design system tiene **DOS definiciones de glass morphism** que compiten entre sí, creando inconsistencia visual notable entre pantallas.

### Definición A — Variable CSS (línea 262 de index.css)
```css
--glass-bg-primary: rgba(36, 36, 36, 0.4);
```
- Más claro y transparente (40% opacidad)
- Usada por componentes con inline styles
- Blur: `blur(20px)` (definido inline por cada componente)

### Definición B — Clase CSS (líneas 494-513 de index.css)
```css
.glass-morphism-panel {
  background-color: rgba(28, 28, 32, 0.72) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
}
```
- Más oscura y opaca (72% opacidad)
- Con `!important` que impide override contextual
- Blur menor: `blur(12px)`
- Desktop override (líneas 517-526): `rgba(28, 28, 32, 0.62)` con `blur(20px) saturate(140%)`

### Fractura Clave

La clase `.glass-morphism-panel` **NO usa la variable** `--glass-bg-primary`. Son dos sistemas independientes. Componentes que usan la clase se ven oscuros/opacos; componentes con inline styles se ven claros/transparentes.

---

## Archivos Afectados (5 archivos)

### 1. `src/index.css` — Definiciones raíz
- **Línea 262:** Variable `--glass-bg-primary: rgba(36, 36, 36, 0.4)`
- **Líneas 494-513:** Clase `.glass-morphism-panel` con `!important`
- **Líneas 517-526:** Desktop override de `.glass-morphism-panel`

### 2. `src/components/operation-selector/OperationSelector.tsx`
- **Línea 119:** Inline `rgba(36, 36, 36, 0.4)` + `blur(20px)` en card container
- No usa `.glass-morphism-panel`

### 3. `src/components/cash-calculation/CashResultsDisplay.tsx`
- **Líneas 25-32:** Constante `glassCard` con `rgba(36, 36, 36, 0.4)`
- Usada 4 veces: líneas 93, 120, 188, 199
- No usa `.glass-morphism-panel`

### 4. `src/components/CashCalculation.tsx`
- **Líneas 292-300:** Overlay "Resultados Bloqueados" con `rgba(36, 36, 36, 0.4)` inline
- No usa `.glass-morphism-panel`

### 5. `src/components/cash-counting/guided/GuidedDenominationSection.tsx`
- **Líneas 133-141:** Glass morphism inline `rgba(36, 36, 36, 0.4)` + `blur(20px)`
- No usa `.glass-morphism-panel`

---

## Decisión Arquitectónica Requerida

Antes de implementar, se debe decidir **cuál definición es la fuente de verdad**:

### Opción A: Adoptar la clase `.glass-morphism-panel` (más oscura)
- **Pro:** Ya está definida como clase CSS reutilizable
- **Pro:** Algunos componentes ya la usan (wizard, modales)
- **Contra:** Requiere revisar si el aspecto más oscuro es deseado en todos los contextos
- **Acción:** Migrar 4 archivos de inline → clase CSS

### Opción B: Adoptar la variable CSS `--glass-bg-primary` (más clara)
- **Pro:** Más transparente, menos intrusiva visualmente
- **Pro:** Ya es variable CSS (single source of truth natural)
- **Contra:** Requiere actualizar `.glass-morphism-panel` para usar la variable
- **Acción:** Modificar clase CSS + evaluar si componentes existentes se ven bien

### Opción C: Variantes (clase base + modificadores)
- **Pro:** Flexibilidad máxima sin `!important`
- **Pro:** Cada contexto puede tener su opacidad apropiada
- **Contra:** Más complejo de implementar
- **Acción:** Crear `.glass-morphism-panel--light` y `.glass-morphism-panel--dark`

---

## Estrategia de Implementación Propuesta

### Fase 1: Resolver `!important` (7.2)
1. Evaluar si `!important` puede removerse al eliminar inline styles conflictivos
2. Si se remueve, la clase podrá ser extendida/overrideada limpiamente

### Fase 2: Unificar definición (7.1)
1. Decidir fuente de verdad (Opción A, B, o C — requiere aprobación)
2. Actualizar `index.css` según decisión
3. Hacer que la clase use la variable CSS (o viceversa)

### Fase 3: Migrar componentes (1.1, 3.2, 6.1, 6.3)
1. `OperationSelector.tsx` línea 119 → usar clase CSS
2. `GuidedDenominationSection.tsx` líneas 133-141 → usar clase CSS
3. `CashResultsDisplay.tsx` líneas 25-32 → usar clase CSS (eliminar constante `glassCard`)
4. `CashCalculation.tsx` líneas 292-300 → usar clase CSS

### Fase 4: Verificación visual
1. Comparar antes/después en viewport 375px y 1440px
2. Recorrer flujo completo: OperationSelector → Wizard → Phase 1 → Phase 2 → Phase 3
3. Verificar que wizard (ya usa clase) mantiene aspecto consistente con componentes migrados

---

## Riesgos

| Riesgo | Mitigación |
|--------|------------|
| Cambio visual notable para usuarios | Comparación screenshots antes/después |
| `.glass-morphism-panel` usada en otros módulos | Grep global antes de modificar clase |
| `!important` removido rompe algo | Verificar todos los consumidores de la clase |
| `glassCard` constante usada en más archivos | Grep completo antes de eliminar |

---

## Criterios de Aceptación

- [ ] Una única definición de glass morphism (clase CSS o variable, no ambas compitiendo)
- [ ] `!important` removido o justificado
- [ ] Cero inline `rgba(36, 36, 36, 0.4)` para glass morphism en archivos afectados
- [ ] Consistencia visual verificada en todo el flujo nocturno
- [ ] `npm run build` sin errores

## Siguiente Paso

→ Ver `03_Modulo_Botones_Step5_P1.md`
