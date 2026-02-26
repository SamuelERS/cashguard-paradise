import type { CorteConSucursal } from '@/hooks/useSupervisorQueries';
import { parseCorrelativo } from './correlativoMetrics';

const ESTADOS_ACTIVOS = new Set(['INICIADO', 'EN_PROGRESO']);
const ESTADOS_TERMINALES = new Set(['FINALIZADO', 'ABORTADO']);

export interface SupervisorTodaySummary {
  total: number;
  activos: number;
  finalizados: number;
  ultimaActividad: CorteConSucursal | null;
}

export interface SupervisorTodayViewModel {
  activos: CorteConSucursal[];
  finalizados: CorteConSucursal[];
  resumen: SupervisorTodaySummary;
}

function toTimestamp(value: string | null | undefined): number {
  if (!value) return 0;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function activeActivityTimestamp(corte: CorteConSucursal): number {
  return toTimestamp(corte.updated_at ?? corte.created_at);
}

function terminalActivityTimestamp(corte: CorteConSucursal): number {
  return toTimestamp(corte.finalizado_at ?? corte.updated_at ?? corte.created_at);
}

function isActivo(corte: CorteConSucursal): boolean {
  return ESTADOS_ACTIVOS.has(corte.estado);
}

function isTerminal(corte: CorteConSucursal): boolean {
  return ESTADOS_TERMINALES.has(corte.estado);
}

function compareCorrelativoDesc(a: CorteConSucursal, b: CorteConSucursal): number {
  const aSec = parseCorrelativo(a.correlativo).secuencial ?? -1;
  const bSec = parseCorrelativo(b.correlativo).secuencial ?? -1;
  if (aSec !== bSec) return bSec - aSec;

  if (a.correlativo !== b.correlativo) {
    return b.correlativo.localeCompare(a.correlativo);
  }

  return a.id.localeCompare(b.id);
}

function compareActivos(a: CorteConSucursal, b: CorteConSucursal): number {
  const tsDiff = activeActivityTimestamp(b) - activeActivityTimestamp(a);
  if (tsDiff !== 0) return tsDiff;
  return compareCorrelativoDesc(a, b);
}

function compareTerminales(a: CorteConSucursal, b: CorteConSucursal): number {
  const tsDiff = terminalActivityTimestamp(b) - terminalActivityTimestamp(a);
  if (tsDiff !== 0) return tsDiff;
  return compareCorrelativoDesc(a, b);
}

function compareActividadGlobal(a: CorteConSucursal, b: CorteConSucursal): number {
  const tsA = isTerminal(a) ? terminalActivityTimestamp(a) : activeActivityTimestamp(a);
  const tsB = isTerminal(b) ? terminalActivityTimestamp(b) : activeActivityTimestamp(b);
  const tsDiff = tsB - tsA;
  if (tsDiff !== 0) return tsDiff;
  return compareCorrelativoDesc(a, b);
}

export function buildSupervisorTodayViewModel(cortes: CorteConSucursal[]): SupervisorTodayViewModel {
  const activos = cortes.filter(isActivo).sort(compareActivos);
  const finalizados = cortes.filter(isTerminal).sort(compareTerminales);
  const ultimaActividad = [...activos, ...finalizados].sort(compareActividadGlobal)[0] ?? null;

  return {
    activos,
    finalizados,
    resumen: {
      total: cortes.length,
      activos: activos.length,
      finalizados: finalizados.length,
      ultimaActividad,
    },
  };
}
