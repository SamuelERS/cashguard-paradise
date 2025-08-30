// 🤖 [IA] - v1.2.6: Espaciados y anchos optimizados para Android sin overflow
// 🤖 [IA] - v1.0.96: Optimización responsive - Vista guiada con anchos adaptativos
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, Coins, CreditCard, ChevronRight, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DENOMINATIONS } from '@/types/cash';
import { formatCurrency } from '@/utils/calculations';
import { useInputValidation } from '@/hooks/useInputValidation';
import { useTimingConfig } from '@/hooks/useTimingConfig';
import { usePulseAnimation } from '@/hooks/useVisibleAnimation'; // 🤖 [IA] - v1.2.18: Optimización automática de animaciones
import { cn } from '@/lib/utils';
import '@/styles/features/guided-field-pulse.css';
import '@/styles/features/guided-field-confirm-button.css';
import '@/styles/features/guided-field-input-border.css';

interface GuidedFieldViewProps {
  currentFieldName: string;
  currentFieldLabel: string;
  currentFieldValue: number;
  currentFieldType: 'coin' | 'bill' | 'electronic';
  isActive: boolean;
  isCompleted: boolean;
  onConfirm: (value: string) => void;
  currentStep: number;
  totalSteps: number;
  completedFields: Array<{ name: string; quantity: number; total: number }>;
  isMorningCount?: boolean;
}

export function GuidedFieldView({
  currentFieldName,
  currentFieldLabel,
  currentFieldValue,
  currentFieldType,
  isActive,
  isCompleted,
  onConfirm,
  currentStep,
  totalSteps,
  completedFields,
  isMorningCount = false
}: GuidedFieldViewProps) {
  // 🤖 [IA] - v1.1.18: Paleta de colores enriquecida para evitar monotonía
  const primaryColor = isMorningCount ? '#f4a52a' : '#0a84ff';
  const secondaryColor = isMorningCount ? '#ffb84d' : '#5e5ce6';
  const tertiaryColor = isMorningCount ? '#ff9500' : '#4a90e2'; // Naranja medio / Azul medio
  const accentColor = isMorningCount ? '#ffd93d' : '#7c3aed'; // Amarillo sol / Púrpura
  const darkAccent = isMorningCount ? '#e67e22' : '#0066cc'; // Naranja oscuro / Azul oscuro
  
  const borderColor = isMorningCount ? 'rgba(244, 165, 42, 0.3)' : 'rgba(10, 132, 255, 0.3)';
  
  // 🤖 [IA] - v1.2.18: Hook optimizado para controlar animación automáticamente
  const { shouldAnimate, isVisible, elementRef } = usePulseAnimation(isActive);
  const borderColorLight = isMorningCount ? 'rgba(244, 165, 42, 0.15)' : 'rgba(10, 132, 255, 0.15)';
  const borderColorSolid = isMorningCount ? 'rgba(244, 165, 42, 0.1)' : 'rgba(10, 132, 255, 0.1)';
  const focusGlow = isMorningCount ? 'rgba(244, 165, 42, 0.25)' : 'rgba(10, 132, 255, 0.25)';
  
  // Gradientes más ricos con 3 tonos
  const gradientBg = isMorningCount 
    ? 'linear-gradient(135deg, #e67e22 0%, #f4a52a 45%, #ffb84d 100%)'
    : 'linear-gradient(135deg, #0066cc 0%, #0a84ff 45%, #5e5ce6 100%)';
  const gradientBgLight = isMorningCount
    ? 'linear-gradient(135deg, rgba(230, 126, 34, 0.1), rgba(244, 165, 42, 0.1), rgba(255, 184, 77, 0.1))'
    : 'linear-gradient(135deg, rgba(0, 102, 204, 0.1), rgba(10, 132, 255, 0.1), rgba(94, 92, 230, 0.1))';

  // 🤖 [IA] - v1.2.19: MEJORADO - Siempre inicializar con el valor actual para permitir edición
  const [inputValue, setInputValue] = useState(
    currentFieldValue > 0 ? currentFieldValue.toString() : ''
  );
  const [showError, setShowError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  const { validateInput, getPattern, getInputMode } = useInputValidation();
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
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
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

  // Configurar touchend event para prevenir cierre de teclado móvil
  useEffect(() => {
    if (isActive && buttonRef.current) {
      const button = buttonRef.current;
      
      const handleTouchEnd = (e: TouchEvent) => {
        e.preventDefault(); // 🤖 [IA] - v1.1.17: preventDefault crítico para mantener focus y teclado abierto
        handleConfirm();
      };

      button.addEventListener('touchend', handleTouchEnd, { passive: false });
      
      return () => {
        button.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isActive, handleConfirm]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  // Obtener el ícono según el tipo
  const getIcon = () => {
    switch (currentFieldType) {
      case 'coin':
        return <Coins className="w-8 h-8 text-warning" />;
      case 'bill':
        return <Banknote className="w-8 h-8 text-success" />;
      case 'electronic':
        return <CreditCard className="w-8 h-8 text-accent-primary" />;
      default:
        return null;
    }
  };

  // Calcular el total acumulado
  const accumulatedTotal = completedFields.reduce((sum, field) => sum + field.total, 0);

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
        {/* Card principal del campo activo con Glass Effect Premium */}
        <div style={{
          backgroundColor: 'rgba(36, 36, 36, 0.4)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `2px solid ${borderColor}`,
          borderRadius: 'clamp(12px, 3vw, 20px)', // 🤖 [IA] - v1.2.18: Responsive border-radius
          padding: 'clamp(12px, 3vw, 20px)', // 🤖 [IA] - v1.2.18: Responsive padding
          // 🤖 [IA] - v1.1.18: Sombra con tono dorado sutil para conteo matutino
          boxShadow: isMorningCount 
            ? `0 8px 32px rgba(244, 165, 42, 0.15), inset 0 1px 0 rgba(255, 184, 77, 0.2)`
            : `0 8px 32px rgba(10, 132, 255, 0.15), inset 0 1px 0 rgba(94, 92, 230, 0.2)`
        }}>
            {/* 🤖 [IA] - v1.0.95: Header con indicador de sección */}
            <div className="flex items-center justify-between" style={{ marginBottom: 'clamp(12px, 2.5vw, 16px)' }}>
              {/* Ícono con gradiente según tipo */}
              <div 
                className={cn(
                  "flex items-center justify-center shadow-lg",
                  currentFieldType === 'coin' ? 'bg-gradient-to-br from-warning via-warning/80 to-warning/60' :
                  currentFieldType === 'bill' ? 'bg-gradient-to-br from-success via-success/80 to-success/60' :
                  isMorningCount 
                    ? 'bg-gradient-to-br from-warning via-warning/80 to-warning/60'
                    : 'bg-gradient-to-br from-accent-primary via-accent-primary/80 to-accent-secondary'
                )}
                style={{
                  width: 'clamp(40px, 10vw, 56px)', // 🤖 [IA] - v1.2.18: Responsive width
                  height: 'clamp(40px, 10vw, 56px)', // 🤖 [IA] - v1.2.18: Responsive height
                  borderRadius: 'clamp(8px, 2vw, 12px)' // 🤖 [IA] - v1.2.18: Responsive border-radius
                }}
              >
                {currentFieldType === 'coin' ? (
                  <span className="text-white font-bold" style={{ fontSize: 'clamp(16px, 4vw, 24px)' }}>¢</span>
                ) : currentFieldType === 'bill' ? (
                  <span className="text-white font-bold" style={{ fontSize: 'clamp(16px, 4vw, 24px)' }}>$</span>
                ) : (
                  <CreditCard className="text-white" style={{ width: 'clamp(20px, 5vw, 28px)', height: 'clamp(20px, 5vw, 28px)' }} />
                )}
              </div>
              {/* Información central */}
              <div className="flex-1 mx-3">
                <h3 className="font-bold" style={{
                  fontSize: 'clamp(18px, 4.5vw, 28px)', // 🤖 [IA] - v1.2.18: Responsive font-size
                  marginBottom: 'clamp(4px, 1vw, 8px)', // 🤖 [IA] - v1.2.18: Responsive margin
                  background: currentFieldType === 'coin' ? 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)' :
                            currentFieldType === 'bill' ? 'linear-gradient(135deg, #00ba7c 0%, #06d6a0 100%)' :
                            gradientBg,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {currentFieldLabel}
                </h3>
                {/* 🤖 [IA] - v1.2.7: Valor unitario ocultado para sistema anti-fraude */}
              </div>
              
              {/* Badge de sección mejorado con íconos y mayor prominencia */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg" style={{
                // 🤖 [IA] - v1.2.9: Badge único más prominente sin indicador redundante
                backgroundColor: currentFieldType === 'coin' ? 
                  (isMorningCount ? 'rgba(230, 126, 34, 0.2)' : 'rgba(244, 165, 42, 0.2)') :
                  currentFieldType === 'bill' ? 'rgba(0, 186, 124, 0.2)' :
                  'rgba(10, 132, 255, 0.15)',
                border: currentFieldType === 'coin' ? 
                  (isMorningCount ? '1px solid rgba(230, 126, 34, 0.5)' : '1px solid rgba(244, 165, 42, 0.4)') :
                  currentFieldType === 'bill' ? '1px solid rgba(0, 186, 124, 0.4)' :
                  `1px solid ${borderColor}`,
                color: currentFieldType === 'coin' ? 
                  (isMorningCount ? darkAccent : '#f4a52a') :
                  currentFieldType === 'bill' ? '#00ba7c' :
                  primaryColor
              }}>
                {currentFieldType === 'coin' ? <Coins className="h-4 w-4" /> :
                 currentFieldType === 'bill' ? <Banknote className="h-4 w-4" /> :
                 <CreditCard className="h-4 w-4" />}
                <span className="text-sm font-semibold">
                  {currentFieldType === 'coin' ? 'Monedas' :
                   currentFieldType === 'bill' ? 'Billetes' :
                   'Pagos Electrónicos'}
                </span>
              </div>
            </div>

            {/* Input y confirmación optimizados */}
            <div className="space-y-3">
              {/* Label compacto */}
              <label className="text-sm font-medium text-text-secondary block">
                {currentFieldType === 'electronic' ? 'Monto total:' : 'Cantidad:'}
              </label>
              
              {/* Input y botón integrados */}
              <div className="flex" style={{ gap: 'clamp(8px, 2vw, 16px)' }}>
                <div className="flex-1 relative">
                  {currentFieldType === 'electronic' && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-semibold z-10">
                      $
                    </span>
                  )}
                  <Input
                    ref={(node) => {
                      // Combinar refs: inputRef + elementRef para IntersectionObserver
                      if (inputRef && 'current' in inputRef) inputRef.current = node;
                      if (elementRef && 'current' in elementRef) elementRef.current = node;
                    }}
                    type="tel"  // 🤖 [IA] - v1.1.15: Cambiado de "text" a "tel" para mejor activación del teclado numérico
                    inputMode={getInputMode(currentFieldType === 'electronic' ? 'currency' : 'integer')}
                    pattern={getPattern(currentFieldType === 'electronic' ? 'currency' : 'integer')}
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyPress={handleKeyPress}
                    autoCapitalize="off"  // Prevenir capitalización en iOS
                    autoCorrect="off"     // Desactivar autocorrección
                    autoComplete="off"    // Desactivar autocompletado
                    placeholder={currentFieldType === 'electronic' ? '0.00' : '0'}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: `2px solid ${borderColor}`,
                      borderRadius: 'clamp(8px, 2vw, 12px)',
                      fontSize: 'clamp(18px, 4vw, 24px)', // 🤖 [IA] - v1.2.18: Responsive font-size - mínimo más grande para móviles
                      fontWeight: 'bold',
                      height: 'clamp(48px, 12vw, 56px)', // 🤖 [IA] - v1.2.18: Responsive height - vw mejor para móviles
                      textAlign: 'center',
                      paddingLeft: currentFieldType === 'electronic' ? 'clamp(36px, 6vw, 48px)' : 'clamp(14px, 3vw, 20px)', // 🤖 [IA] - v1.2.18: Responsive padding - ajustar mínimos
                      paddingRight: 'clamp(14px, 3vw, 20px)', // 🤖 [IA] - v1.2.18: Responsive padding right - aumentar mínimo
                      // 🤖 [IA] - v1.1.18: Override del ring azul con color dinámico
                      '--tw-ring-color': isMorningCount ? '#f4a52a' : '#0a84ff',
                      boxShadow: inputValue ? `0 0 0 3px ${focusGlow}` : 'none',
                      transition: 'all 0.3s ease'
                    } as React.CSSProperties}
                    className={cn(
                      "focus:outline-none",
                      shouldAnimate && (isMorningCount ? "guided-field-pulse-morning" : "guided-field-pulse-evening"),
                      !isVisible && "animation-paused" // 🤖 [IA] - Pausar cuando no es visible
                    )}
                    autoFocus // 🤖 [IA] - v1.1.17: autoFocus necesario para mantener teclado entre campos
                  />
                </div>
                <Button
                  ref={buttonRef}
                  onClick={handleConfirm}
                  disabled={!inputValue}
                  style={{
                    border: 'none',
                    borderRadius: 'clamp(8px, 2vw, 12px)', // 🤖 [IA] - v1.2.18: Responsive border-radius
                    height: 'clamp(48px, 12vw, 56px)', // 🤖 [IA] - v1.2.18: Responsive height to match input - vw mejor para móviles
                    padding: '0 clamp(12px, 3vw, 24px)', // 🤖 [IA] - v1.2.18: Responsive padding - reducir mínimo para más espacio
                    fontSize: 'clamp(14px, 3vw, 18px)', // 🤖 [IA] - v1.2.18: Responsive font-size - reducir de 3.5vw a 3vw
                    fontWeight: 'bold',
                    minWidth: 'clamp(100px, 25vw, 140px)', // 🤖 [IA] - v1.2.18: Min-width para evitar compresión en móviles
                    transition: 'all 0.3s'
                  }}
                  className="guided-field-confirm-button text-white shadow-lg"
                  onTouchStart={(e) => e.preventDefault()} // 🤖 [IA] - v1.1.17: preventDefault para mantener focus
                >
                  Confirmar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
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

              {/* 🤖 [IA] - v1.2.9: Barra de progreso segmentada por sección actual (monedas/billetes/electrónicos) - MOVIDA DENTRO DEL MODAL */}
              {(() => {
                // Determinar campos de la sección actual usando los nombres correctos que vienen en completedFields
                const coinFields = ['1¢ centavo', '5¢ centavos', '10¢ centavos', '25¢ centavos', '$1 moneda'];
                const billFields = ['$1', '$5', '$10', '$20', '$50', '$100'];
                const electronicFields = ['Credomatic', 'Promerica', 'Transferencia Bancaria', 'PayPal'];
                
                let sectionFields: string[] = [];
                let sectionName = '';
                let sectionIcon = null;
                
                if (currentFieldType === 'coin') {
                  sectionFields = coinFields;
                  sectionName = 'Monedas';
                  sectionIcon = <Coins className="h-3 w-3" />;
                } else if (currentFieldType === 'bill') {
                  sectionFields = billFields;
                  sectionName = 'Billetes';
                  sectionIcon = <Banknote className="h-3 w-3" />;
                } else if (currentFieldType === 'electronic') {
                  sectionFields = electronicFields;
                  sectionName = 'Pagos Electrónicos';
                  sectionIcon = <CreditCard className="h-3 w-3" />;
                }
                
                // Calcular progreso de la sección actual
                const completedInSection = completedFields.filter(field => 
                  sectionFields.includes(field.name)
                ).length;
                const totalInSection = sectionFields.length;
                const sectionProgress = totalInSection > 0 ? (completedInSection / totalInSection) * 100 : 0;
                
                // Solo mostrar si hay una sección válida
                if (sectionFields.length > 0) {
                  return (
                    <div className="px-3 my-4">
                      {/* Barra de progreso primero - más prominente */}
                      <div className="h-1 bg-black/40 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-300"
                          style={{ 
                            width: `${sectionProgress}%`,
                            background: isMorningCount 
                              ? 'linear-gradient(90deg, #f4a52a, #ffb84d)'
                              : 'linear-gradient(90deg, #0a84ff, #5e5ce6)'
                          }}
                        />
                      </div>
                      
                      {/* Texto centrado debajo de la barra */}
                      <div className="flex justify-center items-center gap-2 mt-2">
                        <span className="flex items-center gap-1 text-xs" style={{ color: isMorningCount ? '#f4a52a' : '#0a84ff' }}>
                          {sectionIcon}
                          <span className="font-medium">{sectionName}:</span>
                          <span className="text-gray-400">{completedInSection} de {totalInSection}</span>
                        </span>
                      </div>
                    </div>
                  );
                }
                
                return null;
              })()}
            </div>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}