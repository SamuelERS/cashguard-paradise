# PUAR: Caso_QA_Legacy_20260205 → CASOS-COMPLETOS

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Archivar el caso completado `Caso_QA_Legacy_20260205` en `CASOS-COMPLETOS/`, enriqueciendo su `00_README.md` antes del traslado.

**Architecture:** El caso contiene documentación de la "Operación Isla Rápida" (completada 2026-01-28). Su destino natural es `docs/04_desarrollo/CASOS-COMPLETOS/` con sufijo `_COMPLETADO`, siguiendo la convención activa del proyecto.

**Tech Stack:** Solo operaciones de filesystem (mv) y edición de Markdown.

---

## Contexto del PUAR

### Diagnóstico Técnico

**Contenido del caso:**
- `00_README.md` — 19 líneas, muy escueto. Estado: 🟢 Completado (2026-02-05)
- `tests/031-operacion-isla-rapida.md` — 693 líneas. Documenta exhaustivamente la Operación Isla Rápida (refactor `setup.ts` + paralelismo Vitest). Cerrado 2026-01-28, commit `ebd82a1`.

### Veredicto de triaje
- **¿Obsoleto?** No. Documenta cambios arquitectónicos reales implementados en producción.
- **¿Duplicado?** No. Único en el sistema.
- **¿Vital?** Sí (como referencia histórica de la infraestructura de tests).
- **¿Estado?** 🟢 COMPLETADO (cerrado 2026-01-28).
- **¿Acción?** ARCHIVAR → mover a `CASOS-COMPLETOS/` con sufijo `_COMPLETADO`.

### Convención de nomenclatura (analizada en CASOS-COMPLETOS/)
```
Caso_Consolidacion_DenominationImages_20260222_COMPLETADO/
Caso_QA_Legacy_20260205_COMPLETADO/   ← destino
```

---

## Task 1: Enriquecer 00_README.md antes del traslado

**Archivo:** `docs/04_desarrollo/Caso_QA_Legacy_20260205/00_README.md`

**Step 1: Reemplazar contenido actual con versión enriquecida**

Reemplazar el contenido completo del archivo por:

```markdown
# Caso: QA Legacy — Operación Isla Rápida

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-01-27 |
| **Fecha cierre** | 2026-01-28 |
| **Fecha actualización** | 2026-02-05 |
| **Estado** | 🟢 Completado |
| **Prioridad** | Alta (en su momento) |
| **Responsable** | SamuelERS / AI Assistant |
| **Commit clave** | `ebd82a1` |

## Resumen Ejecutivo

Refactor del setup global de tests + habilitación de paralelismo real en Vitest.
Anteriomente conocido como carpeta legacy `qa/`, formalizado como Caso en 2026-02-05.

**Problema resuelto:** `setup.ts` tenía 321 líneas con mocks globales indiscriminados.
Varios causaban contaminación entre tests y degradaban el aislamiento.

**Solución implementada:**
- `setup.ts` reducido de 321 → ~145 líneas (-55%)
- Mocks no-universales migrados a `src/testing/mocks/browser-apis.ts` y `src/testing/mocks/storage.ts`
- Paralelismo real habilitado: `pool: forks`, `maxForks: 4`
- Guardrails anti-flake integrados en `afterEach`

**Métricas finales:**
- Smoke tests: 10/10 passing ✅
- Flake rate: 0.2% (2/972 tests) ✅
- Estabilidad: 3/3 runs consistentes ✅
- Build: 14.65s, 353.77 kB gzip ✅

## Documentos en este caso

- `tests/031-operacion-isla-rapida.md` — Análisis completo de `setup.ts` (12 bloques),
  tasks A-E, smoke tests, resultados de estabilidad y veredicto final.

## Archivos afectados en el proyecto

- `src/__tests__/setup.ts` (original, 321 líneas)
- `src/__tests__/setup.minimal.ts` (creado, ~145 líneas)
- `src/testing/mocks/browser-apis.ts` (creado, 318 líneas)
- `src/testing/mocks/storage.ts` (creado, 130 líneas)
- `vitest.config.ts` (pool: forks, maxForks: 4)
```

**Step 2: Verificar resultado**

```bash
head -5 "docs/04_desarrollo/Caso_QA_Legacy_20260205/00_README.md"
# Debe mostrar: "# Caso: QA Legacy — Operación Isla Rápida"
```

---

## Task 2: Mover caso a CASOS-COMPLETOS con sufijo _COMPLETADO

**Step 1: Ejecutar mv**

```bash
mv "docs/04_desarrollo/Caso_QA_Legacy_20260205" \
   "docs/04_desarrollo/CASOS-COMPLETOS/Caso_QA_Legacy_20260205_COMPLETADO"
```

**Step 2: Verificar traslado exitoso**

```bash
ls "docs/04_desarrollo/CASOS-COMPLETOS/Caso_QA_Legacy_20260205_COMPLETADO/"
# Debe mostrar: 00_README.md  tests/
```

**Step 3: Confirmar que ya no existe en su ubicación original**

```bash
ls "docs/04_desarrollo/" | grep QA
# No debe aparecer nada
```

---

## Task 3: Commit conjunto

```bash
git add docs/04_desarrollo/CASOS-COMPLETOS/Caso_QA_Legacy_20260205_COMPLETADO/ \
        docs/plans/2026-02-23-puar-caso-qa-legacy.md
git commit -m "docs(puar): Caso_QA_Legacy archivado en CASOS-COMPLETOS — README enriquecido"
```

---

## Resultado esperado

- `Caso_QA_Legacy_20260205` ya no existe en `docs/04_desarrollo/` ✅
- `CASOS-COMPLETOS/Caso_QA_Legacy_20260205_COMPLETADO/` existe con README enriquecido ✅
- `00_README.md` documenta: resumen ejecutivo, métricas, archivos afectados, commit `ebd82a1` ✅
- Sin archivos huérfanos en `docs/04_desarrollo/` ✅
