// 🤖 [IA] - v1.2.6: Espaciados y anchos optimizados para Android sin overflow
// 🤖 [IA] - v1.0.96: Optimización responsive - Vista guiada con anchos adaptativos
import { useState, useRef, useEffect, useCallback } from 'react';
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
import { cn } from '@/lib/utils';

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

  const [inputValue, setInputValue] = useState(isCompleted ? currentFieldValue.toString() : '');
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
  const totalValue = parseInt(inputValue || '0') * denominationValue;
  
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

  // 🤖 [IA] - v1.1.16: Limpiar valor cuando cambia el campo activo
  useEffect(() => {
    if (isActive && !isCompleted) {
      setInputValue('');
    }
  }, [currentFieldName, isActive, isCompleted]);

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
          borderRadius: '16px',
          padding: '14px',
          // 🤖 [IA] - v1.1.18: Sombra con tono dorado sutil para conteo matutino
          boxShadow: isMorningCount 
            ? `0 8px 32px rgba(244, 165, 42, 0.15), inset 0 1px 0 rgba(255, 184, 77, 0.2)`
            : `0 8px 32px rgba(10, 132, 255, 0.15), inset 0 1px 0 rgba(94, 92, 230, 0.2)`
        }}>
            {/* 🤖 [IA] - v1.0.95: Header con indicador de sección */}
            <div className="flex items-center justify-between mb-3">
              {/* Ícono con gradiente según tipo */}
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center shadow-lg",
                currentFieldType === 'coin' ? 'bg-gradient-to-br from-warning via-warning/80 to-warning/60' :
                currentFieldType === 'bill' ? 'bg-gradient-to-br from-success via-success/80 to-success/60' :
                isMorningCount 
                  ? 'bg-gradient-to-br from-warning via-warning/80 to-warning/60'
                  : 'bg-gradient-to-br from-accent-primary via-accent-primary/80 to-accent-secondary'
              )}>
                {currentFieldType === 'coin' ? (
                  <span className="text-white font-bold text-xl">¢</span>
                ) : currentFieldType === 'bill' ? (
                  <span className="text-white font-bold text-xl">$</span>
                ) : (
                  <CreditCard className="w-6 h-6 text-white" />
                )}
              </div>
              {/* Información central */}
              <div className="flex-1 mx-3">
                <h3 className="text-xl font-bold mb-1" style={{
                  background: currentFieldType === 'coin' ? 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)' :
                            currentFieldType === 'bill' ? 'linear-gradient(135deg, #00ba7c 0%, #06d6a0 100%)' :
                            gradientBg,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  {currentFieldLabel}
                </h3>
                {denominationValue > 0 && (
                  <p className="text-xs text-text-secondary">
                    Valor unitario: {formatCurrency(denominationValue)}
                  </p>
                )}
              </div>
              
              {/* Badge de progreso con indicador de sección */}
              <div className="flex flex-col items-end gap-1">
                <div className="px-2.5 py-1 rounded-full text-xs font-medium" style={{
                  // 🤖 [IA] - v1.1.18: Badge de sección con tono más oscuro para contraste
                  backgroundColor: currentFieldType === 'coin' ? 
                    (isMorningCount ? 'rgba(230, 126, 34, 0.15)' : 'rgba(244, 165, 42, 0.15)') :
                    currentFieldType === 'bill' ? 'rgba(0, 186, 124, 0.15)' :
                    borderColorLight,
                  border: currentFieldType === 'coin' ? 
                    (isMorningCount ? '1px solid rgba(230, 126, 34, 0.4)' : '1px solid rgba(244, 165, 42, 0.3)') :
                    currentFieldType === 'bill' ? '1px solid rgba(0, 186, 124, 0.3)' :
                    `1px solid ${borderColor}`,
                  color: currentFieldType === 'coin' ? 
                    (isMorningCount ? darkAccent : '#f4a52a') :
                    currentFieldType === 'bill' ? '#00ba7c' :
                    primaryColor
                }}>
                  {currentFieldType === 'coin' ? 'Monedas' :
                   currentFieldType === 'bill' ? 'Billetes' :
                   'Electrónicos'}
                </div>
                <div className="px-2.5 py-1 rounded-full" style={{
                  // 🤖 [IA] - v1.1.18: Badge de progreso con amarillo dorado distintivo
                  backgroundColor: isMorningCount ? 'rgba(255, 217, 61, 0.15)' : borderColorLight,
                  border: isMorningCount ? `1px solid ${accentColor}` : `1px solid ${borderColor}`,
                  transition: 'all 0.3s ease'
                }}>
                  <span className="text-xs font-semibold" style={{ 
                    color: isMorningCount ? darkAccent : primaryColor 
                  }}>
                    {currentStep}/{totalSteps}
                  </span>
                </div>
              </div>
            </div>

            {/* Input y confirmación optimizados */}
            <div className="space-y-3">
              {/* Label compacto */}
              <label className="text-sm font-medium text-text-secondary block">
                {currentFieldType === 'electronic' ? 'Monto total:' : 'Cantidad:'}
              </label>
              
              {/* Input y botón integrados */}
              <div className="flex gap-2">
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
                    onKeyPress={handleKeyPress}
                    autoCapitalize="off"  // Prevenir capitalización en iOS
                    autoCorrect="off"     // Desactivar autocorrección
                    autoComplete="off"    // Desactivar autocompletado
                    placeholder={currentFieldType === 'electronic' ? '0.00' : '0'}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: `2px solid ${borderColor}`,
                      borderRadius: '10px',
                      fontSize: '20px',
                      fontWeight: 'bold',
                      height: '48px',
                      textAlign: 'center',
                      paddingLeft: currentFieldType === 'electronic' ? '40px' : '16px',
                      // 🤖 [IA] - v1.1.18: Override del ring azul con color dinámico
                      '--tw-ring-color': isMorningCount ? '#f4a52a' : '#0a84ff',
                      boxShadow: inputValue ? `0 0 0 3px ${focusGlow}` : 'none',
                      transition: 'all 0.3s ease'
                    }}
                    className="focus:outline-none"
                    autoFocus // 🤖 [IA] - v1.1.17: autoFocus necesario para mantener teclado entre campos
                  />
                </div>
                <Button
                  ref={buttonRef}
                  onClick={handleConfirm}
                  disabled={!inputValue}
                  style={{
                    background: inputValue ? gradientBg : 'rgba(128, 128, 128, 0.3)',
                    border: 'none',
                    borderRadius: '10px',
                    height: '48px',
                    padding: '0 20px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    transition: 'all 0.3s'
                  }}
                  className="text-white shadow-lg"
                  onTouchStart={(e) => e.preventDefault()} // 🤖 [IA] - v1.1.17: preventDefault para mantener focus
                >
                  Confirmar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              {/* Mostrar valor total calculado con animación elegante */}
              <AnimatePresence>
                {inputValue && denominationValue > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    style={{
                      background: gradientBgLight,
                      border: `1px solid ${borderColor}`,
                      borderRadius: '10px',
                      padding: '10px',
                      textAlign: 'center'
                    }}
                  >
                    <p className="text-base font-semibold" style={{ color: primaryColor }}>
                      Total: <span className="text-xl font-bold">{formatCurrency(totalValue)}</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

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

        {/* 🤖 [IA] - v1.0.95: Resumen de campos completados mejorado para desktop */}
        <Card className="glass-card" style={{
          backgroundColor: 'rgba(36, 36, 36, 0.5)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 186, 124, 0.3)',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0, 186, 124, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}>
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-success">
                ✓ Campos Completados
              </h4>
              <Badge variant="outline" className="border-success text-success text-center min-w-[100px]">
                Total: {formatCurrency(accumulatedTotal)}
              </Badge>
            </div>
            {/* 🤖 [IA] - v1.0.95: Grid optimizado para mejor visualización en desktop */}
            {completedFields.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {completedFields.map((field, index) => (
                  <motion.div
                    key={`${field.name}-${index}`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2 p-2 rounded-lg bg-success/10 text-success text-sm"
                  >
                    <Check className="w-3 h-3" />
                    <span className="truncate">
                      {/* 🤖 [IA] - v1.0.49: Formato homogéneo y descriptivo para todas las denominaciones */}
                      {(() => {
                        const name = field.name;
                        
                        // Pagos electrónicos: "Nombre: $monto"
                        if (field.quantity === 1 && !name.includes('¢') && !name.includes('$')) {
                          return `${name}: ${formatCurrency(field.total)}`;
                        }
                        
                        // Billetes: "cantidad x $valor billete"
                        if (name.startsWith('$') && !name.includes('moneda')) {
                          return `${field.quantity}x ${name} billete`;
                        }
                        
                        // Monedas con centavos (ya incluidos en el nombre)
                        if (name.includes('¢')) {
                          return `${field.quantity}x ${name}`;
                        }
                        
                        // $1 moneda
                        if (name.includes('moneda')) {
                          return `${field.quantity}x ${name}`;
                        }
                        
                        // Default (no debería llegar aquí)
                        return `${field.quantity}x ${name}`;
                      })()}
                    </span>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Esperando primer ingreso...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Instrucciones adicionales */}
        <Card className="glass-card bg-muted/20">
          <CardContent className="py-3">
            <p className="text-xs text-center text-muted-foreground">
              💡 Complete cada campo en orden. No podrá retroceder ni modificar valores confirmados.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}