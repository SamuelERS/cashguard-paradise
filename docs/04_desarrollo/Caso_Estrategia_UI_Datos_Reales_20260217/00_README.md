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

## Resultado
Parcial:
- Se concluye estrategia recomendada: mantener UI tradicional como canon operativo y conectar primero datos reales.
- Se define ruta de modernizacion por capas con criterios de salida verificables.
- Se ejecuta y valida Modulo A en local con evidencia reproducible (PASS).

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
