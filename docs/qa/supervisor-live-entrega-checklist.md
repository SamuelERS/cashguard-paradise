# QA Checklist — Supervisor Entrega En Vivo

## Objetivo
Validar que la entrega confirmada en Fase 2 se persiste y se refleja en vivo en el detalle del supervisor.

## Precondiciones
- App corriendo en `http://localhost:5173`
- Supabase configurado
- Dos sesiones abiertas:
  - Operador (flujo de corte)
  - Supervisor (`/supervisor/corte/:id`)

## Pasos
1. Iniciar corte en operador y avanzar a Fase 2.
2. Confirmar una denominación (ejemplo: `dime`).
3. Verificar en supervisor:
   - Card `Entrega en vivo` visible.
   - Fila por denominación con columnas `Esperado`, `Entregado`, `Faltante`, `Hora`.
   - `Entregado acumulado` aumenta.
4. Confirmar una segunda denominación.
5. Verificar que la tabla se actualiza sin refresh manual.
6. Forzar caída de red/websocket.
7. Confirmar que supervisor mantiene última data y vuelve a sincronizar al reconectar.

## Criterios de aceptación
- El cambio aparece en supervisor en <= 3 segundos.
- `datos_entrega` conserva campos `live_delivery_progress`, `live_delivery_events`, `live_delivery_total`.
- No se pierde información en fallback offline/reconexión.
