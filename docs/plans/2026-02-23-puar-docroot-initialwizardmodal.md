# PUAR — Auditoría Docs Root + Caso InitialWizardModal

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Sanear la raíz de `docs/` eliminando archivos no oficiales y cerrar correctamente el caso `Caso_Desmonolitizacion_InitialWizardModal_20260207` con su `00_README.md` obligatorio y reubicación a `CASOS-COMPLETOS`.

**Architecture:** El archivo `EL_PUNTO_DE_PARTIDA_by_SamuelERS.md` (recurso auditado) es un archivo base oficial confirmado en `REGLAS_DOCUMENTACION.md:35` — se queda en raíz sin cambios. Los problemas reales encontrados son: (1) 4 archivos `.template.md` sueltos en raíz no listados como oficiales, (2) el caso COMPLETADO sin `00_README.md`, y (3) carpetas de estructura definidas pero faltantes.

**Tech Stack:** Solo operaciones de archivos/carpetas — no hay código fuente involucrado.

---

## VEREDICTO TRIAJE

| Recurso | Acción | Justificación |
|---------|--------|---------------|
| `docs/EL_PUNTO_DE_PARTIDA_by_SamuelERS.md` | **QUEDA** | Archivo base oficial. `REGLAS_DOCUMENTACION.md:35` lo lista explícitamente como excepción permitida en raíz |

---

## HALLAZGOS DE AUDITORÍA

### Hallazgo 1 — Archivos template sueltos en raíz (VIOLACIÓN REGLA 2)
Los siguientes archivos NO están en la lista de excepciones oficiales de `REGLAS_DOCUMENTACION.md`:
- `docs/REGLAS_DESARROLLO.template.md`
- `docs/REGLAS_DOCUMENTACION.template.md`
- `docs/REGLAS_INSPECCION.template.md`
- `docs/REGLAS_PROGRAMADOR.template.md`

→ Deben moverse a `docs/_plantillas/` (carpeta a crear).

### Hallazgo 2 — `Caso_Desmonolitizacion_InitialWizardModal_20260207` sin `00_README.md`
- **Caso:** COMPLETADO (11/11 pasos, 68/68 tests, 2026-02-07)
- **Falta:** `00_README.md` obligatorio por `REGLAS_DOCUMENTACION.md:133`
- **Convención:** Archivos usan `ORDEN_075_*` en vez de `NN_Descriptivo` — se mantiene como histórico pero se referencia en el README
- **Posición:** Está en `04_desarrollo/` pero debería estar en `04_desarrollo/CASOS-COMPLETOS/` con sufijo `_COMPLETADO`

### Hallazgo 3 — Carpetas de estructura definidas pero faltantes
`REGLAS_DOCUMENTACION.md:56-81` define estas carpetas que no existen aún:
- `docs/03_api/`
- `docs/05_operaciones/`

---

## TAREA 1: Crear `docs/_plantillas/` y mover templates

**Files:**
- Create: `docs/_plantillas/.gitkeep`
- Move: `docs/REGLAS_DESARROLLO.template.md` → `docs/_plantillas/REGLAS_DESARROLLO.template.md`
- Move: `docs/REGLAS_DOCUMENTACION.template.md` → `docs/_plantillas/REGLAS_DOCUMENTACION.template.md`
- Move: `docs/REGLAS_INSPECCION.template.md` → `docs/_plantillas/REGLAS_INSPECCION.template.md`
- Move: `docs/REGLAS_PROGRAMADOR.template.md` → `docs/_plantillas/REGLAS_PROGRAMADOR.template.md`

**Paso 1: Crear carpeta y mover archivos**

```bash
mkdir -p "docs/_plantillas"
mv "docs/REGLAS_DESARROLLO.template.md" "docs/_plantillas/"
mv "docs/REGLAS_DOCUMENTACION.template.md" "docs/_plantillas/"
mv "docs/REGLAS_INSPECCION.template.md" "docs/_plantillas/"
mv "docs/REGLAS_PROGRAMADOR.template.md" "docs/_plantillas/"
```

**Paso 2: Verificar raíz limpia**

```bash
ls docs/*.template.md 2>/dev/null && echo "ERROR: quedan templates" || echo "OK: raíz limpia"
ls docs/_plantillas/
```
Esperado: Sin archivos `.template.md` en raíz. Carpeta `_plantillas/` con 4 archivos.

**Paso 3: Actualizar REGLAS_DOCUMENTACION.md**

Añadir `_plantillas/` a la lista de excepciones (línea ~36, después de `La_Receta_Maestra_by_SamuelERS/`):
```markdown
  - `_plantillas/` ← plantillas para nuevos documentos REGLAS_*
```

**Paso 4: Verificar que REGLAS_*.md originales siguen en raíz (no se movieron)**

```bash
ls docs/REGLAS_*.md
```
Esperado: Los 7 archivos `REGLAS_*.md` (sin `.template`) siguen ahí.

---

## TAREA 2: Crear `00_README.md` del caso InitialWizardModal

**Files:**
- Create: `docs/04_desarrollo/Caso_Desmonolitizacion_InitialWizardModal_20260207/00_README.md`

**Paso 1: Crear el archivo**

Contenido exacto:

```markdown
# Caso: Desmonolitización InitialWizardModal.tsx

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-07 |
| **Fecha actualización** | 2026-02-07 |
| **Estado** | 🟢 Completado |
| **Prioridad** | Alta |
| **Responsable** | IA (ORDEN TÉCNICA #075) |

## Resumen

Descomposición de `src/components/InitialWizardModal.tsx` (681 líneas, monolito) en
arquitectura modular de 3 capas (Domain, Controller, Presentación), siguiendo el patrón
exitoso de ORDEN #074 (MorningVerification).

## Resultado

681 líneas → 3 líneas (re-export) + 15 archivos modulares. 68/68 tests nuevos. Build OK.
Backward compatible: `Index.tsx` sin cambios.

## Documentos

> Nota: Los archivos usan convención `ORDEN_075_*` (nomenclatura interna de ORDEN TÉCNICA)
> en lugar del estándar `NN_Descriptivo`. Se mantiene como histórico.

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `ORDEN_075_Plan.md` | Resumen de ejecución: objetivos, estructura final, pasos | ✅ |
| `ORDEN_075_CoverageEvidence.md` | Evidencia de 68/68 tests passing con detalle por grupo | ✅ |
| `ORDEN_075_ParityChecklist.md` | Checklist de paridad funcional 18/18 PASS | ✅ |

## Referencias

- Código fuente: `src/components/initial-wizard/`, `src/hooks/initial-wizard/`, `src/lib/initial-wizard/`
- Backup original: `Backups-RESPALDOS/20260207_refactor_initialwizardmodal/InitialWizardModal.tsx.bak`
- Plan de ejecución completo: `.claude/plans/valiant-swimming-hare.md`
- Caso hermano: `Caso_Desmonolitizacion_CashCounter_20260207/`
- Caso hermano: `Caso_Desmonolitizacion_MorningVerification_20260207/`
```

**Paso 2: Verificar el archivo creado**

```bash
ls "docs/04_desarrollo/Caso_Desmonolitizacion_InitialWizardModal_20260207/"
```
Esperado: `00_README.md  ORDEN_075_CoverageEvidence.md  ORDEN_075_ParityChecklist.md  ORDEN_075_Plan.md`

---

## TAREA 3: Mover caso a CASOS-COMPLETOS

**Files:**
- Move: `docs/04_desarrollo/Caso_Desmonolitizacion_InitialWizardModal_20260207/` → `docs/04_desarrollo/CASOS-COMPLETOS/Caso_Desmonolitizacion_InitialWizardModal_20260207_COMPLETADO/`

**Paso 1: Mover la carpeta**

```bash
mv "docs/04_desarrollo/Caso_Desmonolitizacion_InitialWizardModal_20260207" \
   "docs/04_desarrollo/CASOS-COMPLETOS/Caso_Desmonolitizacion_InitialWizardModal_20260207_COMPLETADO"
```

**Paso 2: Verificar reubicación**

```bash
ls "docs/04_desarrollo/CASOS-COMPLETOS/" | grep InitialWizard
ls "docs/04_desarrollo/" | grep InitialWizard
```
Esperado: Primera línea muestra el caso con sufijo `_COMPLETADO`. Segunda línea: sin resultados.

---

## TAREA 4: Crear carpetas de estructura faltantes

**Files:**
- Create: `docs/03_api/.gitkeep`
- Create: `docs/05_operaciones/.gitkeep`

**Paso 1: Crear carpetas**

```bash
mkdir -p "docs/03_api"
mkdir -p "docs/05_operaciones"
touch "docs/03_api/.gitkeep"
touch "docs/05_operaciones/.gitkeep"
```

**Paso 2: Verificar estructura completa**

```bash
ls docs/ | grep -E "^0[1-5]_"
```
Esperado: `01_guias  02_arquitectura  03_api  04_desarrollo  05_operaciones`

---

## TAREA 5: Verificación final de raíz docs/

**Paso 1: Audit final**

```bash
# Solo deben aparecer los archivos base oficiales:
ls docs/*.md
```

Esperado únicamente:
```
docs/EL_PUNTO_DE_PARTIDA_by_SamuelERS.md
docs/README.md
docs/REGLAS_DE_LA_CASA.md
docs/REGLAS_DESARROLLO.md
docs/REGLAS_DOCUMENTACION.md
docs/REGLAS_INSPECCION.md
docs/REGLAS_MOLDE_ORDENES_DE_TRABAJO.md
docs/REGLAS_PROGRAMADOR.md
```

**Paso 2: Confirmar que el PUNTO DE PARTIDA no tiene referencias rotas**

Los links de `EL_PUNTO_DE_PARTIDA_by_SamuelERS.md` apuntan a archivos que existen — no hay
cambios que afecten sus referencias (no se movió nada que él referencie).

```bash
# Los 7 REGLAS_*.md siguen en raíz — links válidos
grep -o '\./REGLAS[^)]*' "docs/EL_PUNTO_DE_PARTIDA_by_SamuelERS.md"
```
Esperado: Lista de referencias que aún existen en `docs/`.

---

## RESUMEN DE CAMBIOS

| Acción | Detalle |
|--------|---------|
| ✅ QUEDA | `EL_PUNTO_DE_PARTIDA_by_SamuelERS.md` — oficial, sin cambios |
| ✅ CREAR | `docs/_plantillas/` con 4 archivos template |
| ✅ MOVER | 4 `*.template.md` de raíz → `_plantillas/` |
| ✅ CREAR | `00_README.md` del caso InitialWizardModal |
| ✅ MOVER | Caso → `CASOS-COMPLETOS/..._COMPLETADO` |
| ✅ CREAR | `docs/03_api/` y `docs/05_operaciones/` (vacías, estructura) |
| ✅ ACTUALIZAR | `REGLAS_DOCUMENTACION.md` — añadir `_plantillas/` a excepciones |
