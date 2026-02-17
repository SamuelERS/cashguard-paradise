# Matriz de Tests Previos (Obligatorios)

**Fecha:** 2026-02-17  
**Caso:** `Caso_Plan_Modular_Unificacion_Catalogos_20260217/`

## Regla de entrada
No se permite escribir código funcional nuevo sin tener al menos 1 test RED por escenario crítico del módulo en turno.

## Módulo A: MorningCountWizard
### Tests RED requeridos antes de código
1. Fuente remota de sucursales visible en selector.
2. Empleados remotos por sucursal cargan completos.
3. Fallback legacy cuando fuente remota no disponible.
4. Testigo no puede ser el mismo cajero.

### Comando mínimo
```bash
npx vitest run src/components/morning-count/__tests__/MorningCountWizard.test.tsx
```

## Módulo B: Initial Wizard selectors/steps
### Tests RED requeridos antes de código
1. `getAvailableEmployees` usa fuente unificada.
2. `resolveStepSummary` resuelve nombres con datos remotos.
3. Step de sucursal no depende de catálogo hardcodeado.
4. Steps de cajero/testigo respetan exclusiones y datos activos.

### Comandos mínimos
```bash
npx vitest run src/lib/initial-wizard/__tests__/wizardSelectors.test.ts
npx vitest run src/components/initial-wizard/__tests__/InitialWizardModal.test.tsx
```

## Módulo C: Integración y regresión
### Pruebas obligatorias
1. Orquestador mantiene empleados completos al cambiar sucursal.
2. Flujo completo pasa de configuración a conteo sin pérdida de datos.
3. Build de producción en verde.

### Comandos mínimos
```bash
npx vitest run src/hooks/__tests__/useCashCounterOrchestrator.test.ts
npm run -s build
```

## Evidencia requerida por corrida
1. Fecha/hora
2. Comandos ejecutados
3. Resultado pass/fail
4. Si falla, error exacto y archivo

## Criterio de salida de fase
- Todas las suites del módulo en verde.
- Cero errores TypeScript en el alcance tocado.
