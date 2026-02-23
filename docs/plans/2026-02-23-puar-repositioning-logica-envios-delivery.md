# PUAR: Repositionamiento — Caso_Logica_Envios_Delivery

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mover el caso completado `Caso_Logica_Envios_Delivery` a `CASOS-COMPLETOS/` con sufijo `_COMPLETADO` y actualizar `docs/README.md` para reflejar el cierre.

**Architecture:** La estructura de `docs/` sigue el estándar "Anti-Bobos by SamuelERS". Los casos completados se mueven a `04_desarrollo/CASOS-COMPLETOS/` con sufijo `_COMPLETADO`. La Referencia Maestra es `EL_PUNTO_DE_PARTIDA_by_SamuelERS.md`.

**Tech Stack:** Shell (mv), edición de Markdown.

---

## Hallazgos del Triaje

### Recurso Principal — `docs/04_desarrollo/Caso_Logica_Envios_Delivery/`

| Campo | Valor |
|-------|-------|
| **Estado documentado** | ✅ IMPLEMENTADO Y CERRADO — "Core logic completo. UX communication completada (D-01 ✅ commit 1f729f4)" |
| **Fecha apertura** | Oct 2025 (lógica COD El Salvador, C807/Melos workaround) |
| **Fecha cierre** | 23 Feb 2026 (última actualización README, commit 1f729f4) |
| **Core implementado** | `sicarAdjustment.ts`, `DeliveryManager`, 25 TIER 0 tests, D-01 UX note en `CashResultsDisplay.tsx` |
| **Veredicto** | COMPLETADO. Mover a `CASOS-COMPLETOS/` con sufijo `_COMPLETADO`. |
| **Destino** | `docs/04_desarrollo/CASOS-COMPLETOS/Caso_Logica_Envios_Delivery_COMPLETADO/` |

**Justificación:** El README del caso padre declara explícitamente "✅ IMPLEMENTADO Y CERRADO" con referencia al commit 1f729f4 (D-01 UX note SICAR automático). El problema raíz (lógica de envíos COD con ajuste SICAR) fue resuelto completamente.

---

### Subcaso 1 — `Caso_Pantalla_Pendientes_Inicio/`

| Campo | Valor |
|-------|-------|
| **Estado en README propio** | "✅ APROBADO - Opción A" pero "🚧 Implementación: PENDIENTE" (24 Oct 2025) |
| **Estado real (evidencia CLAUDE.md)** | IMPLEMENTADO — `DeliveryDashboardWrapper.tsx` + PinModal funcionando (v3.0.0, v3.0.1) |
| **Sub-subcasos** | `Caso_Boton_Retornar_Inicio/` → fix v3.0.0 (botón Volver) \| `UX-UI_PIN/` → fix v3.0.1 (colores PIN modal) |
| **Discrepancia** | README subcase nunca actualizado post-implementación (patrón idéntico a CASO-SANN R2/R3) |
| **Veredicto** | COMPLETADO. La implementación real existe y es funcional. |

---

### Subcaso 2 — `Caso_Traslado_Modulo_Ingreso_Deliverys/`

| Campo | Valor |
|-------|-------|
| **Estado en README propio** | "✅ ANÁLISIS COMPLETO - PENDIENTE APROBACIÓN" (24 Jan 2025) |
| **Propuesta** | Phase 2.5 checkpoint para DeliveryManager antes del reporte final |
| **Decisión tomada** | SUPERSEDIDA — El problema fue resuelto mediante enfoque distinto: D-01 SICAR adjustment automático + nota UX informativa en `CashResultsDisplay.tsx` |
| **Veredicto** | SUPERSEDIDA/OBSOLETA — Se mueve con el caso padre sin modificaciones. |

**Nota sobre subcasos no implementados:** `Caso_Traslado_Modulo_Ingreso_Deliverys` era una propuesta arquitectónica que fue desplazada por una solución más simple. Su documentación tiene valor histórico como registro de decisiones. Se preserva intacta dentro del caso padre al moverlo.

---

## Tasks

### Task 1: Escribir plan

**Files:**
- Create: `docs/plans/2026-02-23-puar-repositioning-logica-envios-delivery.md`

**Step 1:** Escribir este documento ✅ (completado)

**Step 2:** Commit
```bash
git add docs/plans/2026-02-23-puar-repositioning-logica-envios-delivery.md
git commit -m "docs(puar): plan de repositionamiento Caso_Logica_Envios_Delivery"
```

---

### Task 2: Mover Caso_Logica_Envios_Delivery a CASOS-COMPLETOS

**Files:**
- Move: `docs/04_desarrollo/Caso_Logica_Envios_Delivery/`
  → `docs/04_desarrollo/CASOS-COMPLETOS/Caso_Logica_Envios_Delivery_COMPLETADO/`

**Step 1:** Ejecutar mv
```bash
mv "docs/04_desarrollo/Caso_Logica_Envios_Delivery" \
   "docs/04_desarrollo/CASOS-COMPLETOS/Caso_Logica_Envios_Delivery_COMPLETADO"
```

**Step 2:** Verificar
```bash
ls docs/04_desarrollo/CASOS-COMPLETOS/ | grep Logica
# Expected: Caso_Logica_Envios_Delivery_COMPLETADO
```

**Step 3:** Commit
```bash
git add -A
git commit -m "docs(puar): mover Caso_Logica_Envios_Delivery → CASOS-COMPLETOS"
```

---

### Task 3: Actualizar docs/README.md

**Files:**
- Modify: `docs/README.md` (sección Casos Completos)

**Step 1:** Agregar referencia al caso movido bajo la lista de Casos Completos.

**Step 2:** Commit
```bash
git add docs/README.md
git commit -m "docs(puar): actualizar README — Caso_Logica_Envios_Delivery movido a CASOS-COMPLETOS"
```

---

## Checklist de Cierre

- [x] Plan guardado en `docs/plans/`
- [ ] Caso movido a `CASOS-COMPLETOS/` con sufijo `_COMPLETADO`
- [ ] `docs/README.md` actualizado
- [ ] Sin carpeta `Caso_Logica_Envios_Delivery` en `04_desarrollo/` root
