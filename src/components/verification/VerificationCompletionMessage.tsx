// 🤖 [IA] - Desmonolitado desde Phase2VerificationSection.tsx
// Componente mensaje de éxito verificación completa

import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface VerificationCompletionMessageProps {
  /**
   * Número total de denominaciones verificadas
   */
  totalDenominations: number;
}

/**
 * Mensaje de éxito mostrado al completar todas las verificaciones
 * Incluye animación de entrada y ícono CheckCircle con badge circular
 */
export function VerificationCompletionMessage({ totalDenominations }: VerificationCompletionMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-[clamp(1rem,4vw,1.5rem)]"
    >
      <div className="flex justify-center">
        <div className="w-[clamp(3rem,12vw,4rem)] h-[clamp(3rem,12vw,4rem)] rounded-full bg-success/20 flex items-center justify-center">
          <CheckCircle className="w-[clamp(1.5rem,6vw,2rem)] h-[clamp(1.5rem,6vw,2rem)] text-success" />
        </div>
      </div>
      <div className="space-y-[clamp(0.5rem,2vw,0.75rem)]">
        <h3 className="text-[clamp(1rem,4vw,1.25rem)] font-bold text-foreground">
          Verificación Exitosa
        </h3>
        <p className="text-[clamp(0.75rem,3vw,0.875rem)] text-muted-foreground">
          Has completado la verificación de las {totalDenominations} denominaciones.
          Procediendo a generar reporte final...
        </p>
      </div>
    </motion.div>
  );
}
