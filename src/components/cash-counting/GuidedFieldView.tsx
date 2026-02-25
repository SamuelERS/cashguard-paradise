// 🤖 [IA] - v1.2.6: Espaciados y anchos optimizados para Android sin overflow
// 🤖 [IA] - v1.0.96: Optimización responsive - Vista guiada con anchos adaptativos
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, X, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';
import { DestructiveActionButton } from '@/components/shared/DestructiveActionButton';
import { NeutralActionButton } from '@/components/ui/neutral-action-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label'; // 🤖 [IA] - v1.2.35: Accessibility labels
import { DENOMINATIONS } from '@/types/cash';
import { DENOMINATION_IMAGE_MAP } from '@/utils/denomination-images';
import { formatCurrency } from '@/utils/calculations';
import { useInputValidation } from '@/hooks/useInputValidation';
import { useTimingConfig } from '@/hooks/useTimingConfig';
import { usePulseAnimation } from '@/hooks/useVisibleAnimation'; // 🤖 [IA] - v1.2.18: Optimización automática de animaciones
import { FIELD_LABELS } from '@/hooks/useGuidedCounting'; // 🤖 [IA] - v1.2.35: Accessibility labels
import { cn } from '@/lib/utils';
// 🤖 [IA] - FAE-02: PURGA QUIRÚRGICA COMPLETADA - CSS imports eliminados
// Los 4 archivos CSS están ahora importados globalmente vía index.css:
// - guided-field-pulse.css
// - guided-confirm-button.css
// - guided-field-input-border.css
// - circular-coin-images.css

interface GuidedFieldViewProps {
  currentFieldName: string;
  currentFieldLabel: string;
  currentFieldValue: number;
  currentFieldType: 'coin' | 'bill' | 'electronic';
  isActive: boolean;
  isCompleted: boolean;
  onConfirm: (value: string) => void;
  isMorningCount?: boolean;
  // 🤖 [IA] - v1.2.23: Navigation functions moved inside modal for mobile space optimization
  onCancel?: () => void;
  onPrevious?: () => void;
  canGoPrevious?: boolean;
}

// 🤖 [IA] - v1.2.24: Función para convertir labels a texto descriptivo
const getDenominationDescription = (fieldName: string, fieldLabel: string): string => {
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
};

export function GuidedFieldView({
  currentFieldName,
  currentFieldLabel,
  currentFieldValue,
  currentFieldType,
  isActive,
  isCompleted,
  onConfirm,
  isMorningCount = false,
  // 🤖 [IA] - v1.2.23: Navigation functions moved inside modal
  onCancel,
  onPrevious,
  canGoPrevious = false
}: GuidedFieldViewProps) {
  
  const borderColor = isMorningCount ? 'rgba(244, 165, 42, 0.3)' : 'rgba(10, 132, 255, 0.3)';
  
  // 🤖 [IA] - v1.2.18: Hook optimizado para controlar animación automáticamente
  const { shouldAnimate, isVisible } = usePulseAnimation(isActive);
  
  // Gradientes más ricos con 3 tonos
  const gradientBg = isMorningCount 
    ? 'linear-gradient(135deg, #e67e22 0%, #f4a52a 45%, #ffb84d 100%)'
    : 'linear-gradient(135deg, #0066cc 0%, #0a84ff 45%, #5e5ce6 100%)';

  // 🤖 [IA] - v1.2.19: MEJORADO - Siempre inicializar con el valor actual para permitir edición
  const [inputValue, setInputValue] = useState(
    currentFieldValue > 0 ? currentFieldValue.toString() : ''
  );
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 🤖 [IA] - v1.2.35: Generate unique ID for label-input association (WCAG 2.1)
  const inputId = `input-${currentFieldName}`;

  const { validateInput } = useInputValidation();
  const { createTimeoutWithCleanup } = useTimingConfig();

  // Calcular el valor de la denominación actual
  const getDenominationValue = () => {
    if (currentFieldType === 'electronic') return 0;
    
    const allDenominations = {
      ...DENOMINATIONS.COINS,
      ...DENOMINATIONS.BILLS
    };
    
    return allDenominations[currentFieldName as keyof typeof allDenominations]?.value || 0;
  };

  const denominationValue = getDenominationValue();
  // 🤖 [IA] - v1.2.7: totalValue removido para sistema anti-fraude
  
  // 🤖 [IA] - v1.1.16: Detectar si la app está en modo PWA standalone
  const [isStandalone, setIsStandalone] = useState(false);
  
  useEffect(() => {
    // Detectar PWA standalone mode
    const checkStandalone = () => {
      const standalone = window.matchMedia?.('(display-mode: standalone)')?.matches ||
                        (window.navigator as { standalone?: boolean }).standalone ||
                        document.referrer.includes('android-app://');
      setIsStandalone(standalone);
    };
    checkStandalone();
  }, []);

  // Auto-focus cuando el campo se activa
  useEffect(() => {
    if (isActive && inputRef.current) {
      // 🤖 [IA] - v1.1.16: Delay mayor para PWA standalone
      const focusDelay = isStandalone ? 300 : 100;
      
      const cleanup = createTimeoutWithCleanup(() => {
        inputRef.current?.focus();
        // En PWA, hacer click programático puede ayudar
        if (isStandalone) {
          inputRef.current?.click();
        }
        inputRef.current?.select();
      }, 'focus', `mobile_focus_${currentFieldName}`, focusDelay);
      
      return cleanup;
    }
  }, [isActive, currentFieldName, createTimeoutWithCleanup, isStandalone]);

  // 🤖 [IA] - v1.2.19: MEJORADO - Preservar valores existentes al activar campo para edición
  useEffect(() => {
    if (isActive) {
      // Si hay un valor previo, mostrarlo. Si no, limpiar
      if (currentFieldValue > 0) {
        setInputValue(currentFieldValue.toString());
      } else if (!isCompleted) {
        setInputValue('');
      }
    }
  }, [currentFieldName, isActive, isCompleted, currentFieldValue]);

  const handleInputChange = (value: string) => {
    if (isActive) {
      const validationType = currentFieldType === 'electronic' ? 'currency' : 'integer';
      const validation = validateInput(value, validationType);
      if (validation.isValid) {
        setInputValue(validation.cleanValue);
        setShowError(false);
      }
    }
  };

  const handleConfirm = useCallback(() => {
    if (isActive && inputValue !== '') {
      onConfirm(inputValue);
      // 🤖 [IA] - v1.1.16: No limpiar input inmediatamente para evitar re-render
      // El siguiente campo limpiará su propio valor
      setShowError(false);
      
      // 🤖 [IA] - v1.1.16: Mantener focus en el input para que el teclado no se cierre
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  }, [isActive, inputValue, onConfirm]);

  // 🤖 [IA] - v1.3.0: Eliminado manejo manual de touchend event - ahora se maneja por el onTouchStart del Button

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  // Obtener el ícono según el tipo
  const getIcon = () => {
    switch (currentFieldType) {
      case 'coin': {
        // 🤖 [IA] - OT #079: Migrado a DENOMINATION_IMAGE_MAP (SSOT) — eliminada duplicación
        const denomKey = (currentFieldName === 'dollar' ? 'dollarCoin' : currentFieldName) as keyof typeof DENOMINATION_IMAGE_MAP;
        const coinImage = DENOMINATION_IMAGE_MAP[denomKey] ?? DENOMINATION_IMAGE_MAP.penny;

        return (
            <img
              src={coinImage}
              alt={`Moneda de ${currentFieldLabel}`}
              className="object-contain"
              style={{
                width: 'clamp(180px, 42vw, 300px)',
                aspectRatio: '2.4 / 1' // 🤖 [IA] - v1.3.0: Proporción rectangular como billetes
              }}
              onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
            />
        );
      }
      case 'bill': {
        // 🤖 [IA] - OT #079: Migrado a DENOMINATION_IMAGE_MAP (SSOT) — eliminada duplicación
        const billImage = DENOMINATION_IMAGE_MAP[currentFieldName as keyof typeof DENOMINATION_IMAGE_MAP] ?? DENOMINATION_IMAGE_MAP.bill1;

        return (
          <img
            src={billImage}
            alt={`Billete de ${currentFieldLabel}`}
            className="object-contain w-full h-full"
            onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
          />
        );
      }
      case 'electronic': {
        // 🤖 [IA] - v1.2.28: Detección de tipo de pago electrónico para mostrar logo correspondiente
        const getElectronicLogo = () => {
          switch (currentFieldName) {
            case 'credomatic':
              return {
                src: "/monedas-recortadas-dolares/bac-logo.webp",
                alt: "BAC Credomatic"
              };
            case 'promerica':
              return {
                src: "/monedas-recortadas-dolares/banco promerica logo.png",
                alt: "Banco Promerica"
              };
            case 'bankTransfer':
              return {
                src: "/monedas-recortadas-dolares/transferencia-bancaria.png", // 🤖 [IA] - v1.2.28: Logo específico para transferencias bancarias
                alt: "Transferencia Bancaria"
              };
            case 'paypal':
              return {
                src: "/monedas-recortadas-dolares/paypal-logo.png", // 🤖 [IA] - v1.2.28: Logo oficial de PayPal
                alt: "PayPal"
              };
            default:
              return {
                src: "/monedas-recortadas-dolares/bac-logo.webp",
                alt: "Pago Electrónico"
              };
          }
        };

        const electronicLogo = getElectronicLogo();
        return (
          <img
            src={electronicLogo.src}
            alt={electronicLogo.alt}
            className="object-contain w-full h-full"
            style={{
              maxWidth: currentFieldName === 'promerica' ? '95%' : '90%',  // 🤖 [IA] - v1.2.28: Promerica más grande para igualar tamaño visual
              maxHeight: currentFieldName === 'promerica' ? '95%' : '90%'
            }}
          />
        );
      }
      default:
        return null;
    }
  };


  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-3 max-w-md mx-auto sm:max-w-2xl lg:max-w-3xl"
      >
        <Card className="glass-card border-success/30">
          <CardContent className="py-5">
            {/* Layout horizontal para campo completado con mejor manejo de texto */}
            <div className="flex items-center gap-4">
              <Check className="w-14 h-14 text-success flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-success">
                  Campo Completado
                </h3>
                <div className="space-y-1">
                  <p className="text-muted-foreground">
                    {currentFieldLabel}: {currentFieldValue} unidades
                  </p>
                  {denominationValue > 0 && (
                    <p className="text-success font-bold">
                      Total: {formatCurrency(currentFieldValue * denominationValue)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentFieldName}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="space-y-3 max-w-md mx-auto sm:max-w-2xl lg:max-w-3xl"
      >
        {/* 🤖 [IA] - v1.2.25: Modal container with glass morphism canonical class */}
        <div className={cn(
          "glass-morphism-panel p-0 relative", // 🤖 [IA] - v1.2.26: Added relative for absolute footer positioning
          isMorningCount
            ? "border-2 border-warning/30"
            : "border-2 border-primary/30"
        )}>
          {/* Content Section */}
          <div className="p-[clamp(12px,2.5vw,18px)] pb-4">
            {/* 🤖 [IA] - v1.2.24: Header optimizado con moneda más grande */}
            <div className="flex items-center justify-center" style={{
              marginBottom: 'clamp(16px, 3vw, 20px)',
              gap: 'clamp(16px, 4vw, 24px)' // 🤖 [IA] - v1.2.25: Gap más amplio para acomodar monedas grandes
            }}>
              {/* Texto eliminado para todas las denominaciones - 🤖 [IA] - v1.3.0 */}

              {/* Ícono más grande con gradiente según tipo */}
              <div
                className={cn(
                  "flex items-center justify-center",
                  (currentFieldType === 'coin' || currentFieldType === 'bill') ? 'bg-gradient-to-br from-accent-primary via-accent-primary/80 to-accent-secondary' :
                  isMorningCount
                    ? 'bg-gradient-to-br from-warning via-warning/80 to-warning/60'
                    : 'bg-gradient-to-br from-accent-primary via-accent-primary/80 to-accent-secondary'
                )}
                style={{
                  width: 'clamp(180px, 42vw, 300px)',
                  aspectRatio: '2.4 / 1', // 🤖 [IA] - v1.3.0: Proporción de billete
                  borderRadius: 'clamp(16px, 3.8vw, 24px)'
                }}
              >
                {getIcon()}
              </div>
            </div>

            {/* 🤖 [IA] - v1.2.24: Etiqueta de denominación descriptiva */}
            {(currentFieldType === 'coin' || currentFieldType === 'bill') && (
              <div className="text-center mb-4">
                <span className="text-xs text-white/70 font-medium" aria-hidden="true">
                  {getDenominationDescription(currentFieldName, currentFieldLabel)}
                </span>
              </div>
            )}

            {/* Input y confirmación optimizados */}
            <div>
              {/* Input y botón integrados */}
              <div className="cashcounter-field-row flex items-center" style={{ gap: 'clamp(8px, 2vw, 16px)' }}>
                <div className="cashcounter-field-input-wrap flex-1 relative">
                  {/* 🤖 [IA] - v1.2.35: Accessible label for screen readers (WCAG 2.1) */}
                  <Label
                    htmlFor={inputId}
                    className="sr-only"
                  >
                    {FIELD_LABELS[currentFieldName] || currentFieldLabel}
                  </Label>

                  {currentFieldType === 'electronic' && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-semibold z-10">
                      $
                    </span>
                  )}
                  <Input
                    id={inputId}
                    ref={inputRef}
                    type="text"  // 🤖 [IA] - v3.1.0: Unificado a "text" para teclado decimal consistente
                    inputMode="decimal"  // 🤖 [IA] - v3.1.0: Forzar teclado decimal en todos los casos
                    pattern="[0-9]*[.,]?[0-9]*"  // 🤖 [IA] - v3.1.0: Acepta punto y coma para Android
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoCapitalize="off"  // Prevenir capitalización en iOS
                    autoCorrect="off"     // Desactivar autocorrección
                    autoComplete="off"    // Desactivar autocompletado
                    aria-describedby={`${inputId}-description`}
                    placeholder={
                      currentFieldType === 'electronic'
                        ? '0.00'
                        : 'Ingresa la cantidad'
                    } // 🤖 [IA] - v1.2.51: Placeholder descriptivo coherente con Phase2VerificationSection
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: `2px solid ${borderColor}`,
                      borderRadius: 'clamp(8px, 2vw, 12px)',
                      fontSize: 'clamp(16px, 3vw, 20px)',
                      fontWeight: 'bold',
                      height: 'clamp(44px, 6vw, 52px)',
                      textAlign: 'center',
                      paddingLeft: currentFieldType === 'electronic' ? 'clamp(36px, 6vw, 48px)' : 'clamp(14px, 3vw, 20px)', // 🤖 [IA] - v1.2.18: Responsive padding - ajustar mínimos
                      paddingRight: 'clamp(14px, 3vw, 20px)', // 🤖 [IA] - v1.2.18: Responsive padding right - aumentar mínimo
                      transition: 'all 0.3s ease'
                    } as React.CSSProperties}
                    className={cn(
                      "cashcounter-field-input",
                      // 🤖 [IA] - v1.2.22: CONSTITUTIONAL FIX - Doctrinal neon-glow implementation per Doctrine D.4
                      isMorningCount ? "focus:neon-glow-morning" : "focus:neon-glow-primary",
                      shouldAnimate && (isMorningCount ? "guided-field-pulse-morning" : "guided-field-pulse-evening"),
                      !isVisible && "animation-paused" // 🤖 [IA] - Pausar cuando no es visible
                    )}
                    autoFocus // 🤖 [IA] - v1.1.17: autoFocus necesario para mantener teclado entre campos
                  />
                </div>
                <ConstructiveActionButton
                  onClick={handleConfirm}
                  disabled={!inputValue}
                  data-size="default"
                  onTouchStart={(e) => e.preventDefault()} // 🤖 [IA] - v1.1.17: preventDefault para mantener focus
                  aria-label="Confirmar cantidad ingresada"
                  className="btn-guided-confirm cashcounter-field-confirm"
                  style={{
                    height: 'clamp(44px, 6vw, 52px)'
                  }}
                >
                  Confirmar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </ConstructiveActionButton>
              </div>

              {/* 🤖 [IA] - v1.2.7: Indicador minimalista sin valores monetarios (anti-fraude) */}
              {inputValue && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-2 flex justify-start"
                >
                  <div className="flex items-center gap-1 text-xs opacity-50">
                    <Check className="w-3 h-3" />
                    <span>Cantidad registrada</span>
                  </div>
                </motion.div>
              )}

              {/* Mensaje de error si es necesario */}
              {showError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-destructive/10 border border-destructive/30 rounded-lg p-3"
                >
                  <p className="text-destructive text-sm">
                    ⚠️ Por favor ingrese un valor válido
                  </p>
                </motion.div>
              )}

            </div>
          </div>

          {/* Footer de navegación */}
          {(onCancel || onPrevious) && (
            <div className="mt-4 flex items-center justify-center gap-3 border-t border-white/10 p-4 bg-black/20">
              {/* Cancel Button */}
              {onCancel && (
                <DestructiveActionButton
                  onClick={onCancel}
                  aria-label="Cancelar proceso y volver al inicio"
                >
                  Cancelar
                </DestructiveActionButton>
              )}

              {/* Previous Button */}
              {onPrevious && (
                <NeutralActionButton
                  onClick={onPrevious}
                  disabled={!canGoPrevious}
                  aria-label="Retroceder al campo anterior"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="ml-2">Anterior</span>
                </NeutralActionButton>
              )}
            </div>
          )}
        </div>

      </motion.div>
    </AnimatePresence>
  );
}
