-- Reset operacional: solo tablas transaccionales de corte.
-- Preserva catalogos (sucursales, empleados, empleado_sucursales).

BEGIN;

TRUNCATE TABLE
  public.corte_conteo_snapshots,
  public.corte_intentos,
  public.cortes
RESTART IDENTITY;

COMMIT;

NOTIFY pgrst, 'reload schema';
