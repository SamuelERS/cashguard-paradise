-- OT-19: Integridad terminal + reconciliación diaria de cortes activos vencidos
-- Ejecutar después de 004_cortes_integrity_guards.sql

BEGIN;

ALTER TABLE public.cortes
  DROP CONSTRAINT IF EXISTS chk_cortes_terminal_timestamp;

ALTER TABLE public.cortes
  ADD CONSTRAINT chk_cortes_terminal_timestamp
  CHECK (
    (estado IN ('FINALIZADO', 'ABORTADO') AND finalizado_at IS NOT NULL)
    OR
    (estado IN ('INICIADO', 'EN_PROGRESO') AND finalizado_at IS NULL)
  );

CREATE OR REPLACE FUNCTION public.reconciliar_cortes_vencidos(
  p_fecha_corte date DEFAULT (now() AT TIME ZONE 'America/El_Salvador')::date
)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_count integer;
BEGIN
  UPDATE public.cortes
  SET
    estado = 'ABORTADO',
    motivo_aborto = COALESCE(motivo_aborto, 'Auto-aborto por cierre diario sin finalización'),
    finalizado_at = COALESCE(finalizado_at, now()),
    updated_at = now()
  WHERE estado IN ('INICIADO', 'EN_PROGRESO')
    AND (created_at AT TIME ZONE 'America/El_Salvador')::date < p_fecha_corte;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;

COMMIT;

NOTIFY pgrst, 'reload schema';
