-- OT-16: Catalogo de empleados y relacion por sucursal
-- Ejecutar en Supabase SQL Editor despues de 001_schema_inicial.sql

BEGIN;

CREATE TABLE IF NOT EXISTS public.empleados (
  id text PRIMARY KEY,
  nombre text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.empleado_sucursales (
  empleado_id text NOT NULL REFERENCES public.empleados(id) ON DELETE CASCADE,
  sucursal_id text NOT NULL REFERENCES public.sucursales(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empleado_id, sucursal_id)
);

CREATE INDEX IF NOT EXISTS idx_empleado_sucursales_sucursal
  ON public.empleado_sucursales (sucursal_id);

DROP TRIGGER IF EXISTS trg_empleados_updated_at ON public.empleados;
CREATE TRIGGER trg_empleados_updated_at
BEFORE UPDATE ON public.empleados
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empleado_sucursales ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS anon_rw_empleados ON public.empleados;
DROP POLICY IF EXISTS anon_rw_empleado_sucursales ON public.empleado_sucursales;

CREATE POLICY anon_rw_empleados
  ON public.empleados
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY anon_rw_empleado_sucursales
  ON public.empleado_sucursales
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

INSERT INTO public.empleados (id, nombre, activo) VALUES
  ('tito-gomez', 'Tito Gomez', true),
  ('adonay-torres', 'Adonay Torres', true),
  ('irvin-abarca', 'Irvin Abarca', true),
  ('edenilson-lopez', 'Edenilson Lopez', true),
  ('jonathan-melara', 'Jonathan Melara', true)
ON CONFLICT (id) DO UPDATE
SET nombre = EXCLUDED.nombre,
    activo = EXCLUDED.activo,
    updated_at = now();

INSERT INTO public.empleado_sucursales (empleado_id, sucursal_id) VALUES
  ('tito-gomez', 'suc-001'),
  ('adonay-torres', 'suc-001'),
  ('irvin-abarca', 'suc-002'),
  ('edenilson-lopez', 'suc-002'),
  ('jonathan-melara', 'suc-001'),
  ('jonathan-melara', 'suc-002')
ON CONFLICT (empleado_id, sucursal_id) DO NOTHING;

COMMIT;

NOTIFY pgrst, 'reload schema';
