-- Override "Corte Finalizado": columna motivo_nuevo_corte + RPC actualizada
-- Ejecutar después de 011_cortes_iniciar_rpc_transaccional.sql
--
-- Permite crear un nuevo corte cuando ya existe uno FINALIZADO para hoy,
-- siempre que se proporcione una justificación obligatoria (string no vacío).

BEGIN;

-- 1. Nueva columna nullable en cortes
ALTER TABLE public.cortes
  ADD COLUMN IF NOT EXISTS motivo_nuevo_corte text NULL;

-- 2. RPC actualizada con 7° parámetro
CREATE OR REPLACE FUNCTION public.iniciar_corte_transaccional(
  p_sucursal_id text,
  p_cajero text,
  p_testigo text,
  p_venta_esperada numeric DEFAULT NULL,
  p_cajero_id text DEFAULT NULL,
  p_testigo_id text DEFAULT NULL,
  p_motivo_nuevo_corte text DEFAULT NULL
)
RETURNS public.cortes
LANGUAGE plpgsql
AS $$
DECLARE
  v_codigo text;
  v_fecha_negocio date;
  v_prefix text;
  v_secuencial integer;
  v_correlativo text;
  v_corte public.cortes%ROWTYPE;
BEGIN
  IF trim(coalesce(p_cajero, '')) = '' OR trim(coalesce(p_testigo, '')) = '' THEN
    RAISE EXCEPTION 'Cajero y testigo son obligatorios';
  END IF;

  IF p_cajero = p_testigo THEN
    RAISE EXCEPTION 'Cajero y testigo deben ser diferentes';
  END IF;

  v_fecha_negocio := (now() AT TIME ZONE 'America/El_Salvador')::date;

  SELECT s.codigo
  INTO v_codigo
  FROM public.sucursales s
  WHERE s.id = p_sucursal_id;

  IF v_codigo IS NULL THEN
    RAISE EXCEPTION 'Sucursal no encontrada';
  END IF;

  -- Override corte finalizado: bypass si motivo_nuevo_corte valido proporcionado
  IF EXISTS (
    SELECT 1
    FROM public.cortes c
    WHERE c.sucursal_id = p_sucursal_id
      AND c.estado = 'FINALIZADO'
      AND (c.created_at AT TIME ZONE 'America/El_Salvador')::date = v_fecha_negocio
  ) AND (p_motivo_nuevo_corte IS NULL OR trim(p_motivo_nuevo_corte) = '') THEN
    RAISE EXCEPTION 'Ya existe un corte finalizado para hoy';
  END IF;

  -- Lock por sucursal+fecha de negocio para evitar correlativos duplicados por concurrencia.
  PERFORM pg_advisory_xact_lock(hashtext(format('%s|%s', p_sucursal_id, v_fecha_negocio::text)));

  v_prefix := format('CORTE-%s-%s-', to_char(v_fecha_negocio, 'YYYY-MM-DD'), v_codigo);

  SELECT
    COALESCE(
      MAX(
        ((regexp_match(
          c.correlativo,
          '^CORTE-\d{4}-\d{2}-\d{2}-[A-Z]-([0-9]{3})(?:-A[0-9]+)?$'
        ))[1])::integer
      ),
      0
    ) + 1
  INTO v_secuencial
  FROM public.cortes c
  WHERE c.correlativo LIKE v_prefix || '%';

  v_correlativo := v_prefix || lpad(v_secuencial::text, 3, '0');

  INSERT INTO public.cortes (
    sucursal_id,
    cajero,
    cajero_id,
    testigo,
    testigo_id,
    estado,
    correlativo,
    fase_actual,
    intento_actual,
    venta_esperada,
    datos_conteo,
    datos_entrega,
    datos_verificacion,
    datos_reporte,
    reporte_hash,
    finalizado_at,
    motivo_aborto,
    motivo_nuevo_corte
  )
  VALUES (
    p_sucursal_id,
    p_cajero,
    p_cajero_id,
    p_testigo,
    p_testigo_id,
    'INICIADO',
    v_correlativo,
    0,
    1,
    p_venta_esperada,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL,
    p_motivo_nuevo_corte
  )
  RETURNING * INTO v_corte;

  RETURN v_corte;
END;
$$;

GRANT EXECUTE ON FUNCTION public.iniciar_corte_transaccional(text, text, text, numeric, text, text, text)
TO anon, authenticated, service_role;

COMMIT;

NOTIFY pgrst, 'reload schema';
