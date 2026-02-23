# PUAR — Caso Investigacion Doble Fuente Catalogos 20260217

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Aplicar el Protocolo Universal de Auditoría y Reubicación (PUAR) al caso `Caso_Investigacion_Doble_Fuente_Catalogos_20260217`, documentar correctamente su estado actual (Módulos A+B completos, C+D pendientes) y dejar los artefactos necesarios para que el caso pueda cerrarse en una sesión futura.

**Architecture:** El caso está correctamente ubicado en `04_desarrollo/` y ya tiene `00_README.md`. El PUAR no requiere relocalización. Las acciones se limitan a actualizar el README con el estado real (A+B completados) y crear `99_PENDIENTES_POR_REALIZAR.md` con las tareas exactas de Módulos C y D para que el próximo desarrollador pueda retomar sin fricción.

**Tech Stack:** Solo operaciones de archivos/documentación — no hay código fuente involucrado.

---

## VEREDICTO TRIAJE

| Recurso | Clasificación | Acción |
|---------|--------------|--------|
| `Caso_Investigacion_Doble_Fuente_Catalogos_20260217/` | **VITAL + INCOMPLETO** | **QUEDA** en `04_desarrollo/` como `EN_PROGRESO` |

**Justificación:**
- Aborda deuda arquitectónica activa (doble fuente: Supabase vs `paradise.ts`)
- Módulos A y B ya ejecutados (`[x]` en `02_Plan_Modular_TDD.md`)
- Módulos C y D pendientes con trabajo concreto definido
- `00_README.md` ya existe pero no refleja el progreso real
- No hay duplicación con otro caso

---

## HALLAZGOS DE AUDITORÍA

### Hallazgo 1 — `00_README.md` no refleja progreso real
El README indica `EN_PROGRESO` genérico. La sección "Estado Actual" menciona Módulo A/B de forma narrativa pero no usa el formato de progreso por módulos que el lector espera para decidir si retomar el caso.

→ Actualizar para indicar explícitamente: Módulos A y B ✅, Módulos C y D ⏳.

### Hallazgo 2 — Falta `99_PENDIENTES_POR_REALIZAR.md`
El caso no tiene el artefacto obligatorio para casos `EN_PROGRESO` con trabajo pendiente. Los pasos exactos de Módulos C y D están en `02_Plan_Modular_TDD.md` pero no están expuestos como checklist accionable de fácil acceso.

→ Crear `99_PENDIENTES_POR_REALIZAR.md` con los pasos exactos de Módulos C y D.

---

## TAREA 1: Actualizar `00_README.md`

**Files:**
- Modify: `docs/04_desarrollo/Caso_Investigacion_Doble_Fuente_Catalogos_20260217/00_README.md`

**Paso 1: Añadir sección de progreso por módulos**

Reemplazar la sección "Estado Actual" actual por:

```markdown
## Progreso

| Módulo | Descripción | Estado |
|--------|-------------|--------|
| A — Baseline y bloqueo de regresión | Test RED OT-18 + migración `useCashCounterOrchestrator` a hooks Supabase | ✅ Completado |
| B — Migración de flujos legacy | `StoreSelectionForm` con sucursales dinámicas + fallback controlado | ✅ Completado |
| C — Integridad de flujo CorteInicio | Tests de prefill + sugerencias + caso "Mostrar todos" | ⏳ Pendiente |
| D — Verificación de release | Build + tests corte + smoke manual en localhost | ⏳ Pendiente |

**Criterio de cierre:** No existe consumo productivo de catálogos estáticos para empleados/sucursales y todos los flujos usan proveedor unificado con tests en verde.

> Ver pendientes detallados en: `99_PENDIENTES_POR_REALIZAR.md`
```

**Paso 2: Verificar que el campo Estado sigue como EN_PROGRESO**

```bash
grep "Estado" "docs/04_desarrollo/Caso_Investigacion_Doble_Fuente_Catalogos_20260217/00_README.md"
```
Esperado: línea con `EN_PROGRESO`.

---

## TAREA 2: Crear `99_PENDIENTES_POR_REALIZAR.md`

**Files:**
- Create: `docs/04_desarrollo/Caso_Investigacion_Doble_Fuente_Catalogos_20260217/99_PENDIENTES_POR_REALIZAR.md`

**Paso 1: Crear el archivo**

Contenido exacto:

```markdown
# Pendientes por Realizar

> Extraído de `02_Plan_Modular_TDD.md`. Módulos A y B completados.
> Módulos C y D son los pasos restantes para cerrar el caso.

---

## Módulo C — Integridad de flujo CorteInicio

**Archivo de test:** `src/components/corte/__tests__/CorteInicio.test.tsx`

- [ ] Mantener tests existentes de prefill + sugerencias completas (no romper lo que funciona).
- [ ] Cubrir caso: empleado precargado + catálogo múltiple (la datalist muestra todos los empleados de la sucursal, no solo el precargado).
- [ ] Cubrir caso: acción manual "Mostrar todos" (el usuario puede expandir el catálogo explícitamente).
- [ ] Ejecutar suite completa de corte y confirmar verde:

```bash
npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx src/components/corte/__tests__/CorteOrquestador.test.tsx
```

---

## Módulo D — Verificación de release

- [ ] Build limpio:

```bash
npm run build
```
Esperado: sin errores de TypeScript ni de Vite.

- [ ] Suite de tests del flujo corte en verde:

```bash
npx vitest run src/components/corte/__tests__/CorteInicio.test.tsx src/components/corte/__tests__/CorteOrquestador.test.tsx
```
Esperado: todos los tests passing.

- [ ] Smoke manual en `localhost:5173`:
  - Catálogo completo visible en campo cajero y campo testigo (no solo 1 sugerencia).
  - Sin divergencia entre sucursales/empleados respecto a Supabase.
  - Flujo legacy (CashCounter) también muestra sucursales/empleados desde Supabase (no desde `paradise.ts`).

---

## Criterio de Cierre

> El caso puede marcarse como **COMPLETADO** y moverse a `CASOS-COMPLETOS/` cuando:
>
> **No existe consumo productivo de catálogos estáticos para empleados/sucursales y todos los flujos usan proveedor unificado con tests en verde.**

Pasos de cierre cuando los módulos C y D estén completados:
1. Actualizar `00_README.md`: cambiar `EN_PROGRESO` → `COMPLETADO` y fecha actualización.
2. Mover carpeta completa a `docs/04_desarrollo/CASOS-COMPLETOS/Caso_Investigacion_Doble_Fuente_Catalogos_20260217_COMPLETADO/`.
```

**Paso 2: Verificar el archivo creado**

```bash
ls "docs/04_desarrollo/Caso_Investigacion_Doble_Fuente_Catalogos_20260217/"
```
Esperado: `00_README.md  01_Diagnostico_Tecnico.md  02_Plan_Modular_TDD.md  99_PENDIENTES_POR_REALIZAR.md`

---

## RESUMEN DE CAMBIOS

| Acción | Detalle |
|--------|---------|
| ✅ QUEDA | Caso en `04_desarrollo/` — correctamente ubicado, sin relocalización |
| ✅ ACTUALIZAR | `00_README.md` — añadir tabla de progreso por módulos (A+B ✅, C+D ⏳) |
| ✅ CREAR | `99_PENDIENTES_POR_REALIZAR.md` — checklist accionable Módulos C y D + criterio de cierre |
