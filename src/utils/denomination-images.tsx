// 🤖 [IA] - FASE 5 PASO 1: Utilidad centralizada para imágenes de denominaciones
// Reemplaza duplicación en Phase2VerificationSection.tsx, DeliveryFieldView.tsx, GuidedFieldView.tsx
// Root cause: getIconForDenomination() duplicado ~200 líneas (63 × 3 archivos)
// Solución: Single source of truth con lazy loading + async decoding

import type { CashCount } from '@/types/cash';

/**
 * Mapa de imágenes para cada denominación de efectivo
 *
 * @constant
 * @type {Record<keyof CashCount, string>}
 *
 * @remarks
 * - Rutas absolutas desde `/public/monedas-recortadas-dolares/`
 * - Formato WebP optimizado para performance
 * - 11 denominaciones totales: 5 monedas + 6 billetes
 *
 * @example
 * ```typescript
 * const pennyImage = DENOMINATION_IMAGE_MAP.penny;
 * // => '/monedas-recortadas-dolares/penny.webp'
 * ```
 */
export const DENOMINATION_IMAGE_MAP: Record<keyof CashCount, string> = {
  penny: '/monedas-recortadas-dolares/moneda-centavo-front-inlay.webp',
  nickel: '/monedas-recortadas-dolares/moneda-cinco-centavos-dos-caras.webp',
  dime: '/monedas-recortadas-dolares/dime.webp',
  quarter: '/monedas-recortadas-dolares/moneda-25-centavos-dos-caras.webp',
  dollarCoin: '/monedas-recortadas-dolares/dollar-coin.webp',
  bill1: '/monedas-recortadas-dolares/billete-1.webp',
  bill5: '/monedas-recortadas-dolares/billete-5.webp',
  bill10: '/monedas-recortadas-dolares/billete-10.webp',
  bill20: '/monedas-recortadas-dolares/billete-20.webp',
  bill50: '/monedas-recortadas-dolares/billete-50.webp',
  bill100: '/monedas-recortadas-dolares/billete-100.webp'
};

/**
 * Genera elemento img para una denominación con estilos responsive
 *
 * @param denominationKey - Key de CashCount (ej: 'penny', 'bill1')
 * @param label - Label de la denominación para alt text accesibilidad
 * @param className - Clases CSS opcionales para el img (default: tamaño responsive)
 *
 * @returns React element `<img>` o null si denominación inválida
 *
 * @remarks
 * - Lazy loading automático para performance (loading="lazy")
 * - Async decoding para no bloquear renderizado (decoding="async")
 * - Type-safe con `keyof CashCount` garantiza denominaciones válidas
 * - Console.warn si denominación no encontrada (debugging)
 *
 * @example
 * ```typescript
 * // Uso básico con tamaño responsive default
 * getDenominationImageElement('penny', 'Un centavo')
 * // => <img src="/monedas-recortadas-dolares/moneda-centavo-front-inlay.webp" alt="Un centavo" ... />
 *
 * // Con className custom
 * getDenominationImageElement('bill1', 'Billete de un dólar', 'w-8 h-8')
 * // => <img src="..." className="w-8 h-8" ... />
 * ```
 *
 * @see {@link DENOMINATION_IMAGE_MAP} para rutas disponibles
 */
export function getDenominationImageElement(
  denominationKey: keyof CashCount,
  label: string,
  className: string = "w-[clamp(1.5rem,6vw,2rem)] h-[clamp(1.5rem,6vw,2rem)] object-contain"
): React.ReactNode {
  const imageSrc = DENOMINATION_IMAGE_MAP[denominationKey];

  if (!imageSrc) {
    console.warn(`[getDenominationImageElement] No image found for denomination: ${denominationKey}`);
    return null;
  }

  return (
    <img
      src={imageSrc}
      alt={label}
      className={className}
      loading="lazy"
      decoding="async"
    />
  );
}
