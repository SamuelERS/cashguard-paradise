-- OT-12: Esquema inicial CashGuard Paradise
-- Ejecutar en Supabase SQL Editor (Dashboard → SQL Editor → New query → Pegar → Run)

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE IF NOT EXISTS public.sucursales (
  id text PRIMARY KEY,
  nombre text NOT NULL,
  codigo text NOT NULL UNIQUE,
  activa boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sucursales_codigo_chk CHECK (char_length(codigo) = 1 AND codigo = upper(codigo))
);

CREATE TABLE IF NOT EXISTS public.cortes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  correlativo text NOT NULL UNIQUE,
  sucursal_id text NOT NULL REFERENCES public.sucursales(id),
  cajero text NOT NULL,
  testigo text NOT NULL,
  estado text NOT NULL CHECK (estado IN ('INICIADO','EN_PROGRESO','FINALIZADO','ABORTADO')),
  fase_actual integer NOT NULL DEFAULT 0 CHECK (fase_actual BETWEEN 0 AND 3),
  intento_actual integer NOT NULL DEFAULT 1 CHECK (intento_actual > 0),
  venta_esperada numeric(12,2) NULL,
  datos_conteo jsonb NULL,
  datos_entrega jsonb NULL,
  datos_verificacion jsonb NULL,
  datos_reporte jsonb NULL,
  reporte_hash text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  finalizado_at timestamptz NULL,
  motivo_aborto text NULL
);

CREATE TABLE IF NOT EXISTS public.corte_intentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corte_id uuid NOT NULL REFERENCES public.cortes(id) ON DELETE CASCADE,
  attempt_number integer NOT NULL CHECK (attempt_number > 0),
  estado text NOT NULL CHECK (estado IN ('ACTIVO','COMPLETADO','ABANDONADO')),
  snapshot_datos jsonb NULL,
  motivo_reinicio text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  finalizado_at timestamptz NULL,
  UNIQUE (corte_id, attempt_number)
);

CREATE INDEX IF NOT EXISTS idx_cortes_sucursal_estado_created
  ON public.cortes (sucursal_id, estado, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_intentos_corte_estado_created
  ON public.corte_intentos (corte_id, estado, created_at DESC);

DROP TRIGGER IF EXISTS trg_sucursales_updated_at ON public.sucursales;
CREATE TRIGGER trg_sucursales_updated_at
BEFORE UPDATE ON public.sucursales
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_cortes_updated_at ON public.cortes;
CREATE TRIGGER trg_cortes_updated_at
BEFORE UPDATE ON public.cortes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cortes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corte_intentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS anon_rw_sucursales ON public.sucursales;
DROP POLICY IF EXISTS anon_rw_cortes ON public.cortes;
DROP POLICY IF EXISTS anon_rw_corte_intentos ON public.corte_intentos;

CREATE POLICY anon_rw_sucursales ON public.sucursales FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY anon_rw_cortes ON public.cortes FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY anon_rw_corte_intentos ON public.corte_intentos FOR ALL TO anon USING (true) WITH CHECK (true);

INSERT INTO public.sucursales (id, nombre, codigo, activa) VALUES
  ('suc-001', 'Los Héroes', 'H', true),
  ('suc-002', 'Plaza Merliot', 'M', true),
  ('suc-003', 'San Benito', 'B', false)
ON CONFLICT (id) DO UPDATE
SET nombre = EXCLUDED.nombre,
    codigo = EXCLUDED.codigo,
    activa = EXCLUDED.activa,
    updated_at = now();

COMMIT;

NOTIFY pgrst, 'reload schema';
