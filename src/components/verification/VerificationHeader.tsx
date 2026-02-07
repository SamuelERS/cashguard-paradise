// 🤖 [IA] - Desmonolitado desde Phase2VerificationSection.tsx
// Componente presentacional header para sección de verificación Phase 2
import { motion } from 'framer-motion';
import { Building } from 'lucide-react';

export function VerificationHeader() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="glass-panel-success p-4"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-[clamp(0.5rem,2vw,0.75rem)]">
        <div className="flex items-center gap-[clamp(0.5rem,2vw,0.75rem)]">
          {/* Icon Circle with Building */}
          <div className="w-[clamp(2.5rem,10vw,3rem)] h-[clamp(2.5rem,10vw,3rem)] rounded-full flex items-center justify-center" style={{
            background: 'linear-gradient(135deg, var(--success-paradise) 0%, var(--success-paradise-light) 100%)'
          }}>
            <Building className="w-[clamp(1.25rem,5vw,1.5rem)] h-[clamp(1.25rem,5vw,1.5rem)] text-white" />
          </div>

          {/* Title & Subtitle */}
          <div>
            <h3 className="text-[clamp(0.875rem,3.5vw,1rem)] sm:text-[clamp(1rem,4vw,1.125rem)] font-bold" style={{ color: 'var(--success-paradise)' }}>
              VERIFICACIÓN EN CAJA
            </h3>
            <p className="text-[clamp(0.75rem,3vw,0.875rem)]" style={{ color: 'var(--muted-foreground)' }}>
              Confirmar lo que queda
            </p>
          </div>
        </div>

        {/* Target Badge */}
        <div className="text-center sm:text-right w-full sm:w-auto mt-2 sm:mt-0">
          <span className="glass-target-badge inline-block px-[clamp(0.5rem,2vw,0.75rem)] py-[clamp(0.25rem,1vw,0.375rem)] rounded-[clamp(0.5rem,2vw,0.75rem)] text-[clamp(0.625rem,2.5vw,0.875rem)] font-bold whitespace-nowrap">
            🎯 Objetivo: Cambio completo
          </span>
        </div>
      </div>
    </motion.div>
  );
}
