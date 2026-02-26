import { describe, expect, it } from 'vitest';
import type { CorteConSucursal } from '@/hooks/useSupervisorQueries';
import { buildSupervisorTodayViewModel } from '../supervisorTodayOrdering';

function makeCorte(overrides: Partial<CorteConSucursal>): CorteConSucursal {
  return {
    id: 'corte-1',
    correlativo: 'CORTE-2026-02-25-M-001',
    sucursal_id: 'suc-002',
    cajero: 'Irvin Abarca',
    testigo: 'Edenilson Lopez',
    estado: 'EN_PROGRESO',
    fase_actual: 1,
    intento_actual: 1,
    venta_esperada: 232,
    datos_conteo: null,
    datos_entrega: null,
    datos_verificacion: null,
    datos_reporte: null,
    reporte_hash: null,
    created_at: '2026-02-25T18:00:00.000Z',
    updated_at: '2026-02-25T18:00:00.000Z',
    finalizado_at: null,
    motivo_aborto: null,
    sucursales: {
      id: 'suc-002',
      nombre: 'Plaza Merliot',
      codigo: 'M',
      activa: true,
    },
    ...overrides,
  };
}

describe('buildSupervisorTodayViewModel', () => {
  it('ordena activos por updated_at desc y terminales por finalizado_at desc', () => {
    const vm = buildSupervisorTodayViewModel([
      makeCorte({
        id: 'a1',
        estado: 'EN_PROGRESO',
        correlativo: 'CORTE-2026-02-25-M-001',
        created_at: '2026-02-25T18:00:00.000Z',
        updated_at: '2026-02-25T18:01:00.000Z',
      }),
      makeCorte({
        id: 'a2',
        estado: 'INICIADO',
        correlativo: 'CORTE-2026-02-25-M-002',
        created_at: '2026-02-25T17:50:00.000Z',
        updated_at: '2026-02-25T18:05:00.000Z',
      }),
      makeCorte({
        id: 'f1',
        estado: 'FINALIZADO',
        correlativo: 'CORTE-2026-02-25-M-003',
        created_at: '2026-02-25T16:00:00.000Z',
        updated_at: '2026-02-25T16:30:00.000Z',
        finalizado_at: '2026-02-25T18:10:00.000Z',
      }),
      makeCorte({
        id: 'f2',
        estado: 'ABORTADO',
        correlativo: 'CORTE-2026-02-25-H-001',
        created_at: '2026-02-25T15:00:00.000Z',
        updated_at: '2026-02-25T15:20:00.000Z',
        finalizado_at: '2026-02-25T18:08:00.000Z',
      }),
    ]);

    expect(vm.activos.map(corte => corte.id)).toEqual(['a2', 'a1']);
    expect(vm.finalizados.map(corte => corte.id)).toEqual(['f1', 'f2']);
    expect(vm.resumen.total).toBe(4);
    expect(vm.resumen.activos).toBe(2);
    expect(vm.resumen.finalizados).toBe(2);
    expect(vm.resumen.ultimaActividad?.id).toBe('f1');
  });
});
