# Plan de Implementación: Wizard Supabase Unificado

**Fecha:** 2026-02-17
**Caso:** `04_desarrollo/Caso-Flujo-Correcto-Supabase-Funcional/`

---

## Progreso Actual

### Correcciones DACC Ya Aplicadas

| # | Hallazgo | Archivo | Estado |
|---|----------|---------|--------|
| 1 | [CRITICO] Index.tsx bifurcaba a CortePage | `Index.tsx` | ✅ Corregido |
| 2 | [ALTO] Import legacy paradise.ts | `useCashCounterOrchestrator.ts` | ✅ Corregido |
| 3 | [ALTO] Suite useEmpleadosSucursal rota | `useEmpleadosSucursal.test.ts` | ✅ Reescrita |
| 4 | [MEDIO] Contrato test wizard controller | `useInitialWizardController.test.ts` | ✅ Corregido |
| 5 | [MEDIO] Documentación caso | `docs/04_desarrollo/...` | ✅ Completada |

**Resultado:** `npx tsc --noEmit` = 0 errores | `npm run build` = exitoso

---

## Fases Restantes (Futuras)

Las correcciones DACC estabilizan el routing y los tests. Las fases siguientes completan la migración de datos del wizard.

### Fase 1: Step2 → useSucursales() (Estimado: 2-3h)

**Objetivo:** Reemplazar `STORES[]` de paradise.ts por datos de Supabase en Step2StoreSelection.

**Archivos a modificar:**
1. `src/components/initial-wizard/Step2StoreSelection.tsx`
   - Remover import `STORES` de paradise.ts
   - Recibir `availableStores` como prop (ya mapeado desde useSucursales)
   - Manejar estado de carga (`cargando`) y error
   - Fallback UI si no hay sucursales

2. `src/hooks/initial-wizard/useInitialWizardController.ts`
   - Ya usa `useSucursales()` (lineas 83-95) — verificar mapeo correcto
   - Confirmar que `availableStores` se propaga al view

**Criterio de aceptación:**
- [ ] Step2 muestra sucursales de Supabase
- [ ] Spinner visible mientras carga
- [ ] Mensaje de error si falla la consulta
- [ ] Sin import de paradise.ts en Step2

---

### Fase 2: Step3/Step4 → useEmpleadosSucursal() (Estimado: 3-4h)

**Objetivo:** Reemplazar `EMPLOYEES[]` de paradise.ts por empleados filtrados por sucursal.

**Archivos a modificar:**
1. `src/components/initial-wizard/Step3CashierSelection.tsx`
   - Recibir empleados como prop
   - Filtrar activos (ya viene filtrado del hook)
   - Manejar carga y error

2. `src/components/initial-wizard/Step4WitnessSelection.tsx`
   - Misma fuente que Step3 pero excluir cajero seleccionado
   - Validación anti-fraude: testigo !== cajero (ya existe)

3. `src/hooks/initial-wizard/useInitialWizardController.ts`
   - Agregar llamada a `useEmpleadosSucursal(selectedStoreId)`
   - Exponer `availableEmployees` al view
   - Re-consultar cuando cambia sucursal seleccionada

**Criterio de aceptación:**
- [ ] Empleados se cargan dinámicamente por sucursal
- [ ] Cambiar sucursal recarga empleados
- [ ] Testigo excluye cajero seleccionado
- [ ] Sin import de paradise.ts en Step3/Step4

---

### Fase 3: handleWizardComplete → useCorteSesion() (Estimado: 2-3h)

**Objetivo:** Persistir el corte en Supabase al completar el wizard.

**Archivos a modificar:**
1. `src/pages/Index.tsx`
   - En `handleWizardComplete()`, llamar `corteSesion.crearCorte()`
   - Pasar IDs de sucursal, cajero, testigo
   - Manejar error de creación
   - Flujo a CashCounter sin cambios

2. `src/hooks/useCorteSesion.ts` (existente)
   - Verificar que `crearCorte()` acepta los datos del wizard
   - Verificar que sesion se marca como INICIADO

**Criterio de aceptación:**
- [ ] Corte se crea en Supabase con datos del wizard
- [ ] Estado "INICIADO" correcto
- [ ] Error de Supabase no bloquea flujo (graceful degradation)
- [ ] CashCounter recibe datos como antes

---

### Fase 4: Reanudación de Sesión (Estimado: 2-3h) — CORE IMPLEMENTADO (DACC-CIERRE)

**Objetivo:** Si hay sesión activa, pre-seleccionar sucursal en el wizard.

**Archivos modificados (DACC-CIERRE 2026-02-17):**
1. `src/pages/Index.tsx`
   - ✅ `activeCashCutSucursalId` se calcula (DACC-FIX-1)
   - ✅ Se pasa como `initialSucursalId={activeCashCutSucursalId}` al wizard

2. `src/types/initialWizard.ts`
   - ✅ `initialSucursalId?: string | null` agregado a `InitialWizardModalProps`

3. `src/hooks/initial-wizard/useInitialWizardController.ts`
   - ✅ Destructura `initialSucursalId` de props
   - ✅ useEffect preselecciona `selectedStore` si `isOpen && initialSucursalId && !wizardData.selectedStore`

4. Tests:
   - ✅ `index.cashcut-routing.test.tsx` — 2 assertions verifican prop
   - ✅ `useInitialWizardController.test.ts` — 3 tests preselección

**Criterio de aceptación:**
- [x] Sesión activa → wizard abre con sucursal pre-seleccionada
- [x] Usuario puede cambiar sucursal si lo desea
- [x] Sin sesión → wizard funciona normalmente

**Pendiente para UX completa:** Banner visual indicando "sesión activa encontrada", confirmación de reanudación

---

### Fase 5: Limpieza y Desactivación (Estimado: 1-2h) — PARCIALMENTE IMPLEMENTADO (DACC-CIERRE)

**Objetivo:** Remover código muerto del Mundo Nuevo.

**Archivos a evaluar:**
1. `src/components/corte/CortePage.tsx` → Marcar como deprecated o remover — PENDIENTE
2. `src/components/corte/CorteOrquestador.tsx` → Marcar como deprecated o remover — PENDIENTE
3. `src/components/corte/CorteInicio.tsx` → Evaluar remoción — PENDIENTE
4. `src/components/corte/CorteReanudacion.tsx` → Evaluar remoción — PENDIENTE
5. ~~`src/pages/Index.tsx` → Remover estado `routeCashCutToCortePage` (dead code)~~ ✅ DACC-CIERRE: eliminado estado + 4 setters

**Criterio de aceptación:**
- [ ] Sin dead code referenciando CortePage — pendiente (componentes aún existen)
- [x] Build limpio sin unused imports *(DACC-CIERRE: `npx eslint` = 0 errores)*
- [x] Tests actualizados *(routing test no referencia CortePage, 24/24 passing)*

---

## Orden de Ejecución Recomendado

```
DACC Correcciones (✅ COMPLETADAS)
  │
  ├─ Fase 1: Step2 → useSucursales ........................ PENDIENTE
  ├─ Fase 2: Step3/Step4 → useEmpleadosSucursal .......... PENDIENTE
  ├─ Fase 3: handleWizardComplete → useCorteSesion ........ PENDIENTE
  ├─ Fase 4: Reanudación de sesión ....................... ✅ CORE (DACC-CIERRE)
  └─ Fase 5: Limpieza código muerto ..................... ⚡ PARCIAL (DACC-CIERRE)
```

**Tiempo total estimado restante:** 8-12 horas (Fases 1-3 + residuos Fase 5)

---

## Siguiente Paso

→ Ver `04_Verificacion.md` — Checklist de QA
