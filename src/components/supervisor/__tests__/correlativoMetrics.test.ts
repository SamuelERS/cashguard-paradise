import { describe, expect, it } from 'vitest';
import type { CorteConSucursal } from '@/hooks/useSupervisorQueries';
import {
  buildCorrelativoDashboardMetrics,
  parseCorrelativo,
} from '../correlativoMetrics';

describe('parseCorrelativo', () => {
  it('extrae fecha, sucursal, secuencial e intento opcional', () => {
    expect(parseCorrelativo('CORTE-2026-02-25-H-002')).toEqual({
      valido: true,
      fecha: '2026-02-25',
      sucursalCodigo: 'H',
      secuencial: 2,
      intento: null,
      correlativo: 'CORTE-2026-02-25-H-002',
    });

    expect(parseCorrelativo('CORTE-2026-02-25-H-002-A3')).toEqual({
      valido: true,
      fecha: '2026-02-25',
      sucursalCodigo: 'H',
      secuencial: 2,
      intento: 3,
      correlativo: 'CORTE-2026-02-25-H-002-A3',
    });
  });

  it('retorna invalido para formatos corruptos', () => {
    expect(parseCorrelativo('INVALIDO')).toEqual({
      valido: false,
      fecha: null,
      sucursalCodigo: null,
      secuencial: null,
      intento: null,
      correlativo: 'INVALIDO',
    });
  });
});

describe('buildCorrelativoDashboardMetrics', () => {
  it('calcula maximo secuencial por sucursal y atraso de cortes activos', () => {
    const cortes = [
      { id: '1', correlativo: 'CORTE-2026-02-25-M-001', estado: 'EN_PROGRESO' },
      { id: '2', correlativo: 'CORTE-2026-02-25-M-004', estado: 'FINALIZADO' },
      { id: '3', correlativo: 'CORTE-2026-02-25-H-002', estado: 'INICIADO' },
    ] as unknown as CorteConSucursal[];

    const metrics = buildCorrelativoDashboardMetrics(cortes);

    expect(metrics.maxSecuencialPorSucursal.get('M')).toBe(4);
    expect(metrics.atrasoPorCorteId.get('1')).toBe(3);
    expect(metrics.atrasoPorCorteId.get('2')).toBe(0);
    expect(metrics.activosAtrasados).toBe(1);
  });
});
