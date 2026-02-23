# PUAR: Repositionamiento — Caso-Sesion-Activa-No-Notifica

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Mover el caso completado `Caso-Sesion-Activa-No-Notifica` a `CASOS-COMPLETOS/` con sufijo `_COMPLETADO` y actualizar `docs/README.md` para reflejar el cierre.

**Architecture:** La estructura de `docs/` sigue el estándar "Anti-Bobos by SamuelERS". Los casos completados se mueven a `04_desarrollo/CASOS-COMPLETOS/` con sufijo `_COMPLETADO`. La Referencia Maestra es `EL_PUNTO_DE_PARTIDA_by_SamuelERS.md`.

**Tech Stack:** Shell (mv), edición de Markdown.

---

## Hallazgos del Triaje

### Recurso — `docs/04_desarrollo/Caso-Sesion-Activa-No-Notifica/`

| Campo | Valor |
|-------|-------|
| **Estado documentado** | ✅ COMPLETADO — "Archivado en CASOS-COMPLETOS (ver commit dfcca5b)" |
| **Fecha apertura** | 2026-02-17 |
| **Fecha cierre** | 2026-02-19 aprox. (commits a6eff8f, dfcca5b) |
| **Subcasos** | 4/4 completos (R1, R2, R3, R4) |
| **Problema** | Folder físicamente NO movido a CASOS-COMPLETOS a pesar del estado documentado |
| **Veredicto** | COMPLETADO. Mover a `CASOS-COMPLETOS/` con sufijo `_COMPLETADO`. |
| **Destino** | `docs/04_desarrollo/CASOS-COMPLETOS/Caso-Sesion-Activa-No-Notifica_COMPLETADO/` |

**Justificación:** `00_INDEX.md` declara explícitamente "COMPLETADO — Archivado en CASOS-COMPLETOS" con referencia a commit dfcca5b. Los 4 subcasos (R1 Refinamiento Banner, R2 Rediseño Notificación, R3 Deuda Funcional 5 bugs, R4 Restauración Progreso) aparecen como completados en la tabla de índice. El folder nunca fue físicamente movido.

**Nota sobre `08_RESTAURACION_PROGRESO_R4_COMPLETADO`:** Este subfolder ya existe de forma independiente en `CASOS-COMPLETOS/` (probablemente movido manualmente en su momento). Al mover el caso padre, el subfolder R4 quedará también dentro de él — es una duplicación documental menor y pre-existente, fuera del alcance de este PUAR.

---

## Tasks

### Task 1: Escribir plan

**Files:**
- Create: `docs/plans/2026-02-23-puar-repositioning-sesion-activa-no-notifica.md`

**Step 1:** Escribir este documento ✅ (completado)

**Step 2:** Commit
```bash
git add docs/plans/2026-02-23-puar-repositioning-sesion-activa-no-notifica.md
git commit -m "docs(puar): plan de repositionamiento Caso-Sesion-Activa-No-Notifica"
```

---

### Task 2: Mover Caso-Sesion-Activa-No-Notifica a CASOS-COMPLETOS

**Files:**
- Move: `docs/04_desarrollo/Caso-Sesion-Activa-No-Notifica/`
  → `docs/04_desarrollo/CASOS-COMPLETOS/Caso-Sesion-Activa-No-Notifica_COMPLETADO/`

**Step 1:** Ejecutar mv
```bash
mv "docs/04_desarrollo/Caso-Sesion-Activa-No-Notifica" \
   "docs/04_desarrollo/CASOS-COMPLETOS/Caso-Sesion-Activa-No-Notifica_COMPLETADO"
```

**Step 2:** Verificar
```bash
ls docs/04_desarrollo/CASOS-COMPLETOS/ | grep Sesion
# Expected: Caso-Sesion-Activa-No-Notifica_COMPLETADO
```

**Step 3:** Commit
```bash
git add -A
git commit -m "docs(puar): mover Caso-Sesion-Activa-No-Notifica → CASOS-COMPLETOS"
```

---

### Task 3: Actualizar docs/README.md

**Files:**
- Modify: `docs/README.md` (sección Casos Completos)

**Step 1:** Agregar referencia al caso movido bajo la lista de Casos Completos.

**Step 2:** Commit
```bash
git add docs/README.md
git commit -m "docs(puar): actualizar README — Caso-Sesion-Activa-No-Notifica movido a CASOS-COMPLETOS"
```

---

## Checklist de Cierre

- [x] Plan guardado en `docs/plans/`
- [ ] Caso movido a `CASOS-COMPLETOS/` con sufijo `_COMPLETADO`
- [ ] `docs/README.md` actualizado
- [ ] Sin carpeta `Caso-Sesion-Activa-No-Notifica` en `04_desarrollo/` root
