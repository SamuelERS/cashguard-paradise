# PUAR: Caso_Plan_Testing_Control_Calidad → Consolidación Estructural

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Consolidar los dos READMEs raíz del caso en un único `00_README.md` canónico, eliminando redundancia estructural sin mover ni archivar el caso.

**Architecture:** El caso es un metacaso de QA vivo y activo — NO va a CASOS-COMPLETOS. La única corrección necesaria es estructural: dos archivos README en la raíz (`README.md` + `README_CASO.md`) deben fusionarse en el `00_README.md` canónico que exige la convención del proyecto.

**Tech Stack:** Solo edición de Markdown y operaciones de filesystem (rm).

---

## Contexto del PUAR

### Diagnóstico Técnico

**Archivos analizados:**
- `README.md` — 202 líneas. "Plan Maestro: Control Total de Tests". Última actualización: 11 Oct 2025. Métricas más recientes: 692/758 tests (91.3%), Phase2 WIP 51/117 (43.6%). Documenta estructura interna, caso activo, y próximos pasos.
- `README_CASO.md` — 203 líneas. Descripción amplia del caso (propósito, roadmap Q1-Q4, filosofía). Métricas más antiguas: 641/641 passing, 30% coverage.
- `ROADMAP_PRIORIZADO.md` — 667/728 tests, fases 0-4 detalladas. (Aún más antiguo.)
- `DELETED_TESTS.md` — Documentación de 23 tests eliminados con justificación.
- `EN_PROGRESO_Caso_Phase2_Verification_100_Coverage/README.md` — 51/117 tests (43.6%), PARCIALMENTE COMPLETADO, sub-caso genuinamente activo.

### Veredicto de triaje
- **¿Obsoleto?** No. Metacaso de QA vivo con trabajo activo (Phase2 51/117, morning-count 3 failing).
- **¿Duplicado?** No. Único en el sistema.
- **¿Vital?** Sí (infraestructura de tests del proyecto, anti-fraude core).
- **¿Estado?** 🟡 ACTIVO — permanece en `docs/04_desarrollo/`.
- **¿Acción?** CONSOLIDAR — NO mover. Solo corregir defecto estructural.

### Defecto estructural identificado

El caso tiene **dos archivos README en la raíz** en lugar del `00_README.md` canónico:

| Archivo | Rol actual | Decisión |
|---------|-----------|----------|
| `README.md` | Plan maestro (métricas actuales, estructura) | Fuente para `00_README.md` |
| `README_CASO.md` | Descripción amplia (propósito, roadmap, filosofía) | Fuente para `00_README.md` → DELETE |

El `00_README.md` fusionado debe ser el único punto de entrada: combinar la **descripción de propósito** de `README_CASO.md` con las **métricas y estructura actual** de `README.md`.

### Lo que NO cambia
- Ubicación del caso (permanece en `docs/04_desarrollo/Caso_Plan_Testing_Control_Calidad/`)
- Estructura interna (`Archive/`, `EN_PROGRESO_Caso_Phase2_Verification_100_Coverage/`)
- `ROADMAP_PRIORIZADO.md`, `DELETED_TESTS.md`, `0_INVENTARIO_MAESTRO_Tests_Real.md`
- El caso NO va a CASOS-COMPLETOS (está activo)

---

## Task 1: Crear `00_README.md` canónico (fusión de los dos READMEs)

**Archivo destino:** `docs/04_desarrollo/Caso_Plan_Testing_Control_Calidad/00_README.md`

**Step 1: Crear el archivo con contenido fusionado**

Contenido completo del nuevo `00_README.md`:

```markdown
# Caso: Plan Testing y Control de Calidad

| Campo | Valor |
|-------|-------|
| **Tipo** | Metacaso de QA — Control de Calidad Continuo |
| **Estado** | 🟡 ACTIVO Y EN EVOLUCIÓN |
| **Fecha inicio** | 09 de Octubre 2025 |
| **Última actualización** | 11 de Octubre 2025 |
| **Responsable** | SamuelERS / AI Assistant |

## Resumen Ejecutivo

Metacaso que agrupa toda la **estrategia de testing, control de calidad y roadmaps** del sistema CashGuard Paradise.

**¿Por qué existe este caso?**
A diferencia de los casos normales (tarea puntual → completar → archivar), este es un caso de **control de calidad continuo** que evoluciona con el proyecto. Documenta la estrategia viva de testing: qué se testea, cómo se prioriza, y qué está pendiente.

**Contenido:**
- ✅ Inventario completo de todos los tests del sistema
- ✅ Roadmap priorizado de mejora de coverage
- ✅ Casos activos de testing específico (Phase2, morning-count)
- ✅ Documentación de tests eliminados con justificación
- ✅ Historial de estrategias anteriores (Archive/)

## Métricas Actuales

### Tests Status (Post ORDEN #5, 11 Oct 2025)
```
Total:    758 tests
✅ Passing: 692 (91.3%)
🟠 Failing: 66  (Phase2VerificationSection — root causes conocidos)
⏭️  Skipped: 3   (2 timing visual + 1 helper removido)
❌ Pre-existentes failing: 3 (morning-count-simplified)
```

### Coverage Actual
```
Lines:      ~34%
Statements: ~34%
Functions:  ~35%
Branches:   ~61%
```

### Desglose por Sector
```
✅ Matemáticas TIER 0-4:  174/174 (100%) — Confianza 99.9%
✅ Utils & Core Logic:     97/97 (100%)
✅ Componentes UI (base): 141/141 (100%)
✅ Hooks Integration:      93/93 (100%)
✅ E2E Playwright:         24/24 (100%)
🟠 Flows:                   5/8 (63%)  — 3 failing pre-existentes
⚠️ Phase2 WIP:            51/117 (43.6%) — Suite limpia post-ORDEN #5
```

## Estructura del Caso

```
Caso_Plan_Testing_Control_Calidad/
├── 00_README.md                           ← Este archivo (canónico)
├── 0_INVENTARIO_MAESTRO_Tests_Real.md     ← LEER PRIMERO
├── ROADMAP_PRIORIZADO.md                  ← Plan de acción por fases
├── DELETED_TESTS.md                       ← 23 tests eliminados documentados
├── EN_PROGRESO_Caso_Phase2_Verification_100_Coverage/  ← Sub-caso activo
│   ├── README.md
│   ├── 0_Plan_Maestro_Phase2.md
│   ├── 1_Analisis_Componente_Phase2VerificationSection.md
│   ├── 3_Implementacion_Tests_Phase2.md
│   └── ANALISIS_TIMING_TESTS_v1.3.8_Fase_1.md
└── Archive/                               ← 18 docs históricos (referencia)
```

## Documentos Clave

### [`0_INVENTARIO_MAESTRO_Tests_Real.md`](0_INVENTARIO_MAESTRO_Tests_Real.md) ← LEER PRIMERO
Inventario completo de 728 tests del proyecto. Estado real, desglose por categoría, componentes sin tests, roadmap priorizado con estimaciones.

### [`ROADMAP_PRIORIZADO.md`](ROADMAP_PRIORIZADO.md)
- 🚨 **FASE 0:** Fix 3 morning-count tests → 641/641 base suite (1-2h) ⭐⭐⭐⭐⭐
- 🟠 **FASE 1:** Completar Phase2VerificationSection → 87/87 (6-8h) ⭐⭐⭐⭐
- 🔴 **FASE 2:** Tests usePhaseManager → Hook cerebro (3-4h) ⭐⭐⭐⭐
- 🟡 **FASE 3:** Tests componentes raíz (8-10h) ⭐⭐⭐
- ⚪ **FASE 4:** Tests hooks secundarios (4-5h) ⭐⭐

### [`EN_PROGRESO_Caso_Phase2_Verification_100_Coverage/`](EN_PROGRESO_Caso_Phase2_Verification_100_Coverage/)
Sub-caso activo: suite de 87 tests para `Phase2VerificationSection.tsx` (783 líneas — cerebro del anti-fraude). Estado: 51/117 passing (43.6%). Root causes conocidos. Estimado restante: 4-7h.

### [`DELETED_TESTS.md`](DELETED_TESTS.md)
23 tests eliminados con justificación técnica (incompatibilidad arquitectónica, timing extremo). Referencia histórica.

### [`Archive/`](Archive/)
18 documentos del plan original (09 Oct 2025). Información desactualizada, disponible para referencia histórica únicamente.

## Roadmap

### Q1 2025 ✅ COMPLETADO
- Baseline 30% coverage establecido
- 23 tests incompatibles eliminados
- 641/641 base suite passing

### Q2 2025 🟡 EN PROGRESO
- **Objetivo:** 35% coverage (+5%)
- **Prioridad inmediata:** Fases 0-1 del ROADMAP_PRIORIZADO

### Q3-Q4 2025 📋 PLANIFICADO
- Q3: 50% coverage (components principales)
- Q4: 60% coverage (integration completa)

## Próximos Pasos

### Opción A: Quick Win FASE 0 (1-2h) ⭐⭐⭐⭐⭐
Fix 3 morning-count tests → base suite 641/641 (100%)

### Opción B: Continuar Phase2 Refinamiento (4-7h) ⭐⭐⭐⭐
- Fase 1: Fix helper placeholders → +30-35 tests
- Fase 2: Fix modal text assertions → +10-12 tests
- Fase 3: Fix CSS classes + callbacks → 117/117 ✅

---

**Filosofía:** "Calidad primero, coverage como métrica, no como objetivo"

**🙏 Gloria a Dios por la disciplina en el control de calidad.**
```

**Step 2: Verificar resultado**

```bash
head -5 "docs/04_desarrollo/Caso_Plan_Testing_Control_Calidad/00_README.md"
# Debe mostrar: "# Caso: Plan Testing y Control de Calidad"
```

---

## Task 2: Eliminar archivos README redundantes

Con `00_README.md` creado como fuente única de verdad, los dos archivos originales se eliminan.

**Step 1: Eliminar README_CASO.md**

```bash
rm "docs/04_desarrollo/Caso_Plan_Testing_Control_Calidad/README_CASO.md"
```

**Step 2: Eliminar README.md**

```bash
rm "docs/04_desarrollo/Caso_Plan_Testing_Control_Calidad/README.md"
```

**Step 3: Verificar que solo queda 00_README.md**

```bash
ls "docs/04_desarrollo/Caso_Plan_Testing_Control_Calidad/" | grep -E "README|readme"
# Debe mostrar solo: 00_README.md
```

---

## Task 3: Commit conjunto

```bash
git add docs/04_desarrollo/Caso_Plan_Testing_Control_Calidad/ \
        docs/plans/2026-02-23-puar-caso-plan-testing.md
git commit -m "docs(puar): Caso_Plan_Testing consolidado — 00_README.md canónico, READMEs duplicados eliminados"
```

---

## Resultado esperado

- `00_README.md` existe como único punto de entrada del caso ✅
- `README.md` y `README_CASO.md` eliminados (contenido preservado en `00_README.md`) ✅
- Estructura interna (`Archive/`, `EN_PROGRESO/`, `ROADMAP_PRIORIZADO.md`) intacta ✅
- Sin regresiones en el caso ni en su sub-caso activo ✅
