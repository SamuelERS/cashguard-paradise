# Runbook QA — Supervisor Live Refresh

## Objetivo
Validar que Dashboard Supervisor refleja cambios de corte en vivo con fallback cuando Realtime falla.

## Precondiciones
- App corriendo en `http://localhost:5173`
- Supabase configurado (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- Migraciones ejecutadas hasta `010_supervisor_realtime_publication.sql`

## Flujo de prueba
1. Abrir dos pestañas:
   - Pestaña A: operación de corte (caja)
   - Pestaña B: supervisor (`/supervisor/cortes` y luego detalle de un corte)
2. En Pestaña A iniciar un corte y avanzar fases.
3. En Pestaña B verificar:
   - Aparece etiqueta `En vivo` en lista y detalle.
   - Cambios de estado/montos se reflejan sin refresh manual.
4. Forzar degradación de red (desconectar internet o bloquear websocket).
5. Verificar en supervisor:
   - Etiqueta cambia a `Reconectando`.
   - Datos siguen refrescando por fallback polling (10s lista, 8s detalle).
6. Restaurar red.
7. Verificar retorno a `En vivo`.

## Criterios de aceptación
- No se congela la UI cuando se pierde realtime.
- El supervisor mantiene última data y vuelve a sincronizar al reconectar.
- No hay error fatal en consola relacionado a canales realtime.

## Troubleshooting rápido
- Si no llega realtime:
  - Confirmar que `public.cortes` y `public.corte_intentos` están en `supabase_realtime`.
  - Revisar RLS/policies y que la sesión use credenciales válidas.
- Si no cambia etiqueta:
  - Verificar que `useSupervisorRealtime` retorne `status=subscribed`.
- Si no refresca en fallback:
  - Verificar `refetchInterval` en `useSupervisorTodayFeed` y `useSupervisorCorteDetalleFeed`.
