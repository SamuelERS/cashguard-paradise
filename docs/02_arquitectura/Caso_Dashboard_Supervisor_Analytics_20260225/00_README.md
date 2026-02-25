# Caso: Dashboard Supervisor — Pantalla Analytics/KPI

| Campo            | Valor                                         |
|------------------|-----------------------------------------------|
| Fecha inicio     | 2026-02-25                                    |
| Fecha actualización | 2026-02-25                                 |
| Estado           | 🔴 Pendiente                                  |
| Prioridad        | Alta                                          |
| Responsable      | SamuelERS / Claude                            |
| Rama             | `claude/supervisor-dashboard-architecture-CG4mS` |

---

## Resumen

El Dashboard Supervisor actualmente solo tiene dos tabs: **Hoy** y **Historial**.
No existe ninguna pantalla que muestre métricas de negocio consolidadas (ventas por
sucursal, gastos reportados, diferencias diarias, resumen financiero del período).

Esta iniciativa agrega un tercer tab **Resumen** con una pantalla KPI profesional
que consume datos ya disponibles en la tabla `cortes` vía Supabase.

---

## Documentos

| Nº  | Archivo                          | Descripción                              |
|-----|----------------------------------|------------------------------------------|
| 01  | `01_Diagnostico_Estado_Actual.md` | Gaps identificados — qué falta y por qué |
| 02  | `02_Mapa_Datos_Disponibles.md`    | Campos JSONB confirmados por tabla       |

---

## Plan de implementación

Archivo: `docs/plans/2026-02-25-supervisor-analytics-dashboard.md`

4 tareas modulares (1 archivo = 1 tarea):

1. `queryKeys.ts` — agregar clave `analytics`
2. `useSupervisorAnalytics.ts` — nuevo hook de queries
3. `CortesResumen.tsx` — componente KPI página completa
4. `SupervisorDashboard.tsx` + `App.tsx` — tab + ruta

---

## Resultado

🔴 **Pendiente aprobación** — Sin código modificado aún.

Toda la investigación (Phase 1 DIRM) está completa.
Se requiere aprobación explícita de SamuelERS para iniciar Phase 2.
