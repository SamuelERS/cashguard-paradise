# PUAR: Repositionamiento — Caso_Investigacion_Priorizacion_UX_UI_20260223

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mover el caso completado `Caso_Investigacion_Priorizacion_UX_UI_20260223` a `CASOS-COMPLETOS/` con sufijo `_COMPLETADO` y actualizar `docs/README.md` para reflejar el cierre.

**Architecture:** La estructura de `docs/` sigue el estándar "Anti-Bobos by SamuelERS". Los casos completados se mueven a `04_desarrollo/CASOS-COMPLETOS/` con sufijo `_COMPLETADO`. La Referencia Maestra es `EL_PUNTO_DE_PARTIDA_by_SamuelERS.md`.

**Tech Stack:** Shell (mv), edición de Markdown.

---

## Hallazgos del Triaje

### Recurso Principal — `docs/04_desarrollo/Caso_Investigacion_Priorizacion_UX_UI_20260223/`

| Campo | Valor |
|-------|-------|
| **Tipo de caso** | Investigación forense DACC — auditoría de priorización UX/UI |
| **Metodología** | DACC — Auditoría forense sin modificar código de producto |
| **Estado documentado** | Investigación completa. Veredicto emitido. Caso canónico ejecutado |
| **Fecha apertura** | 2026-02-23 (sesión de investigación única) |
| **Fecha cierre** | 2026-02-23 (caso canónico `Caso_Logica_Envios_Delivery` implementado y archivado ese mismo día) |
| **Mandato cumplido** | Evaluar 4 candidatos, recomendar 1 para implementación → `Caso_Logica_Envios_Delivery` elegido (7.6/10) → implementado → archivado en CASOS-COMPLETOS |
| **Veredicto** | COMPLETADO. La investigación produjo su entregable y fue ejecutada. |
| **Destino** | `docs/04_desarrollo/CASOS-COMPLETOS/Caso_Investigacion_Priorizacion_UX_UI_20260223_COMPLETADO/` |

**Justificación:** Este es un caso de investigación forense, no un caso de desarrollo de features. Su mandato era: analizar la realidad vs documentación de 4 casos candidatos, puntuar mediante fórmula BDRE, recomendar un caso canónico y definir el orden de ejecución. Ese mandato fue completamente ejecutado:
- La matriz Realidad vs Documentación fue producida (`01_Matriz_Realidad_vs_Documentacion.md`).
- La matriz de priorización fue producida con scores cuantitativos (`02_Matriz_Priorizacion_Valor.md`).
- El caso canónico fue seleccionado (`03_Caso_Canonico_Recomendado.md`).
- La orden de ejecución fue definida (`04_Orden_Ejecucion_Agente.md`).
- El caso canónico recomendado (`Caso_Logica_Envios_Delivery`) fue implementado (commit `1f729f4` — D-01 SICAR UX note) y archivado en `CASOS-COMPLETOS` (commit `dad6ca7`, 2026-02-23).

---

### Análisis de los 5 documentos de investigación

| Documento | Contenido | Estado |
|-----------|-----------|--------|
| `00_README.md` | Resumen ejecutivo, veredicto final, hallazgos críticos, estado de salud técnica | ✅ Completo |
| `01_Matriz_Realidad_vs_Documentacion.md` | Tabla comparativa doc vs código para 4 casos; identificación de brechas por tipo | ✅ Completo |
| `02_Matriz_Priorizacion_Valor.md` | Scores BDRE para los 4 casos; ranking final con umbrales | ✅ Completo |
| `03_Caso_Canonico_Recomendado.md` | Justificación del GO para Caso D; alcance Opción C; evidencia código existente; criterios de éxito | ✅ Completo |
| `04_Orden_Ejecucion_Agente.md` | Pasos de ejecución TDD RED→GREEN; descubrimiento de implementación base ya completa (sicarAdjustment.ts + 18 tests); archivos a NO modificar | ✅ Completo |

**Hallazgo clave de `04_Orden_Ejecucion_Agente.md`:** La investigación forense descubrió que la implementación del caso canónico ya superaba lo esperado — no solo Opción C sino también Opción B estaban implementadas (sicarAdjustment.ts con 18 tests, integración en CashCalculation.tsx, sección Phase 3 en CashResultsDisplay.tsx). Solo faltaba la comunicación UX, que fue resuelta con el D-01 UX note (commit `1f729f4`).

---

### Nota sobre casos secundarios mencionados en la investigación

| Caso mencionado | Estado al momento de la investigación | Estado actual |
|-----------------|--------------------------------------|---------------|
| `Caso_Logica_Envios_Delivery` | GO — Caso Canónico (7.6/10) | ✅ COMPLETADO → ya en CASOS-COMPLETOS |
| `Caso-Sesion-Activa-No-Notifica` | NO-GO — solo deuda documental (1.6/10) | Permanece en `04_desarrollo/` — el INDEX sigue desactualizado (pendiente corrección menor) |
| `Caso_Estrategia_UI_Datos_Reales_20260217` | CONDICIONAL (7.2/10) | Activo — fuera del scope de este PUAR |
| `Caso_PWA_Produccion_20260219` | NO-GO (4.4/10) | Activo — fuera del scope de este PUAR |

---

## Tasks

### Task 1: Escribir plan

**Files:**
- Create: `docs/plans/2026-02-23-puar-repositioning-investigacion-priorizacion-ux-ui.md`

**Step 1:** Escribir este documento ✅ (completado)

**Step 2:** Commit
```bash
git add docs/plans/2026-02-23-puar-repositioning-investigacion-priorizacion-ux-ui.md
git commit -m "docs(puar): plan de repositionamiento Caso_Investigacion_Priorizacion_UX_UI_20260223"
```

---

### Task 2: Mover Caso_Investigacion_Priorizacion_UX_UI_20260223 a CASOS-COMPLETOS

**Files:**
- Move: `docs/04_desarrollo/Caso_Investigacion_Priorizacion_UX_UI_20260223/`
  → `docs/04_desarrollo/CASOS-COMPLETOS/Caso_Investigacion_Priorizacion_UX_UI_20260223_COMPLETADO/`

**Step 1:** Ejecutar mv
```bash
mv "docs/04_desarrollo/Caso_Investigacion_Priorizacion_UX_UI_20260223" \
   "docs/04_desarrollo/CASOS-COMPLETOS/Caso_Investigacion_Priorizacion_UX_UI_20260223_COMPLETADO"
```

**Step 2:** Verificar
```bash
ls docs/04_desarrollo/CASOS-COMPLETOS/ | grep Investigacion
# Expected: Caso_Investigacion_Priorizacion_UX_UI_20260223_COMPLETADO
```

**Step 3:** Commit
```bash
git add -A
git commit -m "docs(puar): mover Caso_Investigacion_Priorizacion_UX_UI_20260223 → CASOS-COMPLETOS"
```

---

### Task 3: Actualizar docs/README.md

**Files:**
- Modify: `docs/README.md` (sección Casos Completos)

**Step 1:** Agregar referencia al caso movido bajo la lista de Casos Completos.

**Step 2:** Commit
```bash
git add docs/README.md
git commit -m "docs(puar): actualizar README — Caso_Investigacion_Priorizacion_UX_UI movido a CASOS-COMPLETOS"
```

---

## Checklist de Cierre

- [x] Plan guardado en `docs/plans/`
- [ ] Caso movido a `CASOS-COMPLETOS/` con sufijo `_COMPLETADO`
- [ ] `docs/README.md` actualizado
- [ ] Sin carpeta `Caso_Investigacion_Priorizacion_UX_UI_20260223` en `04_desarrollo/` root
