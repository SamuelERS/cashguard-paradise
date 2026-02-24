-- OT-18: Guardrails de integridad anti-fraude para cortes e intentos
-- Ejecutar después de 003_corte_conteo_snapshots_schema.sql

BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.cortes c
    WHERE c.estado IN ('INICIADO', 'EN_PROGRESO')
    GROUP BY c.sucursal_id
    HAVING COUNT(*) > 1
  ) THEN
    EXECUTE '
      CREATE UNIQUE INDEX IF NOT EXISTS uq_cortes_activo_por_sucursal
      ON public.cortes (sucursal_id)
      WHERE estado IN (''INICIADO'',''EN_PROGRESO'')
    ';
  ELSE
    RAISE NOTICE 'Se omitió uq_cortes_activo_por_sucursal: existen duplicados activos por sucursal';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.corte_intentos i
    WHERE i.estado = 'ACTIVO'
    GROUP BY i.corte_id
    HAVING COUNT(*) > 1
  ) THEN
    EXECUTE '
      CREATE UNIQUE INDEX IF NOT EXISTS uq_intento_activo_por_corte
      ON public.corte_intentos (corte_id)
      WHERE estado = ''ACTIVO''
    ';
  ELSE
    RAISE NOTICE 'Se omitió uq_intento_activo_por_corte: existen múltiples intentos activos por corte';
  END IF;
END $$;

ALTER TABLE public.cortes
  DROP CONSTRAINT IF EXISTS chk_cajero_testigo_distintos;

ALTER TABLE public.cortes
  ADD CONSTRAINT chk_cajero_testigo_distintos
  CHECK (cajero <> testigo);

COMMIT;

NOTIFY pgrst, 'reload schema';
