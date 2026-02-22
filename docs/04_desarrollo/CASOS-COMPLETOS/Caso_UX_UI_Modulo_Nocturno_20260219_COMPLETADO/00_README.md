# Caso #8: Auditoría UX/UI Módulo Nocturno

| Campo | Valor |
|-------|-------|
| **Caso** | #8 — UX/UI Módulo Nocturno |
| **Fecha creación** | 2026-02-19 |
| **Estado** | 🔴 Pendiente |
| **Prioridad** | 🟠 Alta (P0 glass morphism + P1 botones) |
| **Impacto** | Inconsistencia visual entre pantallas, dead code |
| **Origen** | `docs/04_desarrollo/Caso-UX-UI-Feb-19/Caso-Ux-UI-Feb-19.md` |

## Resumen

Auditoría exhaustiva del recorrido visual del módulo nocturno (corte de caja): OperationSelector → Wizard → Phase 1 → Phase 2 → Phase 3. Se detectaron 13 hallazgos categorizados como BUG/IMP/COS con prioridades P0-P3.

**Solo correcciones de presentación y consistencia visual.** NO incluye cambios funcionales/lógicos.

## Documentación

| # | Documento | Descripción |
|---|-----------|-------------|
| 1 | `01_Diagnostico_UX_UI_Nocturno.md` | Hallazgos por módulo con evidencia verificada contra código |
| 2 | `02_Plan_UX_UI_Nocturno.md` | Plan de ejecución en 5 pasos ordenado por prioridad |

## Solapamiento con Otros Casos

| Hallazgo | Caso existente | Relación |
|----------|---------------|----------|
| 3.1 (Imágenes 404) | Caso #4 (Imágenes Denominaciones) | Mismo problema, resolución en Caso #4 |
| 5.2 (Phase2 extenso) | Caso #6 (Testing Phase2) | Relacionado, refactor en Caso #6 |

Los 11 hallazgos restantes son genuinamente nuevos y no están cubiertos por los Casos 1-7.

## Hallazgo Crítico (P0)

**7.1 — Dos sistemas de glass morphism coexisten:**
- `.glass-morphism-panel` en CSS: `rgba(28, 28, 32, 0.72)` + `blur(12px)` con `!important`
- Inline styles en OperationSelector, CashResultsDisplay, MorningVerificationView: `rgba(36, 36, 36, 0.4)` + `blur(20px)`
- Crea inconsistencia visual notable entre pantallas

## Skills Aplicados

- `frontend-design`: Auditoría de design system
- `vercel-react-best-practices`: Optimización componentes React
- `web-design-guidelines`: Adherencia a guidelines UX/UI
