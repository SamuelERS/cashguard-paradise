# PUAR: Repositionamiento de Recursos Documentales — Denomination Images

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Resolver dos inconsistencias documentales detectadas por el Protocolo PUAR: declarar explícitamente `EL_PUNTO_DE_PARTIDA_by_SamuelERS.md` como excepción oficial en `REGLAS_DOCUMENTACION.md`, y mover el caso completado `Caso_Consolidacion_DenominationImages_20260222` a `CASOS-COMPLETOS/`.

**Architecture:** La estructura de `docs/` sigue el estándar "Anti-Bobos by SamuelERS". Los archivos de reglas base viven en el root. Los casos completados tienen su subcarpeta `CASOS-COMPLETOS/` dentro de `04_desarrollo/`. El proyecto usa el sufijo `_COMPLETADO` como convención de cierre.

**Tech Stack:** Shell (mv), edición de Markdown.

---

## Hallazgos del Triaje

### Recurso A — `docs/EL_PUNTO_DE_PARTIDA_by_SamuelERS.md`

| Campo | Valor |
|-------|-------|
| **Estado actual** | Archivo suelto en `docs/` root |
| **Tipo** | Índice maestro de navegación (mapa de mapas) |
| **Veredicto** | VITAL. Ubicación correcta. Problema: no está en lista de excepciones de `REGLAS_DOCUMENTACION.md`. |
| **Acción** | Declarar excepción explícita en `REGLAS_DOCUMENTACION.md` §Regla 2. Sin mover. |

**Justificación:** `docs/README.md` (línea 79) ya lo lista bajo "Reglas del Juego (En Raíz)".
El sistema trata todos los `REGLAS_*.md` como base files, pero la lista de excepciones de
`REGLAS_DOCUMENTACION.md` está incompleta. No mover — actualizamos la regla para que
el archivo sea "legal" sin que ningún auditor futuro lo marque como violación.

---

### Recurso B — `docs/04_desarrollo/Caso_Consolidacion_DenominationImages_20260222/`

| Campo | Valor |
|-------|-------|
| **Estado actual** | Caso activo en `04_desarrollo/` |
| **Estado documentado** | ✅ Completado — 2026-02-22 (5/5 OTs) |
| **Veredicto** | COMPLETADO. Debe pasar a `CASOS-COMPLETOS/` según convención del proyecto. |
| **Destino** | `docs/04_desarrollo/CASOS-COMPLETOS/Caso_Consolidacion_DenominationImages_20260222_COMPLETADO/` |

---

## Tasks

### Task 1: Escribir plan

**Files:**
- Create: `docs/plans/2026-02-23-puar-repositioning-denomination-images.md`

**Step 1:** Escribir este documento ✅ (completado)

**Step 2:** Commit
```bash
git add docs/plans/2026-02-23-puar-repositioning-denomination-images.md
git commit -m "docs(puar): plan de repositionamiento denomination-images + EL_PUNTO_DE_PARTIDA"
```

---

### Task 2: Mover Caso_Consolidacion a CASOS-COMPLETOS

**Files:**
- Move: `docs/04_desarrollo/Caso_Consolidacion_DenominationImages_20260222/`
  → `docs/04_desarrollo/CASOS-COMPLETOS/Caso_Consolidacion_DenominationImages_20260222_COMPLETADO/`

**Step 1:** Ejecutar mv
```bash
mv "docs/04_desarrollo/Caso_Consolidacion_DenominationImages_20260222" \
   "docs/04_desarrollo/CASOS-COMPLETOS/Caso_Consolidacion_DenominationImages_20260222_COMPLETADO"
```

**Step 2:** Verificar
```bash
ls docs/04_desarrollo/CASOS-COMPLETOS/ | grep Denomination
# Expected: Caso_Consolidacion_DenominationImages_20260222_COMPLETADO
```

**Step 3:** Commit
```bash
git add -A
git commit -m "docs(puar): mover Caso_Consolidacion_DenominationImages → CASOS-COMPLETOS"
```

---

### Task 3: Actualizar excepción en REGLAS_DOCUMENTACION.md

**Files:**
- Modify: `docs/REGLAS_DOCUMENTACION.md` (líneas 25-27, Regla 2)

**Step 1:** Agregar `EL_PUNTO_DE_PARTIDA_by_SamuelERS.md` a la lista de excepciones.

**Step 2:** Verificar que el archivo tenga < 500 líneas post-edición.

**Step 3:** Commit
```bash
git add docs/REGLAS_DOCUMENTACION.md
git commit -m "docs(puar): declarar EL_PUNTO_DE_PARTIDA como excepción oficial en reglas"
```

---

### Task 4: Actualizar docs/README.md

**Files:**
- Modify: `docs/README.md`

**Step 1:** Quitar `Caso_Consolidacion_DenominationImages_20260222` de sección activa si estuviera listado.

**Step 2:** Agregar referencia en sección `CASOS-COMPLETOS`.

**Step 3:** Commit
```bash
git add docs/README.md
git commit -m "docs(puar): actualizar README — Caso_Consolidacion movido a CASOS-COMPLETOS"
```

---

## Checklist de Cierre

- [ ] Plan guardado en `docs/plans/`
- [ ] Caso movido a `CASOS-COMPLETOS/` con sufijo `_COMPLETADO`
- [ ] `REGLAS_DOCUMENTACION.md` actualizado con excepción explícita
- [ ] `docs/README.md` actualizado
- [ ] Sin archivos sueltos en `docs/` root (salvo excepciones declaradas)
