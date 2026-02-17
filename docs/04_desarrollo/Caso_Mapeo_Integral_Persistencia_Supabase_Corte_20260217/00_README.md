# Caso: Mapeo Integral Persistencia Supabase Corte

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-17 |
| **Fecha actualizacion** | 2026-02-17 |
| **Estado** | ✅ Mapeo completado / ⏭️ Implementacion pendiente |
| **Prioridad** | Critica |
| **Responsable** | Codex (GPT-5) |

## Resumen
Se documenta el mapa completo de datos del flujo de corte para asegurar que no se pierda informacion critica:
- Datos capturados por UI (sucursal, cajero/testigo, SICAR, monedas/billetes, electronicos, gastos, entrega, verificacion y reporte).
- Datos realmente persistidos hoy en Supabase.
- Brechas de persistencia y riesgos operativos.
- Peticion formal al siguiente agente para implementar cierre de brechas con TDD.

## Contexto
El requerimiento operativo exige trazabilidad total de lo que captura el empleado durante el corte.
La inspeccion confirma que el flujo UI actualmente enroutado en `/` no persiste el detalle completo en Supabase.

## Documentos
| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `01_Mapeo_Integral_Fuentes_Datos_Supabase.md` | Mapa tecnico E2E (UI -> estado -> Supabase) con evidencia real | ✅ |
| `02_Matriz_Captura_vs_Persistencia.md` | Matriz de cobertura de campos (capturado, persistido, brecha) | ✅ |
| `03_Peticion_Implementacion_No_Perdida.md` | Orden tecnica para siguiente agente (TDD primero, sin perdida de datos) | ✅ |

## Resultado
- Se establece una linea base auditable del estado actual.
- Se identifica brecha principal: datos detallados del corte no llegan de forma completa y continua a Supabase en el flujo activo.
- Se entrega peticion modular lista para ejecucion por un nuevo agente.

## Referencias
- `src/App.tsx`
- `src/pages/Index.tsx`
- `src/hooks/useCorteSesion.ts`
- `src/components/corte/CorteOrquestador.tsx`
- `src/components/corte/CorteConteoAdapter.tsx`
- `src/hooks/useCashCounterOrchestrator.ts`
- `src/hooks/usePhaseManager.ts`
- `src/utils/generate-evening-report.ts`
- `src/types/cash.ts`
- `src/types/expenses.ts`
- `src/types/phases.ts`
- `src/types/verification.ts`
- `src/lib/supabase.ts`
