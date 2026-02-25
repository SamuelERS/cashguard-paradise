-- Smoke anti-manipulación terminal para cortes/intentos.
-- Objetivo: validar que filas terminales son inmutables y transiciones legítimas siguen operando.
-- Script no destructivo: usa BEGIN + ROLLBACK.

BEGIN;

DO $$
DECLARE
  v_suffix text := to_char(clock_timestamp(), 'YYYYMMDDHH24MISSMS');
  v_terminal_corte_id uuid;
  v_progress_corte_id uuid;
  v_terminal_intento_id uuid;
BEGIN
  INSERT INTO public.cortes (
    correlativo,
    sucursal_id,
    cajero,
    testigo,
    estado,
    fase_actual,
    intento_actual,
    venta_esperada,
    datos_conteo,
    datos_entrega,
    datos_verificacion,
    datos_reporte,
    reporte_hash,
    finalizado_at,
    motivo_aborto
  )
  VALUES (
    'SMOKE-TERMINAL-' || v_suffix,
    'suc-001',
    'Smoke Cajero',
    'Smoke Testigo',
    'FINALIZADO',
    3,
    1,
    500.00,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    '{"difference":0}'::jsonb,
    'smoke-hash-terminal',
    now(),
    null
  )
  RETURNING id INTO v_terminal_corte_id;

  INSERT INTO public.corte_intentos (
    corte_id,
    attempt_number,
    estado,
    snapshot_datos,
    motivo_reinicio,
    finalizado_at
  )
  VALUES (
    v_terminal_corte_id,
    1,
    'COMPLETADO',
    '{}'::jsonb,
    null,
    now()
  )
  RETURNING id INTO v_terminal_intento_id;

  -- 1) Update de corte terminal debe fallar
  BEGIN
    UPDATE public.cortes
    SET venta_esperada = 999.99
    WHERE id = v_terminal_corte_id;
    RAISE EXCEPTION 'FAIL: update terminal de corte fue permitido';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM ILIKE '%Corte terminal inmutable%' THEN
        RAISE NOTICE 'PASS: update terminal de corte fue bloqueado';
      ELSE
        RAISE;
      END IF;
  END;

  -- 2) Delete de corte terminal debe fallar
  BEGIN
    DELETE FROM public.cortes
    WHERE id = v_terminal_corte_id;
    RAISE EXCEPTION 'FAIL: delete terminal de corte fue permitido';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM ILIKE '%Corte terminal inmutable%' THEN
        RAISE NOTICE 'PASS: delete terminal de corte fue bloqueado';
      ELSE
        RAISE;
      END IF;
  END;

  -- 3) Update de intento terminal debe fallar
  BEGIN
    UPDATE public.corte_intentos
    SET motivo_reinicio = 'intento-manipulacion'
    WHERE id = v_terminal_intento_id;
    RAISE EXCEPTION 'FAIL: update terminal de intento fue permitido';
  EXCEPTION
    WHEN OTHERS THEN
      IF SQLERRM ILIKE '%Intento terminal inmutable%' THEN
        RAISE NOTICE 'PASS: update terminal de intento fue bloqueado';
      ELSE
        RAISE;
      END IF;
  END;

  -- 4) Flujo legítimo EN_PROGRESO -> FINALIZADO debe continuar permitido
  INSERT INTO public.cortes (
    correlativo,
    sucursal_id,
    cajero,
    testigo,
    estado,
    fase_actual,
    intento_actual,
    venta_esperada,
    datos_conteo,
    datos_entrega,
    datos_verificacion,
    datos_reporte,
    reporte_hash,
    finalizado_at,
    motivo_aborto
  )
  VALUES (
    'SMOKE-PROGRESS-' || v_suffix,
    'suc-001',
    'Smoke Cajero',
    'Smoke Testigo',
    'EN_PROGRESO',
    2,
    1,
    600.00,
    '{}'::jsonb,
    '{}'::jsonb,
    '{}'::jsonb,
    null,
    null,
    null,
    null
  )
  RETURNING id INTO v_progress_corte_id;

  UPDATE public.cortes
  SET
    estado = 'FINALIZADO',
    reporte_hash = 'smoke-hash-legit',
    finalizado_at = now()
  WHERE id = v_progress_corte_id;

  IF EXISTS (
    SELECT 1
    FROM public.cortes
    WHERE id = v_progress_corte_id
      AND estado = 'FINALIZADO'
      AND finalizado_at IS NOT NULL
  ) THEN
    RAISE NOTICE 'PASS: transición legítima EN_PROGRESO -> FINALIZADO permitida';
  ELSE
    RAISE EXCEPTION 'FAIL: transición legítima EN_PROGRESO -> FINALIZADO no aplicada';
  END IF;
END;
$$;

ROLLBACK;
