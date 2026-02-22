# Diagnóstico UX/UI — Módulo Nocturno (Corte de Caja)

> ⚠️ Corregido 2026-02-19: 5 imprecisiones corregidas vs documento original. Verificado contra código fuente real.

| Campo | Valor |
|-------|-------|
| **Fecha** | 2026-02-19 |
| **Alcance** | Flujo nocturno completo: OperationSelector → Wizard → Phase 1 → Phase 2 → Phase 3 |
| **Tipo** | Solo visual/presentación — sin cambios funcionales |
| **Hallazgos** | 13 (2 BUG-P0/P1, 4 BUG/IMP-P1, 4 IMP-P2, 3 COS-P3) |

## Categorización

- **BUG**: Error visual que rompe la experiencia o contradice el design system
- **IMP**: Mejora de implementación (código correcto pero subóptimo)
- **COS**: Cosmético (refinamiento visual menor)
- **Prioridad**: P0 (crítico) → P1 (alto) → P2 (medio) → P3 (bajo)

---

## Hallazgos por Módulo

### Módulo 1: OperationSelector (`src/components/operation-selector/OperationSelector.tsx`)

| # | Tipo | P | Hallazgo | Detalle |
|---|------|---|----------|---------|
| 1.1 | BUG | P1 | Glass morphism inline diverge de `.glass-morphism-panel` | Cards usan `rgba(36, 36, 36, 0.4)` + `blur(20px)` inline, mientras `.glass-morphism-panel` usa `rgba(28, 28, 32, 0.72)` + `blur(12px)` con `!important`. Dos sistemas compitiendo. |
| 1.2 | IMP | P2 | `viewportScale` pattern obsoleto | `Math.min(window.innerWidth / 430, 1)` aplicado como `transform: scale()` — el resto del app usa `clamp()`. Causa layout shift. |
| 1.3 | IMP | P2 | Estilos inline masivos (~50 líneas de `style={{}}`) | Cards con 15+ propiedades inline en vez de clases CSS/Tailwind. Dificulta mantenimiento. |

### Módulo 2: InitialWizardModal (Wizard 5 pasos)

| # | Tipo | P | Hallazgo | Detalle |
|---|------|---|----------|---------|
| 2.1 | BUG | P1 | Botones sesión activa (Step5) usan `<button>` custom | `Step5SicarInput.tsx` líneas 62-77: Dos `<button>` con clases manuales (`bg-amber-500/20`, `bg-red-500/20`) en vez de `ConstructiveActionButton`/`DestructiveActionButton`. Rompe sistema de 4 botones estandarizado. |
| 2.2 | COS | P3 | Panel sesión activa sin `glass-morphism-panel` | El panel usa `rounded-lg p-4 border border-amber-500/40` con `rgba(245, 158, 11, 0.08)` inline — no sigue glass morphism del resto del wizard. |

### Módulo 3: Phase 1 — Conteo de Efectivo

| # | Tipo | P | Hallazgo | Detalle |
|---|------|---|----------|---------|
| 3.1 | IMP | P2 | `GuidedFieldView.tsx` — imágenes de denominaciones 404 | Referencia a `/monedas-recortadas-dolares/` con paths hardcoded en español. El fallback funciona pero sin imágenes la UX pierde contexto visual. **Nota:** Este hallazgo es el MISMO problema del Caso #4. Resolución allí. |

### Módulo 4: Phase 2A — Entrega a Gerencia (`Phase2DeliverySection`)

| # | Tipo | P | Hallazgo | Detalle |
|---|------|---|----------|---------|
| 4.1 | COS | P3 | `DeliveryFieldView.tsx` — consistencia visual con Phase 1 | El layout usa `glass-morphism-panel` correctamente (línea 284), pero visualmente difiere del guided counting view en espaciado y estructura de campos. **Corrección:** Documento original afirmaba que NO usaba glass-morphism-panel — sí lo usa. |

### Módulo 5: Phase 2B — Verificación Ciega (`Phase2VerificationSection`)

| # | Tipo | P | Hallazgo | Detalle |
|---|------|---|----------|---------|
| 5.1 | IMP | P2 | Dead import de `Button` genérico (línea 16) | Importa `Button` de `@/components/ui/button` pero `<Button>` **no aparece en ningún JSX** del componente (verificado con grep). Dead import que debe removerse. |
| 5.2 | IMP | P3 | Componente de 570 líneas | A pesar de extracciones anteriores (VerificationHeader, VerificationProgress), el archivo principal sigue extenso. No es bug visual pero dificulta mantenimiento. **Corrección:** Documento original decía 783+ líneas — actual verificado: 570 líneas. Relacionado con Caso #6. |

### Módulo 6: Phase 3 — Reporte Final (`CashCalculation.tsx` + `CashResultsDisplay.tsx`)

| # | Tipo | P | Hallazgo | Detalle |
|---|------|---|----------|---------|
| 6.1 | BUG | P1 | `CashResultsDisplay.tsx` — `glassCard` inline diverge | Constante `glassCard` usa `rgba(36, 36, 36, 0.4)` — mismo problema que 1.1. Debe alinearse con `.glass-morphism-panel`. |
| 6.2 | COS | P3 | Framer Motion removido pero `opacity: 1` persiste | v1.3.6Z removió `motion.div` reemplazando por `<div style={{ opacity: 1 }}>` — el `opacity: 1` es redundante (valor default CSS). |

### Módulo 7: Cross-Cutting (Transversal)

| # | Tipo | P | Hallazgo | Detalle |
|---|------|---|----------|---------|
| 7.1 | BUG | **P0** | Dos sistemas de glass morphism coexisten | **Problema raíz.** `.glass-morphism-panel` en CSS (`rgba(28, 28, 32, 0.72)`) vs inline styles en múltiples componentes (`rgba(36, 36, 36, 0.4)`). Afecta: OperationSelector, CashResultsDisplay, y **MorningVerificationView** (línea 77 — omitido en auditoría original). |
| 7.2 | IMP | P1 | Botones no estandarizados en `Step5SicarInput` | Único lugar detectado donde se usan `<button>` raw en vez del sistema de 4 botones. |
| 7.3 | IMP | P2 | `!important` en `.glass-morphism-panel` | `index.css` líneas 493-495 usa `!important`, impidiendo override contextual limpio. Componentes que necesitan variaciones recurren a inline styles. |

---

## Componentes Afectados (Verificado)

| Componente | Glass inline? | Glass CSS? | Hallazgos |
|------------|:------------:|:----------:|-----------|
| `OperationSelector.tsx` | ✅ `rgba(36,36,36,0.4)` | ❌ | 1.1, 1.2, 1.3 |
| `Step5SicarInput.tsx` | ❌ | ❌ | 2.1, 2.2 |
| `GuidedFieldView.tsx` | ❌ | ❌ | 3.1 (→ Caso #4) |
| `DeliveryFieldView.tsx` | ❌ | ✅ `glass-morphism-panel` L284 | 4.1 |
| `Phase2VerificationSection.tsx` | ❌ | ❌ | 5.1, 5.2 |
| `CashResultsDisplay.tsx` | ✅ `rgba(36,36,36,0.4)` | ❌ | 6.1, 6.2 |
| `CashCalculation.tsx` | ❌ | ❌ | 6.2 |
| `MorningVerificationView.tsx` | ✅ `rgba(36,36,36,0.4)` L77 | ❌ | 7.1 (nuevo) |
| `index.css` `.glass-morphism-panel` | N/A | ✅ con `!important` | 7.3 |

## Fuera de Alcance

- Cambios funcionales/lógicos (anti-fraude, cálculos, WhatsApp)
- Módulo matutino (MorningVerification) — excepto hallazgo 7.1 glass divergencia
- Módulo deliveries
- Imágenes de denominaciones (→ Caso #4)
- Refactor de Phase2VerificationSection (→ Caso #6)
- Tests

## Correcciones Aplicadas vs Documento Original

| # | Imprecisión original | Corrección |
|---|---------------------|------------|
| 1 | 4.1: "No tiene glass-morphism-panel" | DeliveryFieldView SÍ usa `glass-morphism-panel` (línea 284) |
| 2 | 5.2: "783+ líneas" | Actual: 570 líneas (`wc -l` verificado) |
| 3 | Línea 86: "783 líneas — tarea separada" | Corregido a 570 líneas |
| 4 | 7.1: Omite MorningVerificationView | Agregado: también tiene `rgba(36,36,36,0.4)` inline (línea 77) |
| 5 | 5.1: "verificar si se usa" | Verificado: `<Button>` NO aparece en JSX — dead import confirmado |
