# CorteDetalle Bloque Superior Compacto Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Reducir el bloque superior del detalle de corte a una sola banda compacta, manteniendo la misma información crítica en menos espacio y con mejor jerarquía visual para supervisión en vivo.

**Architecture:** Mantener intacta la lógica de datos (estado, prioridad, fase, diferencia, totales e identificación) y solo reorganizar presentación. Se reemplazan tres tarjetas (`Radar operativo`, `Resumen ejecutivo`, `Identificación`) por un único contenedor de contexto operativo con sub-secciones densas. No se toca Supabase, hooks ni cálculo financiero.

**Tech Stack:** React 19 + TypeScript + Tailwind + Vitest + Testing Library.

---

## Dirección Visual (decisión de diseño)

- Estética: `control-room compacto` (denso, sobrio, legible, sin ornamentos nuevos).
- Objetivo: lectura en 3 segundos para supervisor.
- Regla: un solo bloque superior con jerarquía fuerte, evitando repetición semántica.

### Antes (actual)
- Header de corte (correlativo + en vivo + fecha).
- Card 1: `Radar operativo` (prioridad, fase, diferencia).
- Card 2: `Resumen ejecutivo` (estado, total, diferencia, %).
- Card 3: `Identificación` (sucursal, cajero, testigo, estado).

### Después (objetivo)
- Header de corte (se mantiene).
- Una sola card: `Panel operativo del corte` con 3 franjas:
1. `Snapshot`: Estado + Prioridad + Fase.
2. `KPIs`: Total contado + Diferencia vs SICAR + Diferencia %.
3. `Contexto`: Sucursal + Cajero + Testigo.

Notas:
- El estado solo vive en `Snapshot` (se elimina duplicado de `Identificación`).
- Valores monetarios y diferencia mantienen color semántico actual.
- Layout responsive: 1 columna móvil, 2-3 columnas en desktop.

---

### Task 1: Contrato TDD del nuevo bloque compacto

**Files:**
- Create: `src/components/supervisor/__tests__/CorteDetalle.compact-operational-header.test.tsx`
- Modify: `src/components/supervisor/__tests__/CorteDetalle.ux-hierarchy.test.tsx`
- Reuse fixtures from: `src/components/supervisor/__tests__/CorteDetalle.executive-summary.test.tsx`

**Step 1: Write failing test**
- Caso A: renderiza `Panel operativo del corte` con los 9 datos clave:
  - Estado, Prioridad, Fase
  - Total contado, Diferencia vs SICAR, Diferencia porcentual
  - Sucursal, Cajero, Testigo
- Caso B: no renderiza headings legacy separados:
  - `Radar operativo`
  - `Resumen ejecutivo`
  - `Identificación`
- Caso C: conserva badge `En vivo` y encabezado de correlativo sin cambio.

**Step 2: Run test to verify RED**
- Run: `npm run test -- src/components/supervisor/__tests__/CorteDetalle.compact-operational-header.test.tsx`
- Expected: FAIL por ausencia de `Panel operativo del corte` y presencia de headings legacy.

**Step 3: Commit checkpoint**
- `test(supervisor): agregar contrato RED para bloque superior compacto`

---

### Task 2: Implementación mínima para pasar GREEN

**Files:**
- Modify: `src/components/supervisor/CorteDetalle.tsx`
- Optional helper extraction in same file: sección de composición visual del header compacto.

**Step 1: Minimal implementation**
- Reemplazar render de tarjetas `Radar operativo`, `Resumen ejecutivo`, `Identificación` por una sola tarjeta `Panel operativo del corte`.
- Reusar variables ya calculadas:
  - `prioridadSupervision`, `corte.fase_actual`, `corte.estado`
  - `totalContado`, `diferenciaTexto`, `porcentajeDiferenciaTexto`
  - `corte.sucursales?.nombre`, `corte.cajero`, `corte.testigo`
- Mantener `estadoColorClase`, `diferenciaColorClase`, `prioridadColorClase`.
- No alterar `operationalCards` ni orden dinámico de bloques inferiores.

**Step 2: Run target tests (GREEN)**
- Run:
  - `npm run test -- src/components/supervisor/__tests__/CorteDetalle.compact-operational-header.test.tsx`
  - `npm run test -- src/components/supervisor/__tests__/CorteDetalle.ux-hierarchy.test.tsx`
- Expected: PASS.

**Step 3: Commit checkpoint**
- `feat(supervisor): compactar bloque superior en panel operativo único`

---

### Task 3: Refactor visual fino + estabilidad UX

**Files:**
- Modify: `src/components/supervisor/CorteDetalle.tsx`
- Modify: `src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx` (si aplica por textos movidos)

**Step 1: Refactor**
- Mejorar densidad vertical (spacing y tamaños tipográficos) sin reducir contraste.
- Consolidar estilos repetidos en constantes locales de clase para secciones del panel.
- Añadir `aria-label` al nuevo panel para ancla de accesibilidad (`aria-label="panel operativo del corte"`).

**Step 2: Verify**
- Run: `npm run test -- src/components/supervisor/__tests__/CorteDetalle.readability.test.tsx src/components/supervisor/__tests__/CorteDetalle.executive-summary.test.tsx`
- Expected: PASS con textos actualizados al nuevo contenedor.

**Step 3: Commit checkpoint**
- `refactor(supervisor): mejorar jerarquía visual del panel operativo compacto`

---

### Task 4: Regresión quirúrgica y validación final

**Files:**
- No new code files expected.

**Step 1: Regression suite**
- Run:
  - `npm run test -- src/components/supervisor/__tests__`
  - `npm run build`
- Expected: Todo verde, sin impactos colaterales.

**Step 2: Smoke manual en local**
- Abrir `http://localhost:5177/supervisor/corte/<id>`
- Verificar:
  - Bloque superior único y compacto.
  - Datos equivalentes a los previos (sin pérdida de información).
  - Móvil y desktop legibles.

**Step 3: Commit checkpoint**
- `test(supervisor): validar regresión tras compactación del bloque superior`

---

## Criterios de Aceptación

- Misma información crítica del estado operativo mostrada en menos altura visual.
- El usuario supervisor no necesita escrollear para entender estado + contexto del corte.
- Cero cambios en lógica de negocio, fuente de datos o cálculos.
- Tests nuevos y existentes en verde.

## Riesgos y mitigación

- Riesgo: tests existentes que buscan textos de headings legacy.
- Mitigación: actualizar tests a contrato semántico nuevo (`Panel operativo del corte`) y mantener asserts de valores, no de markup frágil.

- Riesgo: sobrecompactar y perder legibilidad.
- Mitigación: límite mínimo de tamaño (`text-xs` labels / `text-sm` valores) y contraste semántico intacto.
