// 🤖 [IA] - Desmonolitado desde Phase2VerificationSection.tsx
// Helpers puros para verificación de denominaciones

/**
 * Convierte field names técnicos a descripciones en español
 * @param fieldName - Key de CashCount (ej: 'penny', 'bill1')
 * @param fieldLabel - Label original como fallback
 * @returns Descripción legible en español
 */
export function getDenominationDescription(fieldName: string, fieldLabel: string): string {
  const descriptions: Record<string, string> = {
    'penny': 'Un centavo',
    'nickel': 'Cinco centavos',
    'dime': 'Diez centavos',
    'quarter': 'Veinticinco centavos',
    'dollarCoin': 'Moneda de un dólar',
    'bill1': 'Billete de un dólar',
    'bill5': 'Billete de cinco dólares',
    'bill10': 'Billete de diez dólares',
    'bill20': 'Billete de veinte dólares',
    'bill50': 'Billete de cincuenta dólares',
    'bill100': 'Billete de cien dólares'
  };
  return descriptions[fieldName] || fieldLabel;
}

/**
 * Bandera para mostrar/ocultar montos durante verificación ciega
 * true = DESARROLLO (montos visibles para debugging)
 * false = PRODUCCIÓN (conteo ciego anti-fraude completo)
 */
export const SHOW_REMAINING_AMOUNTS = false;
