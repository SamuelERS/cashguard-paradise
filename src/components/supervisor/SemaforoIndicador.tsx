// 🤖 [IA] - Orden #3 DACC Dashboard Supervisor — SemaforoIndicador
// Componente puro de presentación: círculo de color según reglas §4 del plan arquitectónico.
// Sin estado, sin efectos, sin dependencias externas (solo el type ColorSemaforo).

import type { ColorSemaforo } from '@/utils/semaforoLogic';

// ---------------------------------------------------------------------------
// Tipos públicos
// ---------------------------------------------------------------------------

export interface SemaforoIndicadorProps {
  /** Color determinado por calcularSemaforo(). */
  color: ColorSemaforo;
  /** Razón textual para tooltip y aria-label (opcional). */
  razon?: string;
  /** Tamaño del indicador (default: 'md'). */
  size?: 'sm' | 'md' | 'lg';
}

// ---------------------------------------------------------------------------
// Constantes
// ---------------------------------------------------------------------------

const COLOR_CLASES: Record<ColorSemaforo, string> = {
  verde: 'bg-green-500 shadow-green-500/50',
  amarillo: 'bg-yellow-400 shadow-yellow-400/50',
  rojo: 'bg-red-500 shadow-red-500/50',
};

const COLOR_ARIA: Record<ColorSemaforo, string> = {
  verde: 'Verde — dentro de parámetros normales',
  amarillo: 'Amarillo — requiere revisión',
  rojo: 'Rojo — requiere acción inmediata',
};

const TAMAÑO_CLASES: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'h-3 w-3',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
};

// ---------------------------------------------------------------------------
// Componente
// ---------------------------------------------------------------------------

/**
 * Indicador visual de semáforo para un corte de caja.
 *
 * @example
 * ```tsx
 * const { color, razon } = calcularSemaforo({ diferencia: 2, ... });
 * <SemaforoIndicador color={color} razon={razon} size="md" />
 * ```
 */
export function SemaforoIndicador({ color, razon, size = 'md' }: SemaforoIndicadorProps) {
  const etiqueta = razon ?? COLOR_ARIA[color];

  return (
    <div
      role="img"
      aria-label={etiqueta}
      title={etiqueta}
      className={[
        'rounded-full flex-shrink-0 shadow-md',
        TAMAÑO_CLASES[size],
        COLOR_CLASES[color],
      ].join(' ')}
    />
  );
}
