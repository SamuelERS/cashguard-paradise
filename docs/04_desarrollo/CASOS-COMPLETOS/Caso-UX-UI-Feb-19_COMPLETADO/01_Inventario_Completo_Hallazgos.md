# Inventario Completo de Hallazgos — Auditoría UX/UI Módulo Nocturno

**Fecha:** 2026-02-19
**Caso:** `Caso-UX-UI-Feb-19/`
**Skills aplicados:** `systematic-debugging` (investigación exhaustiva), `writing-plans` (documentación modular)

## Categorización

- **BUG**: Error visual que rompe la experiencia o contradice el design system
- **IMP**: Mejora de implementación (código correcto pero subóptimo)
- **COS**: Cosmético (refinamiento visual menor)

Prioridad: **P0** (crítico) → **P1** (alto) → **P2** (medio) → **P3** (bajo)

---

## Módulo 1: OperationSelector

**Archivo:** `src/components/operation-selector/OperationSelector.tsx`

| # | Tipo | P | Hallazgo | Ubicación | Detalle |
|---|------|---|----------|-----------|---------|
| 1.1 | BUG | P1 | Glass morphism inline diverge de `.glass-morphism-panel` | Línea 119 | Card usa `rgba(36, 36, 36, 0.4)` + `blur(20px)` inline. `.glass-morphism-panel` usa `rgba(28, 28, 32, 0.72)` + `blur(12px)`. Dos sistemas compitiendo. |
| 1.2 | IMP | P2 | `viewportScale` pattern obsoleto | Línea 27 | `Math.min(window.innerWidth / 430, 1)` aplicado para padding calculations. El resto del app usa `clamp()` puro. Inconsistente pero NO causa layout shift (no es transform:scale). |
| 1.3 | IMP | P2 | Estilos inline masivos | 16 bloques `style={{}}` | Cards con múltiples propiedades inline en vez de clases CSS/Tailwind. Dificulta mantenimiento y override de temas. |

---

## Módulo 2: InitialWizardModal (Wizard 5 pasos)

**Archivos:** `src/components/initial-wizard/InitialWizardModalView.tsx`, `src/components/initial-wizard/steps/Step5SicarInput.tsx`

| # | Tipo | P | Hallazgo | Ubicación | Detalle |
|---|------|---|----------|-----------|---------|
| 2.1 | BUG | P1 | Botones sesión activa usan `<button>` custom | Step5SicarInput.tsx líneas 62-77 | Dos `<button>` con clases manuales (`bg-amber-500/20`, `bg-red-500/20`) en vez de `ConstructiveActionButton` / `DestructiveActionButton`. Rompe sistema de 4 botones estandarizado. |
| 2.2 | COS | P3 | Panel sesión activa sin glass-morphism-panel | Step5SicarInput.tsx línea 38 | Usa `rounded-lg p-4 border border-amber-500/40` con `rgba(245, 158, 11, 0.08)` inline. No sigue glass morphism del resto del wizard. |

**Nota positiva:** `InitialWizardModalView.tsx` línea 103 usa `.glass-morphism-panel` correctamente. Steps 1-4 usan botones estandarizados correctamente.

---

## Módulo 3: Phase 1 — Conteo de Efectivo

**Archivos:** `src/components/cash-counting/guided/GuidedFieldView.tsx`, `src/components/cash-counting/guided/GuidedDenominationSection.tsx`

| # | Tipo | P | Hallazgo | Ubicación | Detalle |
|---|------|---|----------|-----------|---------|
| 3.1 | IMP | P2 | Imágenes de denominaciones 404 | GuidedFieldView.tsx líneas 196-240 | Referencia a `/monedas-recortadas-dolares/` que no existe. 10+ imágenes billetes/monedas. Sin `onError` handler. **FUERA DE ALCANCE** — requiere assets externos (documentado desde v1.3.7T). |
| 3.2 | IMP | P2 | Glass morphism inline en GuidedDenominationSection | GuidedDenominationSection.tsx líneas 133-141 | Usa `rgba(36, 36, 36, 0.4)` + `blur(20px)` inline en vez de `.glass-morphism-panel`. **HALLAZGO NUEVO** no presente en plan original. |

---

## Módulo 4: Phase 2A — Entrega a Gerencia

**Archivo:** `src/components/phases/Phase2DeliverySection.tsx`

| # | Tipo | P | Hallazgo | Ubicación | Detalle |
|---|------|---|----------|-----------|---------|
| 4.1 | COS | P3 | Consistencia visual con Phase 1 | DeliveryFieldView.tsx | Layout funcional pero visualmente distinto al guided counting view. Campos de entrega sin patrón glass card. **BAJO IMPACTO** — no afecta funcionalidad. |

---

## Módulo 5: Phase 2B — Verificación Ciega

**Archivo:** `src/components/phases/Phase2VerificationSection.tsx` (783+ líneas)

| # | Tipo | P | Hallazgo | Ubicación | Detalle |
|---|------|---|----------|-----------|---------|
| 5.1 | IMP | P1 | Dead import `Button` genérico | Línea 16 | `import { Button } from '@/components/ui/button'` — **CONFIRMADO DEAD IMPORT**. `<Button` NO aparece en ningún JSX del archivo. Líneas 17-19 importan correctamente los botones estandarizados. |
| 5.2 | IMP | P3 | Componente aún 783+ líneas | — | A pesar de extracciones (VerificationHeader, VerificationProgress, etc.), archivo sigue extenso. **FUERA DE ALCANCE** — tarea separada. |

---

## Módulo 6: Phase 3 — Reporte Final

**Archivos:** `src/components/CashCalculation.tsx`, `src/components/cash-calculation/CashResultsDisplay.tsx`

| # | Tipo | P | Hallazgo | Ubicación | Detalle |
|---|------|---|----------|-----------|---------|
| 6.1 | BUG | P1 | `glassCard` inline diverge | CashResultsDisplay.tsx líneas 25-32 | Constante `glassCard` usa `rgba(36, 36, 36, 0.4)`. Usado 4 veces (líneas 93, 120, 188, 199). Debe alinearse con `.glass-morphism-panel`. |
| 6.2 | COS | P3 | `style={{ opacity: 1 }}` residual | CashCalculation.tsx línea 279 | v1.3.6Z removió `motion.div` y dejó `<div style={{ opacity: 1 }}>`. El `opacity: 1` es valor default CSS — redundante. |
| 6.3 | IMP | P2 | Glass morphism inline "Resultados Bloqueados" | CashCalculation.tsx líneas 292-300 | Overlay usa `rgba(36, 36, 36, 0.4)` inline. Mismo patrón que 6.1. |

---

## Módulo 7: Cross-Cutting (Transversal)

**Archivo raíz:** `src/index.css`

| # | Tipo | P | Hallazgo | Ubicación | Detalle |
|---|------|---|----------|-----------|---------|
| 7.1 | BUG | **P0** | **Dos sistemas de glass morphism coexisten** | index.css líneas 262, 494-513 | **PROBLEMA RAÍZ**: Variable CSS `--glass-bg-primary: rgba(36, 36, 36, 0.4)` (línea 262) vs clase `.glass-morphism-panel` con `rgba(28, 28, 32, 0.72) !important` (línea 496). La clase NO usa la variable. Afecta: OperationSelector, CashResultsDisplay, CashCalculation, GuidedDenominationSection. |
| 7.2 | IMP | P2 | `!important` en `.glass-morphism-panel` | index.css líneas 494-495 | Impide override contextual. Componentes con variaciones recurren a inline styles, perpetuando divergencia. |

---

## Resumen Cuantitativo

| Categoría | Cantidad | Archivos Afectados |
|-----------|----------|-------------------|
| BUG (P0-P1) | 2 | index.css, CashResultsDisplay.tsx, OperationSelector.tsx |
| IMP (P1-P3) | 6 | Step5SicarInput.tsx, Phase2VerificationSection.tsx, GuidedDenominationSection.tsx, CashCalculation.tsx, OperationSelector.tsx, index.css |
| COS (P3) | 3 | CashCalculation.tsx, Step5SicarInput.tsx, DeliveryFieldView.tsx |
| **Total** | **11** | **9 archivos únicos** |

## Componentes Confirmados Sin Issues

- ✅ `InitialWizardModalView.tsx` — usa `.glass-morphism-panel` correctamente
- ✅ Steps 1-4 del wizard — botones estandarizados correctos
- ✅ `Phase2Manager.tsx` — importa y usa botones estándar
- ✅ Sistema de 4 botones (Constructive, Destructive, Neutral, Primary) — todos con `React.forwardRef` + `asChild`

## Siguiente Paso

→ Ver `02_Modulo_Glass_Morphism_P0.md` para estrategia de resolución del problema raíz
