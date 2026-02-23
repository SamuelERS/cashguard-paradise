# Caso: Estrategia UI con Datos Reales

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-17 |
| **Fecha actualizacion** | 2026-02-17 |
| **Estado** | 🟡 En progreso (Modulo A completado) |
| **Prioridad** | Alta |
| **Responsable** | Codex (GPT-5) |

## Resumen
Este caso define la estrategia para decidir entre mantener la UI tradicional o migrar de inmediato a la UI nueva.  
Se documenta un analisis tecnico verificable y un plan modular para conectar datos reales de Supabase sin romper flujo operativo.

## Contexto
El equipo confirma que la UI tradicional es la referencia operativa actual, pero en local aparecen catalogos que no coinciden con Supabase.  
Tambien existe una UI nueva de corte en el repositorio, con arquitectura distinta y rutas aun no activas en la entrada principal.

## Documentos
| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `01_Analisis_Comparativo_Interfaces.md` | Diagnostico tecnico: UI activa, UI nueva, fuentes de datos, riesgos | ✅ |
| `02_Plan_Arquitectonico_Modular_TDD.md` | Plan de ejecucion por modulos, con tests primero y gates de calidad | ✅ |
| `03_Matriz_Decision_Go_NoGo.md` | Criterios de decision y control de riesgos por etapa | ✅ |
| `04_Evidencia_Modulo_A_Validacion_Local.md` | Evidencia tecnica de ejecucion Modulo A (tests, build, Supabase real, Playwright) | ✅ |
| `05_Ruta_Estabilizacion_Modelo_Propio.md` | Ruta de estabilizacion antes de modernizacion (con evidencia y gates) | ✅ |
| `06_ORDEN_TECNICA_Traslado_Agente_Nuevo.md` | Orden de continuidad con contexto operativo para sesion nueva | ✅ |

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

## Referencias
- `docs/REGLAS_DOCUMENTACION.md`
- `docs/REGLAS_MOLDE_ORDENES_DE_TRABAJO.md`
- `src/pages/Index.tsx`
- `src/components/initial-wizard/InitialWizardModalView.tsx`
- `src/components/morning-count/MorningCountWizard.tsx`
- `src/components/corte/CortePage.tsx`
- `src/components/corte/CorteInicio.tsx`
- `src/lib/supabase.ts`
- `src/hooks/useSucursales.ts`
- `src/hooks/useEmpleadosSucursal.ts`
