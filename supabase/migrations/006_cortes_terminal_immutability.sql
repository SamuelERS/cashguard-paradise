-- OT-20: Inmutabilidad de cortes terminales (anti-manipulación)
-- Ejecutar después de 005_cortes_terminal_guards_and_daily_reconciliation.sql

BEGIN;

CREATE OR REPLACE FUNCTION public.prevent_terminal_corte_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.estado IN ('FINALIZADO', 'ABORTADO') THEN
    RAISE EXCEPTION 'Corte terminal inmutable';
  END IF;

  IF TG_OP = 'DELETE' AND OLD.estado IN ('FINALIZADO', 'ABORTADO') THEN
    RAISE EXCEPTION 'Corte terminal inmutable';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_cortes_prevent_terminal_mutation ON public.cortes;
CREATE TRIGGER trg_cortes_prevent_terminal_mutation
BEFORE UPDATE OR DELETE ON public.cortes
FOR EACH ROW
EXECUTE FUNCTION public.prevent_terminal_corte_mutation();

COMMIT;

NOTIFY pgrst, 'reload schema';
