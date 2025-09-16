// 🤖 [IA] - v1.2.31: OPERACIÓN SIMETRÍA - Utilidad compartida para imágenes de denominaciones
// Principio DRY I.3: Lógica extraída y refactorizada para uso en Phase2DeliverySection y Phase2VerificationSection

export interface DenominationImageProps {
  fieldName: string;
  fieldLabel?: string;
  fieldType: 'coin' | 'bill';
  size?: 'small' | 'medium' | 'large';
}

/**
 * Obtiene la ruta de imagen correcta para una denominación específica
 */
export const getDenominationImage = (fieldName: string, fieldLabel?: string, fieldType?: 'coin' | 'bill'): string => {
  // Detección automática del tipo si no se proporciona
  const coinTypes = ['penny', 'nickel', 'dime', 'quarter', 'dollarCoin'];
  const isCoins = fieldType === 'coin' || coinTypes.includes(fieldName);

  if (isCoins) {
    // Mapeo de monedas
    switch (fieldName) {
      case 'nickel':
        return '/monedas-recortadas-dolares/moneda-cinco-centavos-dos-caras.webp';
      case 'dime':
        return '/monedas-recortadas-dolares/moneda-diez-centavos.webp';
      case 'quarter':
        return '/monedas-recortadas-dolares/moneda-25-centavos-dos-caras.webp';
      case 'dollar':
      case 'dollarCoin':
        return '/monedas-recortadas-dolares/moneda-un-dollar-nueva.webp';
      case 'penny':
      default:
        return '/monedas-recortadas-dolares/moneda-centavo-front-inlay.webp';
    }
  } else {
    // Mapeo de billetes con detección flexible
    if (fieldName === 'five' || fieldName === '$5' ||
        fieldLabel?.includes('5') || fieldLabel?.includes('$5')) {
      return '/monedas-recortadas-dolares/billete-5.webp';
    } else if (fieldName === 'ten' || fieldName === '$10' ||
        fieldLabel?.includes('10') || fieldLabel?.includes('$10')) {
      return '/monedas-recortadas-dolares/billete-10.webp';
    } else if (fieldName === 'twenty' || fieldName === '$20' ||
        fieldLabel?.includes('20') || fieldLabel?.includes('$20')) {
      return '/monedas-recortadas-dolares/billete-20.webp';
    } else if (fieldName === 'fifty' || fieldName === '$50' ||
        fieldName === 'billete50' || fieldLabel?.toLowerCase().includes('50') ||
        fieldLabel?.toLowerCase().includes('cincuenta') ||
        (fieldLabel && /\$?50/.test(fieldLabel)) ||
        fieldLabel === 'Billete de $50') {
      return '/monedas-recortadas-dolares/billete-cincuenta-dolares-sobre-fondo-blanco(1).webp';
    } else if (fieldName === 'hundred' || fieldName === '$100' ||
        fieldName === 'billete100' || fieldLabel?.toLowerCase().includes('100') ||
        (fieldLabel && /\$?100/.test(fieldLabel)) ||
        fieldLabel === 'Billete de $100') {
      return '/monedas-recortadas-dolares/billete-100.webp';
    } else {
      // Default para billetes de $1
      return '/monedas-recortadas-dolares/billete-1.webp';
    }
  }
};

/**
 * Componente de imagen de denominación con estilos consistentes
 * UTILITY-FIRST: Usa las mismas clases de Tailwind que han demostrado funcionar
 */
export const DenominationImage: React.FC<DenominationImageProps> = ({
  fieldName,
  fieldLabel,
  fieldType,
  size = 'medium'
}) => {
  const imageSrc = getDenominationImage(fieldName, fieldLabel, fieldType);

  // Tamaños consistentes con DeliveryFieldView
  const sizeClasses = {
    small: {
      width: 'clamp(80px, 20vw, 120px)',
      aspectRatio: '2.4 / 1'
    },
    medium: {
      width: 'clamp(234.375px, 58.59vw, 390.625px)',
      aspectRatio: '2.4 / 1'
    },
    large: {
      width: '100%',
      aspectRatio: '2.4 / 1'
    }
  };

  const sizeStyle = sizeClasses[size];
  const altText = fieldType === 'coin'
    ? `Moneda de ${fieldLabel || fieldName}`
    : `Billete de ${fieldLabel || fieldName}`;

  return (
    <img
      src={imageSrc}
      alt={altText}
      className="object-contain"
      style={sizeStyle}
    />
  );
};