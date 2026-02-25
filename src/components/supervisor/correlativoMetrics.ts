import type { CorteConSucursal } from '@/hooks/useSupervisorQueries';

const CORRELATIVO_PARSE_REGEX =
  /^CORTE-(\d{4}-\d{2}-\d{2})-([A-Z])-(\d{3})(?:-A(\d+))?$/;
const ESTADOS_ACTIVOS = new Set(['INICIADO', 'EN_PROGRESO']);

export interface CorrelativoParseResult {
  valido: boolean;
  fecha: string | null;
  sucursalCodigo: string | null;
  secuencial: number | null;
  intento: number | null;
  correlativo: string;
}

export function parseCorrelativo(correlativo: string): CorrelativoParseResult {
  const match = CORRELATIVO_PARSE_REGEX.exec(correlativo);
  if (!match) {
    return {
      valido: false,
      fecha: null,
      sucursalCodigo: null,
      secuencial: null,
      intento: null,
      correlativo,
    };
  }

  return {
    valido: true,
    fecha: match[1],
    sucursalCodigo: match[2],
    secuencial: Number(match[3]),
    intento: match[4] ? Number(match[4]) : null,
    correlativo,
  };
}

export interface CorrelativoDashboardMetrics {
  maxSecuencialPorSucursal: Map<string, number>;
  atrasoPorCorteId: Map<string, number>;
  activosAtrasados: number;
}

export function buildCorrelativoDashboardMetrics(
  cortes: CorteConSucursal[],
): CorrelativoDashboardMetrics {
  const maxSecuencialPorSucursal = new Map<string, number>();
  for (const corte of cortes) {
    const parsed = parseCorrelativo(corte.correlativo);
    if (!parsed.valido || parsed.sucursalCodigo === null || parsed.secuencial === null) {
      continue;
    }

    const maxActual = maxSecuencialPorSucursal.get(parsed.sucursalCodigo) ?? 0;
    if (parsed.secuencial > maxActual) {
      maxSecuencialPorSucursal.set(parsed.sucursalCodigo, parsed.secuencial);
    }
  }

  const atrasoPorCorteId = new Map<string, number>();
  let activosAtrasados = 0;
  for (const corte of cortes) {
    const parsed = parseCorrelativo(corte.correlativo);
    if (!parsed.valido || parsed.sucursalCodigo === null || parsed.secuencial === null) {
      atrasoPorCorteId.set(corte.id, 0);
      continue;
    }

    const maxSucursal = maxSecuencialPorSucursal.get(parsed.sucursalCodigo) ?? parsed.secuencial;
    const atraso = ESTADOS_ACTIVOS.has(corte.estado)
      ? Math.max(0, maxSucursal - parsed.secuencial)
      : 0;
    atrasoPorCorteId.set(corte.id, atraso);
    if (atraso > 0) {
      activosAtrasados += 1;
    }
  }

  return {
    maxSecuencialPorSucursal,
    atrasoPorCorteId,
    activosAtrasados,
  };
}
