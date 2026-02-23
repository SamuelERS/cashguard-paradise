# PUAR — Caso Estrategia UI con Datos Reales 20260217

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Aplicar el Protocolo Universal de Auditoría y Reubicación (PUAR) al caso `Caso_Estrategia_UI_Datos_Reales_20260217`, documentar su estado real (Módulo A completado, Módulos B–E pendientes) y crear los artefactos necesarios para que el siguiente agente pueda retomar sin fricciones.

**Architecture:** El caso está correctamente ubicado en `04_desarrollo/` y tiene `00_README.md`. El PUAR no requiere relocalización. Las acciones se limitan a actualizar el README con tabla de progreso y crear `99_PENDIENTES_POR_REALIZAR.md` con los pasos exactos de Módulos B–E, extraídos de `02_Plan_Arquitectonico_Modular_TDD.md`. La `06_ORDEN_TECNICA_Traslado_Agente_Nuevo.md` ya existente cubre el contexto de handoff, pero no sustituye a un checklist accionable de pendientes.

**Tech Stack:** Solo operaciones de archivos/documentación — no hay código fuente involucrado.

---

## VEREDICTO TRIAJE

| Recurso | Clasificación | Acción |
|---------|--------------|--------|
| `Caso_Estrategia_UI_Datos_Reales_20260217/` | **VITAL + INCOMPLETO** | **QUEDA** en `04_desarrollo/` como `EN_PROGRESO` |

**Justificación:**
- Define la estrategia de estabilización de UI activa (UI tradicional como canon operativo)
- Módulo A COMPLETADO con evidencia técnica reproducible (57 tests passing, build clean, Playwright)
- Módulos B–E representan trabajo real y concreto pendiente de implementación
- `00_README.md` existe pero no tiene tabla de progreso por módulos ni enlace a pendientes
- No hay duplicación con otro caso — es el caso raíz de la estrategia de datos reales

---

## HALLAZGOS DE AUDITORÍA

### Hallazgo 1 — `00_README.md` no tiene tabla de progreso modular
El README describe el estado de forma narrativa en la sección "Resultado" pero no usa el formato estándar de tabla A✅/B–E⏳. Un lector nuevo no puede determinar de un vistazo qué está hecho y qué falta.

→ Añadir tabla de progreso con los 5 módulos y criterio de cierre.

### Hallazgo 2 — Falta `99_PENDIENTES_POR_REALIZAR.md`
El caso tiene `06_ORDEN_TECNICA_Traslado_Agente_Nuevo.md` (handoff de contexto) pero no un checklist accionable de los pasos pendientes de Módulos B, C, D y E con archivos objetivo exactos.

→ Crear `99_PENDIENTES_POR_REALIZAR.md` con los pasos de cada módulo pendiente más instrucciones de cierre del caso.

---

## TAREA 1: Actualizar `00_README.md`

**Files:**
- Modify: `docs/04_desarrollo/Caso_Estrategia_UI_Datos_Reales_20260217/00_README.md`

**Paso 1: Reemplazar la sección "Resultado" por tabla de progreso + criterio de cierre**

Reemplazar:
```markdown
## Resultado
Parcial:
- Se concluye estrategia recomendada: mantener UI tradicional como canon operativo y conectar primero datos reales.
- Se define ruta de modernizacion por capas con criterios de salida verificables.
- Se ejecuta y valida Modulo A en local con evidencia reproducible (PASS).
```

Por:
```markdown
## Progreso

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| A — Entorno y fuente real | Configurar `.env` + validar Supabase real vs mock; 57 tests passing | ✅ Completado |
| B — Canon de datos en UI tradicional | Tests de selección cajero/testigo/sucursal; IDs propagados end-to-end | ⏳ Pendiente |
| C — Observabilidad y diagnóstico operativo | Banner de conectividad real (real/fallback); indicador técnico dev | ⏳ Pendiente |
| D — Preparación de modernización (sin switch de UI) | Matriz de paridad UI tradicional vs nueva; tests RED comparativos | ⏳ Pendiente |
| E — Activación gradual (Go/NoGo) | Feature flag de enrutamiento; smoke tests; veredicto formal PASS | ⏳ Pendiente |

**Criterio de cierre:** UI tradicional corre con datos reales de Supabase con evidencia de pruebas, existe plan cerrado de modernización con gates técnicos, y no hay decisiones de UI tomadas por intuición.

> Ver pendientes detallados en: `99_PENDIENTES_POR_REALIZAR.md`
> Ver evidencia del Módulo A en: `04_Evidencia_Modulo_A_Validacion_Local.md`
> Ver handoff de contexto para agente nuevo en: `06_ORDEN_TECNICA_Traslado_Agente_Nuevo.md`

## Resultado (Módulo A)

- Estrategia definida: mantener UI tradicional como canon operativo y conectar primero datos reales.
- Ruta de modernización por capas con criterios de salida verificables documentada.
- Módulo A ejecutado y validado en local con evidencia reproducible (57 tests PASS, build OK, Playwright OK).
```

**Paso 2: Verificar que el campo Estado sigue como EN_PROGRESO**

```bash
grep "Estado" "docs/04_desarrollo/Caso_Estrategia_UI_Datos_Reales_20260217/00_README.md"
```
Esperado: línea con `EN_PROGRESO`.

---

## TAREA 2: Crear `99_PENDIENTES_POR_REALIZAR.md`

**Files:**
- Create: `docs/04_desarrollo/Caso_Estrategia_UI_Datos_Reales_20260217/99_PENDIENTES_POR_REALIZAR.md`

**Paso 1: Crear el archivo**

Contenido exacto:

```markdown
# Pendientes por Realizar

> Extraído de `02_Plan_Arquitectonico_Modular_TDD.md`. Módulo A completado.
> Módulos B–E son los pasos restantes para cerrar el caso.
> Ver también `06_ORDEN_TECNICA_Traslado_Agente_Nuevo.md` para contexto operativo completo.

---

## Módulo B — Canon de datos en UI tradicional

**Archivos objetivo:**
- `src/pages/Index.tsx`
- `src/components/initial-wizard/InitialWizardModalView.tsx`
- `src/hooks/initial-wizard/useInitialWizardController.ts`
- `src/components/morning-count/MorningCountWizard.tsx`
- `src/components/CashCounter.tsx`
- `src/hooks/useCashCounterOrchestrator.ts`

- [ ] Tests RED de integración sobre selección de sucursal/cajero/testigo en wizard tradicional.
- [ ] Verificar que IDs seleccionados se propagan intactos hasta reporte final.
- [ ] Verificar que nombres mostrados se resuelven desde datos reales, no hardcode.
- [ ] Cerrar cualquier fallback ambiguo que enmascare errores de mapeo.
- [ ] Ejecutar smoke tests del módulo y confirmar verde:

```bash
npx vitest run [suites del modulo B]
npm run -s build
```

**Criterio de aceptación:** Flujo tradicional completo funciona con datos reales end-to-end. Reportes y pasos muestran actores correctos por sucursal.

---

## Módulo C — Observabilidad y diagnóstico operativo

**Archivos objetivo:**
- `src/components/corte/CorteStatusBanner.tsx`
- `src/components/corte/CorteOrquestador.tsx`
- `src/lib/supabase.ts`

- [ ] Test RED para estado visual de conectividad/sincronización real.
- [ ] Reemplazar estado fijo de banner por estado real de conexión.
- [ ] Agregar indicador técnico mínimo (modo real/fallback) visible en entorno dev.
- [ ] Ejecutar smoke tests y confirmar verde:

```bash
npx vitest run [suites del modulo C]
npm run -s build
```

**Criterio de aceptación:** Operación puede distinguir rápidamente si corre contra Supabase real o fallback.

---

## Módulo D — Preparación de modernización (sin switch de UI)

**Archivos objetivo:**
- `src/components/corte/CortePage.tsx`
- `src/components/corte/CorteInicio.tsx`
- `src/components/corte/CorteOrquestador.tsx`
- `src/types/auditoria.ts`

- [ ] Definir matriz de paridad (pasos obligatorios, validaciones, contratos).
- [ ] Escribir tests RED comparando comportamiento tradicional vs nueva UI en escenarios críticos.
- [ ] Ajustar contrato de entrada para que no pierda trazabilidad de IDs.
- [ ] Ejecutar smoke tests y confirmar verde:

```bash
npx vitest run [suites del modulo D]
npm run -s build
```

**Criterio de aceptación:** Equivalencia funcional demostrable por tests. UI nueva lista para feature flag, sin reemplazar producción local.

---

## Módulo E — Activación gradual (Go/NoGo)

**Archivos objetivo:**
- `src/pages/Index.tsx`
- `src/App.tsx`
- Módulo de feature flags (si aplica)

- [ ] Introducir feature flag de enrutamiento UI tradicional/nueva.
- [ ] Smoke tests manuales y e2e de ambos caminos.
- [ ] Ejecutar veredicto formal Go/NoGo con matriz del caso (`03_Matriz_Decision_Go_NoGo.md`).

```bash
npm run test:e2e:smoke
npm run -s build
```

**Criterio de aceptación:** Cambio reversible sin downtime. Veredicto formal PASS antes de switch por defecto.

---

## Smoke Tests Obligatorios (aplican a cada módulo)

```bash
# S0 - Estabilidad base
npm run test:unit -- --run src/__tests__/unit/pages/index.stability.test.tsx

# S1 - Salud unitaria mínima
npm run test:unit -- --run

# S2 - Humo de interfaz
npm run test:e2e:smoke

# S3 - Build
npm run build
```

---

## Criterio de Cierre del Caso

> El caso puede marcarse como **COMPLETADO** y moverse a `CASOS-COMPLETOS/` cuando:
>
> **UI tradicional corre con datos reales de Supabase con evidencia de pruebas, existe plan cerrado de modernización con gates técnicos, y no hay decisiones de UI tomadas por intuición.**

Pasos de cierre cuando los módulos B–E estén completados:
1. Actualizar `00_README.md`: cambiar `EN_PROGRESO` → `COMPLETADO` y fecha actualización.
2. Mover carpeta completa a `docs/04_desarrollo/CASOS-COMPLETOS/Caso_Estrategia_UI_Datos_Reales_20260217_COMPLETADO/`.
```

**Paso 2: Verificar el archivo creado**

```bash
ls "docs/04_desarrollo/Caso_Estrategia_UI_Datos_Reales_20260217/"
```
Esperado: `00_README.md  01_Analisis_Comparativo_Interfaces.md  02_Plan_Arquitectonico_Modular_TDD.md  03_Matriz_Decision_Go_NoGo.md  04_Evidencia_Modulo_A_Validacion_Local.md  05_Ruta_Estabilizacion_Modelo_Propio.md  06_ORDEN_TECNICA_Traslado_Agente_Nuevo.md  99_PENDIENTES_POR_REALIZAR.md  assets/`

---

## RESUMEN DE CAMBIOS

| Acción | Detalle |
|--------|---------|
| ✅ QUEDA | Caso en `04_desarrollo/` — correctamente ubicado, sin relocalización |
| ✅ ACTUALIZAR | `00_README.md` — reemplazar sección "Resultado" por tabla de progreso (A ✅, B–E ⏳) + enlace a pendientes |
| ✅ CREAR | `99_PENDIENTES_POR_REALIZAR.md` — checklist accionable Módulos B–E + smoke tests + criterio de cierre |
