# Caso: Dashboard Supervisor/Gerente

| Campo | Valor |
|-------|-------|
| **Fecha inicio** | 2026-02-19 |
| **Fecha actualización** | 2026-02-19 |
| **Estado** | 🔴 Pendiente |
| **Prioridad** | Alta |
| **Responsable** | Claude Code (Opus 4.6) |

## Resumen

Hoy el sistema es 100% para el cajero. El gerente recibe un WhatsApp y ya. No hay dashboard donde vea todos los cortes de todas las sucursales, no hay historial, no hay alertas automáticas. Los datos ya están en Supabase — lo que falta es una interfaz para consumirlos del otro lado.

## Contexto

Con SANN-R4 completado, cada corte de caja guarda datos ricos en Supabase (JSONB): conteo, entrega, verificación ciega, reporte. Pero nadie puede consultarlos excepto yendo directo a la base de datos. Un gerente necesita ver esto con un click.

## Hallazgos de Investigación

### Infraestructura Existente (ya funciona)
- **5 tablas Supabase** con datos completos por corte
- **Campos JSONB** almacenan: `datos_conteo`, `datos_entrega`, `datos_verificacion`, `datos_reporte`, `reporte_hash`
- **`corte_conteo_snapshots`**: Tabla append-only de auditoría
- **`DeliveryDashboard.tsx`**: Existe pero es solo para entregas, NO para supervisión general
- **`CorteStatusBanner.tsx`**: Monitor de conexión (reutilizable)

### Lo que NO Existe (se necesita construir)
- Capa de consultas históricas (queries Supabase para rangos de fecha, sucursal, cajero)
- Vista de lista de cortes con semáforo (verde/amarillo/rojo)
- Detalle de corte individual con desglose completo
- Vista de auditoría de verificación ciega (intentos, severidades)
- Análisis de discrepancias por cajero/sucursal
- Alertas automáticas por faltantes críticos
- Métricas de desempeño de cajeros

## Documentos

| Archivo | Descripción | Estado |
|---------|-------------|--------|
| `01_Diagnostico_Datos_Disponibles.md` | Mapeo completo de datos en Supabase disponibles para dashboard | ✅ Completado |
| `02_Plan_Arquitectonico_Dashboard.md` | Arquitectura: rutas, componentes, queries, autenticación | ✅ Completado |
| `03_Wireframes_Pantallas.md` | Mockups ASCII de las pantallas principales | ✅ Completado |
| `04_Plan_Implementacion.md` | Plan TDD bite-sized para construir el dashboard | 🔴 Pendiente (crear al iniciar desarrollo) |

## Resultado

[Completar cuando el dashboard esté implementado]

## Referencias

- `src/hooks/useCorteSesion.ts` — Hook de sesiones (referencia de estructura datos)
- `src/components/DeliveryDashboard.tsx` — Dashboard existente (delivery only)
- `src/components/CorteStatusBanner.tsx` — Banner de estado (reutilizable)
- Supabase tables: `cortes`, `sucursales`, `empleados`, `corte_intentos`, `corte_conteo_snapshots`
