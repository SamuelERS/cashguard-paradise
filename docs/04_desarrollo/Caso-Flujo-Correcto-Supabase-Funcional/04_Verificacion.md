# Verificación: Checklist QA del Caso

**Fecha:** 2026-02-17
**Caso:** `04_desarrollo/Caso-Flujo-Correcto-Supabase-Funcional/`

---

## Sección A: Correcciones DACC (Ya Aplicadas)

### A.1 — Bifurcación CortePage Eliminada

- [x] `Index.tsx` no importa `CortePage`
- [x] `handleModeSelection(CASH_CUT)` siempre abre wizard
- [x] `routeCashCutToCortePage` nunca se establece en `true`
- [x] Con sesión activa → wizard se abre (no CortePage)
- [x] Sin sesión activa → wizard se abre normalmente
- [x] Test de regresión `index.cashcut-routing.test.tsx` verifica ambos escenarios

### A.2 — Import Legacy Removido

- [x] `useCashCounterOrchestrator.ts` no importa de `paradise.ts`
- [x] Guard test `catalogSourceGuard.test.ts` no detecta import legacy
- [x] `availableStores` siempre viene de Supabase (`sucursales.map(...)`)
- [x] Sin operador ternario de fallback

### A.3 — Suite useEmpleadosSucursal Funcional

- [x] Mock chain completa: `.select().in().eq().order()` → thenable
- [x] Sin mock de `paradise.ts` (hook es 100% Supabase)
- [x] Campo `cargo` usado (no `rol`)
- [x] Test de duplicados en asignaciones funciona
- [x] Test de error en asignaciones funciona
- [x] Test de error en empleados funciona
- [x] Test de recarga funciona

### A.4 — Contrato Controller Test

- [x] `availableStores` assertion usa `{ id, name, address, phone, schedule }`
- [x] No usa campo `code` inexistente

### A.5 — Build y TypeScript

- [x] `npx tsc --noEmit` = 0 errores
- [x] `npm run build` = exitoso

---

## Sección B: Integración Futura (Fases 1-5)

### B.1 — Step2 con useSucursales (Fase 1)

- [ ] Step2 muestra sucursales de Supabase (no hardcodeadas)
- [ ] Spinner visible durante carga
- [ ] Mensaje de error si Supabase falla
- [ ] Sin import de `STORES` de paradise.ts en Step2
- [ ] Sucursal seleccionada se propaga correctamente al Step3

### B.2 — Step3/Step4 con useEmpleadosSucursal (Fase 2)

- [ ] Empleados se cargan dinámicamente al seleccionar sucursal
- [ ] Cambiar sucursal → recarga empleados automáticamente
- [ ] Solo empleados activos aparecen
- [ ] Testigo excluye cajero seleccionado (anti-fraude)
- [ ] Sin import de `EMPLOYEES` de paradise.ts en Step3/Step4
- [ ] Carga y error manejados con UI

### B.3 — Persistencia Supabase (Fase 3)

- [ ] Completar wizard → crea registro en tabla `cortes` con estado "INICIADO"
- [ ] Datos: sucursal_id, cajero_id, testigo_id, venta_esperada
- [ ] Error de Supabase no bloquea el flujo (degradación graceful)
- [ ] CashCounter recibe datos como antes

### B.4 — Reanudación de Sesión (Fase 4) — PARCIALMENTE IMPLEMENTADO (DACC-CIERRE)

- [x] Sesión activa detectada → sucursal pre-seleccionada en wizard *(DACC-CIERRE: useEffect en controller)*
- [x] Usuario puede cambiar sucursal si lo desea *(preselección solo prefill, no salta pasos)*
- [x] Sin sesión → wizard funciona sin pre-selección *(guard: `initialSucursalId && !wizardData.selectedStore`)*
- [x] `activeCashCutSucursalId` se pasa como prop al wizard *(Index.tsx → `initialSucursalId={activeCashCutSucursalId}`)*
- [ ] UX completa de reanudación (mostrar banner "sesión activa encontrada", etc.) — futuro

### B.5 — Limpieza Código Muerto (Fase 5) — PARCIALMENTE IMPLEMENTADO (DACC-CIERRE)

- [ ] `CortePage.tsx` removido o marcado deprecated — futuro
- [ ] `CorteOrquestador.tsx` removido o marcado deprecated — futuro
- [x] Estado `routeCashCutToCortePage` removido de Index.tsx *(DACC-CIERRE: estado + 4 setters eliminados)*
- [x] Sin unused imports en build *(verificado: `npx eslint` = 0 errores)*
- [x] Tests actualizados (sin referencias a CortePage) *(routing test verifica wizard, no CortePage)*

---

## Sección C: Pruebas Manuales (Aplicar después de cada fase)

### C.1 — Flujo Completo CASH_CUT

1. Abrir app → OperationSelector visible
2. Click "Corte de Caja"
3. Wizard abre → Step 1 (Protocolo) visible
4. Completar 6 pasos con datos reales
5. CashCounter inicia → Phase 1 conteo
6. Phase 2 delivery + verificación ciega
7. Phase 3 reporte final → WhatsApp funciona
8. Finalizar → retorna a OperationSelector

### C.2 — Flujo Con Sesión Activa

1. Crear corte parcial en Supabase (estado INICIADO)
2. Abrir app → Click "Corte de Caja"
3. Wizard abre (NO CortePage)
4. Sucursal de sesión activa pre-seleccionada
5. Completar wizard → continúa flujo normal

### C.3 — Error de Conexión

1. Desconectar red / usar Supabase sin configurar
2. Click "Corte de Caja"
3. Wizard abre normalmente
4. Sucursales muestran estado de error (o vacío)
5. App no se bloquea ni muestra pantalla blanca

---

---

## Sección D: Evidencia de Verificación DACC-CIERRE (2026-02-17)

```
npx tsc --noEmit       → 0 errores
npx vitest run         → 24/24 tests passing (2 test files)
npm run build          → SUCCESS (2.19s, 1,409.89 kB)
npx eslint (4 files)   → 0 errores, 0 warnings
```

**Archivos modificados:**
| Archivo | Cambio | Líneas |
|---------|--------|--------|
| `src/types/initialWizard.ts` | +`initialSucursalId?: string \| null` | L19-20 |
| `src/pages/Index.tsx` | -`routeCashCutToCortePage` + 4 setters, +`initialSucursalId` prop | L23,84,130,135,139,154 |
| `src/hooks/initial-wizard/useInitialWizardController.ts` | +destructure prop, +useEffect preselección | L17,88-94 |
| `index.cashcut-routing.test.tsx` | +assertions `data-initial-sucursal-id` | L41-42,78,96 |
| `useInitialWizardController.test.ts` | +3 tests preselección sucursal | L450-485 |

---

## Resultado Final Esperado

| Criterio | Antes (Dos Mundos) | Después (Unificado) |
|----------|--------------------|---------------------|
| UX/UI consistente | No (2 interfaces) | Si (wizard unico) |
| Datos de Supabase | Solo en CortePage | En wizard completo |
| Persistencia sesion | Solo en CorteOrquestador | En handleWizardComplete |
| Reanudacion corte | Solo CortePage | Wizard con pre-seleccion |
| Anti-fraude (testigo != cajero) | Solo en wizard | Preservado |
| paradise.ts necesario | Si (fallback) | No (100% Supabase) |
