-- Diagnostico forense no destructivo para detectar inconsistencias en cortes.
-- Ejecutar antes de resetear datos para preservar evidencia.

-- A) Ghost activo: estado activo con finalizado_at no nulo.
select
  id,
  correlativo,
  sucursal_id,
  estado,
  created_at,
  updated_at,
  finalizado_at
from public.cortes
where estado in ('INICIADO', 'EN_PROGRESO')
  and finalizado_at is not null
order by updated_at desc;

-- B) Corte activo sin intento ACTIVO asociado.
select
  c.id,
  c.correlativo,
  c.sucursal_id,
  c.estado,
  c.intento_actual,
  c.updated_at
from public.cortes c
left join public.corte_intentos i
  on i.corte_id = c.id
 and i.estado = 'ACTIVO'
where c.estado in ('INICIADO', 'EN_PROGRESO')
  and i.id is null
order by c.updated_at desc;

-- C) Multiples cortes activos en una misma sucursal (viola guardrail esperado).
select
  sucursal_id,
  count(*) as activos
from public.cortes
where estado in ('INICIADO', 'EN_PROGRESO')
group by sucursal_id
having count(*) > 1
order by sucursal_id asc;
