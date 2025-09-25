// 🤖 [IA] - v1.2.24: Componente DeliveryFieldView - Armonización arquitectónica con GuidedFieldView
// Reutiliza la arquitectura visual canónica de Phase 1 para Phase 2 delivery
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Check, X, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';
import { DestructiveActionButton } from '@/components/shared/DestructiveActionButton';
import { NeutralActionButton } from '@/components/ui/neutral-action-button';
import { Input } from '@/components/ui/input';
import { DENOMINATIONS } from '@/types/cash';
import { formatCurrency } from '@/utils/calculations';
import { useInputValidation } from '@/hooks/useInputValidation';
import { useTimingConfig } from '@/hooks/useTimingConfig';
import { usePulseAnimation } from '@/hooks/useVisibleAnimation';
import { cn } from '@/lib/utils';
// 🤖 [IA] - FAE-02: PURGA QUIRÚRGICA COMPLETADA - CSS imports eliminados
// Los 4 archivos CSS están ahora importados globalmente vía index.css:
// - guided-field-pulse.css
// - guided-confirm-button.css
// - guided-field-input-border.css
// - circular-coin-images.css

interface DeliveryFieldViewProps {
  currentFieldName: string;
  currentFieldLabel: string;
  currentFieldValue: number;
  targetQuantity: number;
  currentFieldType: 'coin' | 'bill';
  isActive: boolean;
  isCompleted: boolean;
  onConfirm: (value: string) => void;
  onCancel?: () => void;
  onPrevious?: () => void;
  canGoPrevious?: boolean;
}

// Función para convertir labels a texto descriptivo
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

export function DeliveryFieldView({
  currentFieldName,
  currentFieldLabel,
  currentFieldValue,
  targetQuantity,
  currentFieldType,
  isActive,
  isCompleted,
  onConfirm,
  onCancel,
  onPrevious,
  canGoPrevious = false
}: DeliveryFieldViewProps) {

  // Phase 2 always uses evening colors (blue gradient)
  const borderColor = 'var(--accent-primary)';
  const isMorningCount = false;

  const { shouldAnimate, isVisible } = usePulseAnimation(isActive);

  // Evening gradient for Phase 2
  const gradientBg = 'linear-gradient(135deg, #0066cc 0%, #0a84ff 45%, #5e5ce6 100%)';

  const [inputValue, setInputValue] = useState(
    currentFieldValue > 0 ? currentFieldValue.toString() : ''
  );
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { validateInput } = useInputValidation();
  const { createTimeoutWithCleanup } = useTimingConfig();

  // Calculate denomination value from DENOMINATIONS
  const getDenominationValue = () => {
    const allDenominations = {
      ...DENOMINATIONS.COINS,
      ...DENOMINATIONS.BILLS
    };

    return allDenominations[currentFieldName as keyof typeof allDenominations]?.value || 0;
  };

  const denominationValue = getDenominationValue();

  // Detect PWA standalone mode
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone) ||
                        document.referrer.includes('android-app://');
      setIsStandalone(standalone);
    };
    checkStandalone();
  }, []);

  // Auto-focus when field becomes active
  useEffect(() => {
    if (isActive && inputRef.current) {
      const focusDelay = isStandalone ? 300 : 100;

      const cleanup = createTimeoutWithCleanup(() => {
        inputRef.current?.focus();
        if (isStandalone) {
          inputRef.current?.click();
        }
        inputRef.current?.select();
      }, 'focus', `delivery_focus_${currentFieldName}`, focusDelay);

      return cleanup;
    }
  }, [isActive, currentFieldName, createTimeoutWithCleanup, isStandalone]);

  // Update input value when field becomes active
  useEffect(() => {
    if (isActive) {
      if (currentFieldValue > 0) {
        setInputValue(currentFieldValue.toString());
      } else if (!isCompleted) {
        setInputValue('');
      }
    }
  }, [currentFieldName, isActive, isCompleted, currentFieldValue]);

  const handleInputChange = (value: string) => {
    if (isActive) {
      const validation = validateInput(value, 'integer');
      if (validation.isValid) {
        setInputValue(validation.cleanValue);
        setShowError(false);
      }
    }
  };

  const handleConfirm = useCallback(() => {
    const inputNum = parseInt(inputValue) || 0;
    if (isActive && inputValue !== '' && inputNum === targetQuantity) {
      onConfirm(inputValue);
      setShowError(false);

      if (inputRef.current) {
        inputRef.current.focus();
      }
    } else if (inputNum !== targetQuantity) {
      setShowError(true);
    }
  }, [isActive, inputValue, targetQuantity, onConfirm]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  // Get denomination image - reuse Phase 1 logic
  const getIcon = () => {
    switch (currentFieldType) {
      case 'coin': {
        let coinImage = '/monedas-recortadas-dolares/moneda-centavo-front-inlay.webp';

        if (currentFieldName === 'nickel') {
          coinImage = '/monedas-recortadas-dolares/moneda-cinco-centavos-dos-caras.webp';
        } else if (currentFieldName === 'dime') {
          coinImage = '/monedas-recortadas-dolares/moneda-diez-centavos.webp';
        } else if (currentFieldName === 'quarter') {
          coinImage = '/monedas-recortadas-dolares/moneda-25-centavos-dos-caras.webp';
        } else if (currentFieldName === 'dollar' || currentFieldName === 'dollarCoin') {
          coinImage = '/monedas-recortadas-dolares/moneda-un-dollar-nueva.webp';
        }

        return (
          <img
            src={coinImage}
            alt={`Moneda de ${currentFieldLabel}`}
            className="object-contain"
            style={{
              width: 'clamp(234.375px, 58.59vw, 390.625px)',
              aspectRatio: '2.4 / 1'
            }}
          />
        );
      }
      case 'bill': {
        let billImage = '/monedas-recortadas-dolares/billete-1.webp';

        // Estándar canónico: solo verificar identificador único
        if (currentFieldName === 'bill1') {
          billImage = '/monedas-recortadas-dolares/billete-1.webp';
        } else if (currentFieldName === 'bill5') {
          billImage = '/monedas-recortadas-dolares/billete-5.webp';
        } else if (currentFieldName === 'bill10') {
          billImage = '/monedas-recortadas-dolares/billete-10.webp';
        } else if (currentFieldName === 'bill20') {
          billImage = '/monedas-recortadas-dolares/billete-20.webp';
        } else if (currentFieldName === 'bill50') {
          billImage = '/monedas-recortadas-dolares/billete-cincuenta-dolares-sobre-fondo-blanco(1).webp';
        } else if (currentFieldName === 'bill100') {
          billImage = '/monedas-recortadas-dolares/billete-100.webp';
        }

        return (
          <img
            src={billImage}
            alt={`Billete de ${currentFieldLabel}`}
            className="object-contain w-full h-full"
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
            <div className="flex items-center gap-4">
              <Check className="w-14 h-14 text-success flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-success">
                  ✅ Entregado
                </h3>
                <div className="space-y-1">
                  <p className="text-muted-foreground">
                    {currentFieldLabel}: {targetQuantity} unidades separadas
                  </p>
                  {denominationValue > 0 && (
                    <p className="text-success font-bold">
                      Total: {formatCurrency(targetQuantity * denominationValue)}
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
        {/* Glass morphism panel using canonical class */}
        <div className={cn(
          "glass-morphism-panel p-0 relative",
          "border-2 border-primary/30"
        )}>
          {/* Content Section */}
          <div className="p-[clamp(12px,3vw,20px)] pb-32">
            {/* Header with delivery instruction */}
            <div className="text-center mb-[clamp(16px,4vw,24px)]">
              {/* Denomination image */}
              <div
                className="flex items-center justify-center mx-auto"
                style={{
                  width: 'clamp(234.375px, 58.59vw, 390.625px)',
                  aspectRatio: '2.4 / 1',
                  borderRadius: 'clamp(23.44px, 5.86vw, 35.16px)',
                  backgroundColor: 'transparent'
                }}
              >
                {getIcon()}
              </div>

              <div className="glass-status-error inline-block px-4 py-2 rounded-lg mt-4">
                <p className="text-sm font-semibold" style={{ color: '#f4212e' }}>
                  {'📤\u00A0\u00A0ENTREGAR '}
                  <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.6em' }}>{targetQuantity}</span>
                </p>
              </div>

              {/* Etiqueta de denominación descriptiva */}
              <div className="mt-2">
                <span className="text-xs text-white/70 font-medium">
                  {getDenominationDescription(currentFieldName, currentFieldLabel)}
                </span>
              </div>
            </div>

            {/* Input and confirmation */}
            <div>
              <div className="flex items-center" style={{ gap: 'clamp(8px, 2vw, 16px)' }}>
                <div className="flex-1 relative">
                  <Input
                    ref={inputRef}
                    type="text"  // 🤖 [IA] - v3.1.0: Unificado a "text" para teclado decimal consistente
                    inputMode="decimal"  // 🤖 [IA] - v3.1.0: Forzar teclado decimal en todos los casos
                    pattern="[0-9]*[.,]?[0-9]*"  // 🤖 [IA] - v3.1.0: Acepta punto y coma para Android
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoCapitalize="off"
                    autoCorrect="off"
                    autoComplete="off"
                    placeholder="0"
                    style={{
                      borderColor: showError ? 'var(--danger)' : 'var(--accent-primary)',
                      fontSize: 'clamp(18px, 4vw, 24px)',
                      fontWeight: 'bold',
                      height: 'clamp(48px, 12vw, 56px)',
                      textAlign: 'center',
                      paddingLeft: 'clamp(14px, 3vw, 20px)',
                      paddingRight: 'clamp(14px, 3vw, 20px)',
                      transition: 'all 0.3s ease'
                    } as React.CSSProperties}
                    className={cn(
                      "focus:neon-glow-primary",
                      shouldAnimate && "guided-field-pulse-evening",
                      !isVisible && "animation-paused"
                    )}
                    autoFocus
                  />
                  {parseInt(inputValue) !== targetQuantity && inputValue && (
                    <div className="absolute -bottom-6 left-0 right-0 text-center">
                      <span className="text-xs text-destructive">
                        Debe ingresar exactamente {targetQuantity}
                      </span>
                    </div>
                  )}
                </div>
                <ConstructiveActionButton
                  onClick={handleConfirm}
                  disabled={!inputValue || parseInt(inputValue) !== targetQuantity}
                  data-size="default"
                  onTouchStart={(e) => e.preventDefault()}
                  aria-label="Confirmar cantidad separada"
                  className="btn-guided-confirm"
                  style={{
                    height: 'clamp(48px, 12vw, 56px)'
                  }}
                >
                  Confirmar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </ConstructiveActionButton>
              </div>

              {/* Success indicator */}
              {inputValue && parseInt(inputValue) === targetQuantity && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mt-2 flex justify-start"
                >
                  <div className="flex items-center gap-1 text-xs text-success">
                    <Check className="w-3 h-3" />
                    <span>Cantidad correcta</span>
                  </div>
                </motion.div>
              )}

              {/* Error message */}
              {showError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 bg-destructive/10 border border-destructive/30 rounded-lg p-3"
                >
                  <p className="text-destructive text-sm">
                    ⚠️ Debe separar exactamente {targetQuantity} {currentFieldLabel.toLowerCase()}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Navigation footer - matching Phase 1 */}
          {(onCancel || onPrevious) && (
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 border-t border-white/10 p-4 bg-black/20 backdrop-blur-sm">
              {onCancel && (
                <DestructiveActionButton
                  onClick={onCancel}
                  aria-label="Cancelar entrega y volver"
                >
                  Cancelar
                </DestructiveActionButton>
              )}

              {onPrevious && (
                <NeutralActionButton
                  onClick={onPrevious}
                  disabled={!canGoPrevious}
                  aria-label="Denominación anterior"
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
