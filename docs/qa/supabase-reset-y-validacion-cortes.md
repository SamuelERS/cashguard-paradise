# Runbook QA: Reset Supabase + Validación Cruzada de Cortes

Fecha: 2026-02-25  
Ambiente sugerido: staging/local conectado a Supabase real

## Objetivo
Eliminar ruido de datos operativos viejos y validar, con dataset limpio y realista, si la discrepancia entre `Dashboard Supervisor` y `Corte Nocturno` proviene de datos congelados o de un bug real.

## Pre-check obligatorio (forense)
1. Abrir Supabase SQL Editor.
2. Ejecutar `supabase/maintenance/000_diagnostics_cortes.sql`.
3. Guardar evidencia (capturas/resultados exportados) de:
   - activos con `finalizado_at` no nulo
   - cortes activos sin intento `ACTIVO`
   - sucursales con más de un activo

## Reset operacional
1. Ejecutar `supabase/maintenance/010_reset_operational_data.sql`.
2. Verificar manualmente:
   - `public.cortes` sin registros
   - `public.corte_intentos` sin registros
   - `public.corte_conteo_snapshots` sin registros
3. Confirmar que catálogos permanecen intactos:
   - `public.sucursales`
   - `public.empleados`
   - `public.empleado_sucursales`

## Seed realista
1. Ejecutar `supabase/maintenance/020_seed_cortes_realistas.sql`.
2. Verificar estado sembrado:
   - 1 corte `FINALIZADO` en `suc-001`
   - 1 corte `EN_PROGRESO` en `suc-002`
   - intento `COMPLETADO` para el finalizado
   - intento `ACTIVO` para el corte en progreso
   - snapshots en `public.corte_conteo_snapshots` con `source` `manual` y `autosave`

## Validación funcional en UI
1. Levantar app local en `http://localhost:5173`.
2. Ir a `Dashboard Supervisor`:
   - En `Hoy` debe aparecer un corte activo (`EN_PROGRESO`) y uno cerrado (`FINALIZADO`).
   - En detalle del cerrado deben verse montos/entrega/gastos coherentes.
3. Ir a `Corte Nocturno`:
   - Para sucursal con activo, debe advertir sesión activa y ofrecer reanudar/abortar.
   - Para sucursal sin activo, debe permitir inicio normal.

## Criterio de diagnóstico final
- Si después del reset + seed la app queda consistente, la causa raíz principal era **data stale**.
- Si persiste desalineación, la causa raíz es **bug de lógica** en detección/consulta de sesión activa y debe abrirse task de corrección sobre:
  - `src/pages/Index.tsx` (`detectActiveCashCutSession`)
  - `src/hooks/useCorteSesion.ts` (`recuperarSesion`)
  - `src/hooks/useSupervisorQueries.ts` (fuente de verdad para estados del día)
