// 🤖 [IA] - v1.2.6: Espaciados y anchos optimizados para Android sin overflow
// 🤖 [IA] - v1.0.96: Optimización responsive - Vista guiada con anchos adaptativos
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banknote, CreditCard, ChevronRight, Check, X, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { ConstructiveActionButton } from '@/components/ui/constructive-action-button';
import { DestructiveActionButton } from '@/components/ui/destructive-action-button';
import { NeutralActionButton } from '@/components/ui/neutral-action-button';
import { Input } from '@/components/ui/input';
import { DENOMINATIONS } from '@/types/cash';
import { formatCurrency } from '@/utils/calculations';
import { useInputValidation } from '@/hooks/useInputValidation';
import { useTimingConfig } from '@/hooks/useTimingConfig';
import { usePulseAnimation } from '@/hooks/useVisibleAnimation'; // 🤖 [IA] - v1.2.18: Optimización automática de animaciones
import { cn } from '@/lib/utils';
import '@/styles/features/guided-field-pulse.css';
import '@/styles/features/guided-confirm-button.css';
import '@/styles/features/guided-field-input-border.css';
import '@/styles/features/circular-coin-images.css';

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

  // 🤖 [IA] - v1.3.0: Eliminado manejo manual de touchend event - ahora se maneja por el onTouchStart del Button

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  // Obtener el ícono según el tipo
  const getIcon = () => {
    switch (currentFieldType) {
      case 'coin':
        // Determinar qué imagen de moneda mostrar basado en currentFieldName
        let coinImage = '/monedas-recortadas-dolares/moneda-centavo-front-inlay.webp';
        
        // Seleccionar la imagen correcta según el nombre del campo
        if (currentFieldName === 'nickel') {
          coinImage = '/monedas-recortadas-dolares/moneda-cinco-centavos.webp';
        } else if (currentFieldName === 'dime') {
          coinImage = '/monedas-recortadas-dolares/moneda-diez-centavos.webp';
        } else if (currentFieldName === 'quarter') {
          coinImage = '/monedas-recortadas-dolares/moneda-veinticinco-centavos.webp';
        }
        
        return (
          <img 
            src={coinImage}
            alt={`Moneda de ${currentFieldLabel}`}
            className="object-contain"
            style={{
              width: 'clamp(100px, 25vw, 150px)', // 🤖 [IA] - v1.2.26: Moneda 25% más grande para máxima visibilidad
              height: 'clamp(100px, 25vw, 150px)' // 🤖 [IA] - v1.2.26: Altura proporcional
            }}
          />
        );
      case 'bill':
        return <Banknote className="w-8 h-8 text-success" />;
      case 'electronic':
        return <CreditCard className="w-8 h-8 text-accent-primary" />;
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
        {/* Card principal del campo activo - Level 0 Opaque */}
        <div style={{
          backgroundColor: 'rgba(36, 36, 36, 1.0)', // 🤖 [IA] - v1.2.22: CONSTITUTIONAL FIX - Level 0 opaque background per Doctrine D.2
          border: `2px solid ${borderColor}`,
          borderRadius: 'clamp(12px, 3vw, 20px)', // 🤖 [IA] - v1.2.18: Responsive border-radius
          padding: 'clamp(12px, 3vw, 20px)', // 🤖 [IA] - v1.2.18: Responsive padding
          // 🤖 [IA] - v1.1.18: Sombra con tono dorado sutil para conteo matutino
          boxShadow: isMorningCount 
            ? `0 8px 32px rgba(244, 165, 42, 0.15), inset 0 1px 0 rgba(255, 184, 77, 0.2)`
            : `0 8px 32px rgba(10, 132, 255, 0.15), inset 0 1px 0 rgba(94, 92, 230, 0.2)`
        }}>
            {/* 🤖 [IA] - v1.2.24: Header optimizado con moneda más grande */}
            <div className="flex items-center justify-center" style={{
              marginBottom: 'clamp(16px, 3vw, 20px)',
              gap: 'clamp(16px, 4vw, 24px)' // 🤖 [IA] - v1.2.25: Gap más amplio para acomodar monedas grandes
            }}>
              {/* Información central */}
              <div className="text-center">
                <h3 className="font-bold capitalize tracking-wide" style={{
                  fontSize: 'clamp(20px, 4.5vw, 32px)', // 🤖 [IA] - v1.2.24: Texto más grande para equilibrio
                  marginBottom: 'clamp(4px, 1vw, 8px)',
                  background: currentFieldType === 'coin' ? 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)' :
                            currentFieldType === 'bill' ? 'linear-gradient(135deg, #00ba7c 0%, #06d6a0 100%)' :
                            gradientBg,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '0.05em', // 🤖 [IA] - v1.2.24: Espaciado elegante entre letras
                  textTransform: 'capitalize' // 🤖 [IA] - v1.2.24: Primera letra mayúscula
                }}>
                  {currentFieldLabel}
                </h3>
              </div>
              
              {/* Ícono más grande con gradiente según tipo */}
              <div 
                className={cn(
                  "flex items-center justify-center",
                  currentFieldType === 'coin' ? 'bg-gradient-to-br from-accent-primary via-accent-primary/80 to-accent-secondary' :
                  currentFieldType === 'bill' ? 'bg-gradient-to-br from-success via-success/80 to-success/60' :
                  isMorningCount
                    ? 'bg-gradient-to-br from-warning via-warning/80 to-warning/60'
                    : 'bg-gradient-to-br from-accent-primary via-accent-primary/80 to-accent-secondary'
                )}
                style={{
                  width: 'clamp(100px, 25vw, 150px)', // 🤖 [IA] - v1.2.26: Contenedor 25% más grande para máxima visibilidad
                  height: 'clamp(100px, 25vw, 150px)', // 🤖 [IA] - v1.2.26: Altura proporcional
                  borderRadius: 'clamp(20px, 5vw, 30px)' // 🤖 [IA] - v1.2.26: Border radius proporcional al nuevo tamaño
                }}
              >
                {getIcon()}
              </div>
            </div>

            {/* Input y confirmación optimizados */}
            <div className="space-y-3">
              {/* Input y botón integrados */}
              <div className="flex" style={{ gap: 'clamp(8px, 2vw, 16px)' }}>
                <div className="flex-1 relative">
                  {currentFieldType === 'electronic' && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary font-semibold z-10">
                      $
                    </span>
                  )}
                  <Input
                    ref={inputRef}
                    type="tel"  // 🤖 [IA] - v1.1.15: Cambiado de "text" a "tel" para mejor activación del teclado numérico
                    inputMode={getInputMode(currentFieldType === 'electronic' ? 'currency' : 'integer')}
                    pattern={getPattern(currentFieldType === 'electronic' ? 'currency' : 'integer')}
                    value={inputValue}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={handleKeyDown}
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
                      transition: 'all 0.3s ease'
                    } as React.CSSProperties}
                    className={cn(
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
                  className="btn-guided-confirm"
                  style={{
                    height: 'clamp(48px, 12vw, 56px)' // 🤖 [IA] - v1.2.19: Contextual height matching input for perfect alignment
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

              {/* 🤖 [IA] - v1.2.9: Barra de progreso segmentada por sección actual (monedas/billetes/electrónicos) - MOVIDA DENTRO DEL MODAL */}
              {(onCancel || onPrevious) && (
                <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-white/10">
                  {/* Cancel Button */}
                  {onCancel && (
                    <DestructiveActionButton
                      onClick={onCancel}
                      aria-label="Cancelar proceso y volver al inicio"
                      className="flex-1"
                    >
                      <X className="w-4 h-4" />
                      <span className="ml-2">Cancelar</span>
                    </DestructiveActionButton>
                  )}
                  
                  {/* Previous Button */}
                  {onPrevious && (
                    <NeutralActionButton
                      onClick={onPrevious}
                      disabled={!canGoPrevious}
                      aria-label="Retroceder al campo anterior"
                      className="flex-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span className="ml-2">Anterior</span>
                    </NeutralActionButton>
                  )}
                </div>
              )}
            </div>
        </div>

      </motion.div>
    </AnimatePresence>
  );
}