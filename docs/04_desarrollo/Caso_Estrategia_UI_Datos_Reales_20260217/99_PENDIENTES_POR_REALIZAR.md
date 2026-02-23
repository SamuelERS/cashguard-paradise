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
