-- Seed operacional realista para validacion funcional supervisor/nocturno.
-- Precondicion: ejecutar despues de 010_reset_operational_data.sql.

BEGIN;

WITH corte_finalizado AS (
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
    created_at,
    updated_at,
    finalizado_at,
    motivo_aborto
  )
  VALUES (
    'CORTE-2026-02-25-H-001',
    'suc-001',
    'Adonay Torres',
    'Jonathan Melara',
    'FINALIZADO',
    3,
    1,
    654.00,
    '{
      "conteo_parcial":{"bill100":2,"bill50":3,"bill20":4,"bill10":4,"bill5":11,"bill1":22,"quarter":44,"dime":55,"nickel":66,"penny":77},
      "pagos_electronicos":{"credomatic":23.00,"promerica":0,"bankTransfer":0,"paypal":0},
      "gastos_dia":{"items":[{"id":"gasto-seed-1","amount":12.50,"concept":"Taxi cierre"}]}
    }'::jsonb,
    '{"amount_to_deliver":573.57,"amount_remaining":50}'::jsonb,
    '{"override_count":0,"triple_mismatch_count":0}'::jsonb,
    '{"generated_by":"seed","notes":"corte finalizado de referencia"}'::jsonb,
    'seed-hash-finalizado-h001',
    now() - interval '55 minutes',
    now() - interval '25 minutes',
    now() - interval '25 minutes',
    null
  )
  RETURNING id
),
intento_finalizado AS (
  INSERT INTO public.corte_intentos (
    corte_id,
    attempt_number,
    estado,
    snapshot_datos,
    motivo_reinicio,
    finalizado_at
  )
  SELECT
    id,
    1,
    'COMPLETADO',
    '{"seed":"finalizado"}'::jsonb,
    null,
    now() - interval '25 minutes'
  FROM corte_finalizado
  RETURNING corte_id
),
corte_activo AS (
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
    created_at,
    updated_at,
    finalizado_at,
    motivo_aborto
  )
  VALUES (
    'CORTE-2026-02-25-M-001',
    'suc-002',
    'Irvin Abarca',
    'Edenilson Lopez',
    'EN_PROGRESO',
    2,
    1,
    712.40,
    '{
      "conteo_parcial":{"bill100":1,"bill50":1,"bill20":7,"bill10":4,"bill5":6,"bill1":12,"quarter":30,"dime":20,"nickel":10,"penny":40},
      "pagos_electronicos":{"credomatic":15.00,"promerica":26.20,"bankTransfer":0,"paypal":0},
      "gastos_dia":{"items":[{"id":"gasto-seed-2","amount":8.75,"concept":"Parqueo mensajero"}]}
    }'::jsonb,
    '{"amount_to_deliver":351.65,"amount_remaining":50}'::jsonb,
    '{"override_count":1,"triple_mismatch_count":0}'::jsonb,
    '{"generated_by":"seed","notes":"corte activo para probar reanudacion"}'::jsonb,
    null,
    now() - interval '20 minutes',
    now() - interval '3 minutes',
    null,
    null
  )
  RETURNING id
),
intento_activo AS (
  INSERT INTO public.corte_intentos (
    corte_id,
    attempt_number,
    estado,
    snapshot_datos,
    motivo_reinicio,
    finalizado_at
  )
  SELECT
    id,
    1,
    'ACTIVO',
    '{"seed":"en_progreso"}'::jsonb,
    null,
    null
  FROM corte_activo
  RETURNING corte_id
)
INSERT INTO public.corte_conteo_snapshots (
  corte_id,
  attempt_number,
  fase_actual,
  penny,
  nickel,
  dime,
  quarter,
  bill1,
  bill5,
  bill10,
  bill20,
  bill50,
  bill100,
  credomatic,
  promerica,
  bank_transfer,
  paypal,
  gastos_dia,
  source,
  captured_at
)
SELECT
  cf.id,
  1,
  3,
  77,
  66,
  55,
  44,
  22,
  11,
  4,
  4,
  3,
  2,
  23,
  0,
  0,
  0,
  '[{"id":"gasto-seed-1","amount":12.50,"concept":"Taxi cierre"}]'::jsonb,
  'manual',
  now() - interval '26 minutes'
FROM corte_finalizado cf
UNION ALL
SELECT
  ca.id,
  1,
  2,
  40,
  10,
  20,
  30,
  12,
  6,
  4,
  7,
  1,
  1,
  15,
  26.20,
  0,
  0,
  '[{"id":"gasto-seed-2","amount":8.75,"concept":"Parqueo mensajero"}]'::jsonb,
  'autosave',
  now() - interval '3 minutes'
FROM corte_activo ca;

COMMIT;

NOTIFY pgrst, 'reload schema';
