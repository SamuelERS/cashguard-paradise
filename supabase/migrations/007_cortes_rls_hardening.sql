-- OT-21: Hardening RLS de cortes (eliminar policy abierta anon_rw_cortes)
-- Ejecutar después de 006_cortes_terminal_immutability.sql

BEGIN;

ALTER TABLE public.cortes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS anon_rw_cortes ON public.cortes;
DROP POLICY IF EXISTS cortes_select ON public.cortes;
DROP POLICY IF EXISTS cortes_insert ON public.cortes;
DROP POLICY IF EXISTS cortes_update_non_terminal ON public.cortes;

CREATE POLICY cortes_select
  ON public.cortes
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY cortes_insert
  ON public.cortes
  FOR INSERT
  TO anon
  WITH CHECK (estado IN ('INICIADO', 'EN_PROGRESO'));

CREATE POLICY cortes_update_non_terminal
  ON public.cortes
  FOR UPDATE
  TO anon
  USING (estado IN ('INICIADO', 'EN_PROGRESO'))
  WITH CHECK (estado IN ('INICIADO', 'EN_PROGRESO', 'FINALIZADO', 'ABORTADO'));

COMMIT;

NOTIFY pgrst, 'reload schema';
