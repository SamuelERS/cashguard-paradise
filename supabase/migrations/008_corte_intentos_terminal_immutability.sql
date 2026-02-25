-- OT-22: Inmutabilidad de intentos terminales (anti-manipulación)
-- Ejecutar después de 007_cortes_rls_hardening.sql

BEGIN;

CREATE OR REPLACE FUNCTION public.prevent_terminal_intento_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.estado IN ('COMPLETADO', 'ABANDONADO') THEN
    RAISE EXCEPTION 'Intento terminal inmutable';
  END IF;

  IF TG_OP = 'DELETE' AND OLD.estado IN ('COMPLETADO', 'ABANDONADO') THEN
    RAISE EXCEPTION 'Intento terminal inmutable';
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_intentos_prevent_terminal_mutation ON public.corte_intentos;
CREATE TRIGGER trg_intentos_prevent_terminal_mutation
BEFORE UPDATE OR DELETE ON public.corte_intentos
FOR EACH ROW
EXECUTE FUNCTION public.prevent_terminal_intento_mutation();

COMMIT;

NOTIFY pgrst, 'reload schema';
