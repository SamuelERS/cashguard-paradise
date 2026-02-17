# Caso: Plan Modular Unificación de Catálogos

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-17 |
| **Fecha actualización** | 2026-02-17 |
| **Estado** | 🟡 En progreso |
| **Prioridad** | Alta |
| **Responsable** | Codex (GPT-5) |

## Resumen
Este caso define el plan modular para eliminar inconsistencias entre fuentes de sucursales y empleados.  
El principio rector es **tests primero (TDD)** antes de cualquier cambio funcional.

## Contexto
Actualmente existen rutas del sistema que ya priorizan datos remotos y otras que siguen consumiendo catálogo local.  
Se necesita una secuencia profesional y auditable para completar la unificación sin regresiones.

## Documentos
| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `01_Plan_Modular_TDD.md` | Plan de ejecución por fases con gates de calidad | ✅ |
| `02_Matriz_Tests_Previos.md` | Matriz de pruebas obligatorias antes de tocar código real | ✅ |
| `03_Protocolo_Traslado_Casos_Completos.md` | Regla operativa para mover casos terminados | ✅ |

## Resultado
Parcial:
- Se creó el plan modular oficial del siguiente ciclo.
- Se creó carpeta de destino para cierres: `docs/04_desarrollo/CASOS-COMPLETOS/`.

## Referencias
- `docs/REGLAS_DOCUMENTACION.md`
- `docs/REGLAS_DE_LA_CASA.md`
- `docs/REGLAS_MOLDE_ORDENES_DE_TRABAJO.md`
