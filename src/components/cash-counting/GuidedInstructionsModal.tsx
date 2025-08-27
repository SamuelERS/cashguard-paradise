// 🤖 [IA] - v1.2.8: Modal único de instrucciones para eliminar redundancia
import { useState, useEffect } from 'react';
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
        {/* Header con gradiente */}
        <div 
          className="p-6 pb-0"
          style={{
            background: gradientBg,
            borderRadius: '16px 16px 0 0'
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Instrucciones del Conteo Guiado
            </DialogTitle>
            <DialogDescription className="text-white/80 mt-2">
              Por favor lea atentamente antes de continuar
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Instrucciones */}
          <div className="space-y-3">
            {instructions.map((instruction, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex gap-3 p-4 rounded-lg"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div 
                  className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor}22, ${secondaryColor}22)`,
                    border: `1px solid ${primaryColor}44`
                  }}
                >
                  <div style={{ color: primaryColor }}>
                    {instruction.icon}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">
                    {instruction.title}
                  </h4>
                  <p className="text-sm text-gray-400">
                    {instruction.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Checkbox de confirmación */}
          <div 
            className="mt-6 p-4 rounded-lg flex items-center gap-3 cursor-pointer"
            style={{
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
                borderColor: understood ? primaryColor : 'rgba(255, 255, 255, 0.3)'
              }}
            />
            <label className="flex-1 cursor-pointer select-none">
              <span className="font-medium text-white">
                Entiendo las reglas del conteo guiado
              </span>
              <p className="text-xs text-gray-400 mt-1">
                No podré modificar valores una vez confirmados
              </p>
            </label>
          </div>

          {/* Botón de confirmación */}
          <Button
            onClick={handleConfirm}
            disabled={!understood}
            className="w-full h-12 text-base font-bold shadow-lg transition-all duration-300"
            style={{
              background: understood ? gradientBg : 'rgba(128, 128, 128, 0.3)',
              border: 'none',
              opacity: understood ? 1 : 0.6,
              transform: understood ? 'scale(1)' : 'scale(0.98)'
            }}
          >
            <span className="flex items-center gap-2">
              Comenzar Conteo
              <ArrowRight className="w-5 h-5" />
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}