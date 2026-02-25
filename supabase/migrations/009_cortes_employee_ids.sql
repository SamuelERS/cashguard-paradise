-- OT-23: Alinear esquema cortes con trazabilidad de empleados (cajero_id/testigo_id)
-- Ejecutar después de 008_corte_intentos_terminal_immutability.sql

BEGIN;

ALTER TABLE public.cortes
  ADD COLUMN IF NOT EXISTS cajero_id text NULL REFERENCES public.empleados(id),
  ADD COLUMN IF NOT EXISTS testigo_id text NULL REFERENCES public.empleados(id);

CREATE INDEX IF NOT EXISTS idx_cortes_cajero_id ON public.cortes(cajero_id);
CREATE INDEX IF NOT EXISTS idx_cortes_testigo_id ON public.cortes(testigo_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_cortes_personas_ids_distintas'
      AND conrelid = 'public.cortes'::regclass
  ) THEN
    ALTER TABLE public.cortes
      ADD CONSTRAINT chk_cortes_personas_ids_distintas
      CHECK (
        cajero_id IS NULL
        OR testigo_id IS NULL
        OR cajero_id <> testigo_id
      );
  END IF;
END
$$;

COMMIT;

NOTIFY pgrst, 'reload schema';
