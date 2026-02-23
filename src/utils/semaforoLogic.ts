// 🤖 [IA] - Orden #1 DACC Dashboard Supervisor — TDD GREEN
// Función pura: determina el color de semáforo de un corte de caja.
// Reglas del Plan Arquitectónico §4 (sin dependencias externas):
//   Rojo:     |dif| > $10.00  O  tiene críticas  (prioridad absoluta)
//   Amarillo: $3.00 ≤ |dif| ≤ $10.00  O  tiene advertencias
//   Verde:    |dif| < $3.00  Y  sin críticas

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

/** Colores posibles del indicador semáforo de un corte. */
export type ColorSemaforo = 'verde' | 'amarillo' | 'rojo';

/** Parámetros de entrada para calcularSemaforo. */
export interface ParametrosSemaforo {
  /** Diferencia monetaria (totalContado − ventaEsperada). Puede ser negativo. */
  diferencia: number;
  /** Indica si la verificación ciega registró al menos una crítica. */
  tieneCriticasVerificacion: boolean;
  /** Indica si la verificación ciega registró al menos una advertencia. */
  tieneAdvertenciasVerificacion: boolean;
}

/** Resultado del cálculo del semáforo. */
export interface ResultadoSemaforo {
  /** Color determinado según reglas de prioridad. */
  color: ColorSemaforo;
  /** Explicación legible del factor decisivo. */
  razon: string;
}

// ---------------------------------------------------------------------------
// Función principal
// ---------------------------------------------------------------------------

/**
 * Calcula el color del semáforo para un corte de caja dado.
 *
 * @remarks Aplica prioridad estricta: Rojo > Amarillo > Verde.
 * Las críticas de verificación siempre producen Rojo sin importar la diferencia.
 *
 * @example
 * ```ts
 * calcularSemaforo({ diferencia: 1.50, tieneCriticasVerificacion: false, tieneAdvertenciasVerificacion: false })
 * // → { color: 'verde', razon: 'Diferencia dentro de rango verde ($1.50)' }
 * ```
 */
export function calcularSemaforo(params: ParametrosSemaforo): ResultadoSemaforo {
  const { diferencia, tieneCriticasVerificacion, tieneAdvertenciasVerificacion } = params;
  const absDif = Math.abs(diferencia);

  // ── Rojo (prioridad máxima) ──────────────────────────────────────────────
  if (tieneCriticasVerificacion) {
    return {
      color: 'rojo',
      razon: `Críticas de verificación detectadas (diferencia: $${absDif.toFixed(2)})`,
    };
  }

  if (absDif > 10) {
    return {
      color: 'rojo',
      razon: `Diferencia fuera de rango aceptable ($${absDif.toFixed(2)} > $10.00)`,
    };
  }

  // ── Amarillo ─────────────────────────────────────────────────────────────
  if (tieneAdvertenciasVerificacion) {
    return {
      color: 'amarillo',
      razon: `Advertencias de verificación detectadas (diferencia: $${absDif.toFixed(2)})`,
    };
  }

  if (absDif >= 3) {
    return {
      color: 'amarillo',
      razon: `Diferencia en rango de atención ($${absDif.toFixed(2)}: entre $3.00 y $10.00)`,
    };
  }

  // ── Verde ─────────────────────────────────────────────────────────────────
  return {
    color: 'verde',
    razon: `Diferencia dentro de rango verde ($${absDif.toFixed(2)} < $3.00)`,
  };
}
