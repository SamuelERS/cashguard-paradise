// 🤖 [IA] - v1.2.12: Modal responsivo con sistema de escala proporcional
import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Info, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface GuidedInstructionsModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  isMorningCount?: boolean;
}

export function GuidedInstructionsModal({ 
  isOpen, 
  onConfirm,
  isMorningCount = false 
}: GuidedInstructionsModalProps) {
  const [understood, setUnderstood] = useState(false);
  
  // 🤖 [IA] - Sistema de escala proporcional v1.2.12
  const viewportScale = useMemo(() => {
    if (typeof window !== 'undefined') {
      return Math.min(window.innerWidth / 430, 1);
    }
    return 1;
  }, []);
  
  // 🤖 [IA] - Colores dinámicos según el modo
  const primaryColor = isMorningCount ? '#f4a52a' : '#0a84ff';
  const secondaryColor = isMorningCount ? '#ffb84d' : '#5e5ce6';
  const gradientBg = isMorningCount 
    ? 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)'
    : 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)';
  
  const handleConfirm = () => {
    if (understood) {
      // Guardar en sessionStorage para esta sesión específica
      const sessionKey = `guided-instructions-acknowledged-${Date.now()}`;
      sessionStorage.setItem('guided-instructions-session', sessionKey);
      onConfirm();
    }
  };

  // Reset checkbox cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setUnderstood(false);
    }
  }, [isOpen]);

  const instructions = [
    {
      icon: <Info className="w-5 h-5" />,
      title: "Proceso Secuencial",
      description: "Complete cada campo en orden. No podrá retroceder ni modificar valores confirmados."
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Sin Modificaciones",
      description: "Una vez confirmado un valor, quedará bloqueado permanentemente."
    },
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      title: "No Abandone la Página",
      description: "Si abandona la página, deberá reiniciar el conteo desde el principio."
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="w-[95vw] max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto border-0 p-0"
        style={{
          backgroundColor: 'rgba(36, 36, 36, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header con gradiente - Responsive */}
        <div 
          style={{
            padding: `clamp(16px, ${20 * viewportScale}px, 24px)`,
            paddingBottom: 0,
            background: gradientBg,
            borderRadius: '16px 16px 0 0'
          }}
        >
          <DialogHeader>
            <DialogTitle 
              className="font-bold text-white flex items-center"
              style={{
                fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
                gap: 'clamp(6px, 1.5vw, 8px)'
              }}
            >
              <Shield style={{ width: 'clamp(20px, 5vw, 24px)', height: 'clamp(20px, 5vw, 24px)' }} />
              Instrucciones del Conteo Guiado
            </DialogTitle>
            <DialogDescription 
              className="text-white/80"
              style={{
                fontSize: 'clamp(0.813rem, 3.25vw, 0.938rem)',
                marginTop: 'clamp(6px, 1.5vw, 8px)'
              }}
            >
              Por favor lea atentamente antes de continuar
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Contenido - Responsive */}
        <div 
          style={{
            padding: `clamp(16px, ${20 * viewportScale}px, 24px)`,
            gap: `clamp(12px, ${16 * viewportScale}px, 16px)`,
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Instrucciones - Responsive */}
          <div style={{ gap: `clamp(10px, ${12 * viewportScale}px, 12px)`, display: 'flex', flexDirection: 'column' }}>
            {instructions.map((instruction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex rounded-lg"
                style={{
                  gap: `clamp(10px, ${12 * viewportScale}px, 12px)`,
                  padding: `clamp(12px, ${16 * viewportScale}px, 16px)`,
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div 
                  className="flex-shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    width: `clamp(32px, ${40 * viewportScale}px, 40px)`,
                    height: `clamp(32px, ${40 * viewportScale}px, 40px)`,
                    background: `linear-gradient(135deg, ${primaryColor}22, ${secondaryColor}22)`,
                    border: `1px solid ${primaryColor}44`
                  }}
                >
                  <div style={{ 
                    color: primaryColor,
                    width: `clamp(16px, ${20 * viewportScale}px, 20px)`,
                    height: `clamp(16px, ${20 * viewportScale}px, 20px)`
                  }}>
                    {React.cloneElement(instruction.icon, {
                      style: { width: '100%', height: '100%' }
                    })}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 
                    className="font-semibold text-white"
                    style={{
                      fontSize: 'clamp(0.875rem, 3.5vw, 1rem)',
                      marginBottom: `clamp(2px, ${4 * viewportScale}px, 4px)`
                    }}
                  >
                    {instruction.title}
                  </h4>
                  <p 
                    className="text-gray-400"
                    style={{
                      fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
                      lineHeight: 1.4
                    }}
                  >
                    {instruction.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Checkbox de confirmación - Responsive */}
          <div 
            className="rounded-lg flex items-center cursor-pointer"
            style={{
              marginTop: `clamp(16px, ${24 * viewportScale}px, 24px)`,
              padding: `clamp(12px, ${16 * viewportScale}px, 16px)`,
              gap: `clamp(10px, ${12 * viewportScale}px, 12px)`,
              backgroundColor: understood ? `${primaryColor}11` : 'rgba(255, 255, 255, 0.03)',
              border: understood ? `2px solid ${primaryColor}44` : '2px solid rgba(255, 255, 255, 0.1)',
              transition: 'all 0.3s ease'
            }}
            onClick={() => setUnderstood(!understood)}
          >
            <Checkbox
              checked={understood}
              onCheckedChange={(checked) => setUnderstood(checked as boolean)}
              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              style={{
                borderColor: understood ? primaryColor : 'rgba(255, 255, 255, 0.3)',
                width: `clamp(14px, ${16 * viewportScale}px, 16px)`,
                height: `clamp(14px, ${16 * viewportScale}px, 16px)`
              }}
            />
            <label className="flex-1 cursor-pointer select-none">
              <span 
                className="font-medium text-white"
                style={{
                  fontSize: 'clamp(0.813rem, 3.25vw, 0.938rem)'
                }}
              >
                Entiendo las reglas del conteo guiado
              </span>
              <p 
                className="text-gray-400"
                style={{
                  fontSize: 'clamp(0.688rem, 2.75vw, 0.75rem)',
                  marginTop: `clamp(2px, ${4 * viewportScale}px, 4px)`
                }}
              >
                No podré modificar valores una vez confirmados
              </p>
            </label>
          </div>

          {/* Botón de confirmación - Responsive */}
          <Button
            onClick={handleConfirm}
            disabled={!understood}
            className="w-full font-bold shadow-lg transition-all duration-300"
            style={{
              height: `clamp(40px, ${48 * viewportScale}px, 48px)`,
              fontSize: 'clamp(0.875rem, 3.5vw, 1rem)',
              background: understood ? gradientBg : 'rgba(128, 128, 128, 0.3)',
              border: 'none',
              opacity: understood ? 1 : 0.6,
              transform: understood ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <span 
              className="flex items-center"
              style={{
                gap: `clamp(6px, ${8 * viewportScale}px, 8px)`
              }}
            >
              Comenzar Conteo
              <ArrowRight style={{ 
                width: `clamp(16px, ${20 * viewportScale}px, 20px)`,
                height: `clamp(16px, ${20 * viewportScale}px, 20px)`
              }} />
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}