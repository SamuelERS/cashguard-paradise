// 🤖 [IA] - Desmonolitado desde Phase2VerificationSection.tsx
// Componente presentacional de progreso para sección de verificación Phase 2
import { SHOW_REMAINING_AMOUNTS } from '@/utils/verification-helpers';

/**
 * Props para VerificationProgress component
 * @property completedSteps - Map de denominaciones completadas (Record<key, boolean>)
 * @property verificationSteps - Array de pasos de verificación con key, label, quantity
 */
interface VerificationProgressProps {
  completedSteps: Record<string, boolean>;
  verificationSteps: Array<{ key: string; label: string; quantity: number }>;
}

/**
 * Componente de progreso para verificación ciega Phase 2
 * Muestra badge condicional, contador de progreso, y barra de progreso con gradiente
 */
export function VerificationProgress({ completedSteps, verificationSteps }: VerificationProgressProps) {
  // Cálculo completedCount
  const completedCount = Object.keys(completedSteps)
    .filter(key => completedSteps[key])
    .length;

  // Cálculo progressPercent
  const totalSteps = verificationSteps.length;
  const progressPercent = (completedCount / totalSteps) * 100;

  return (
    <div className="glass-progress-container p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[clamp(0.5rem,2vw,0.75rem)]">
          {/* Badge Condicional: Modo Producción vs Desarrollo */}
          {SHOW_REMAINING_AMOUNTS && (
            <div className="glass-badge-success" style={{
              padding: 'clamp(0.25rem, 1vw, 0.375rem) clamp(0.5rem, 2vw, 0.75rem)',
              fontSize: 'clamp(0.625rem, 2.5vw, 0.875rem)',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(0.25rem, 1vw, 0.375rem)'
            }}>
              <span>💼</span>
              <span>Queda en Caja</span>
            </div>
          )}

          {!SHOW_REMAINING_AMOUNTS && (
            <div className="glass-badge-success" style={{
              padding: 'clamp(0.25rem, 1vw, 0.375rem) clamp(0.5rem, 2vw, 0.75rem)',
              fontSize: 'clamp(0.625rem, 2.5vw, 0.875rem)',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(0.25rem, 1vw, 0.375rem)'
            }}>
              <span>💼</span>
              <span>Verificando Caja</span>
            </div>
          )}

          {/* Contador de Progreso */}
          <div className="flex items-center gap-[clamp(0.375rem,1.5vw,0.5rem)]" style={{
            fontSize: 'clamp(0.75rem, 3vw, 0.875rem)',
            color: 'var(--foreground)'
          }}>
            <span>
              <span className="hidden sm:inline">Verificado:</span>
              <span className="inline sm:hidden">Progreso:</span>
            </span>
            <span style={{ fontWeight: 'bold' }}>
              ✅ {completedCount}/{totalSteps}
            </span>
          </div>
        </div>

        {/* Progress Bar con Gradiente */}
        <div className="flex-1 mx-[clamp(0.5rem,2vw,0.75rem)] rounded-full h-[clamp(0.5rem,2vw,0.625rem)]" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
          <div
            className="h-[clamp(0.5rem,2vw,0.625rem)] rounded-full transition-all duration-500"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, var(--success-paradise) 0%, var(--success-paradise-light) 100%)',
              boxShadow: '0 0 8px rgba(0, 186, 124, 0.4)'
            }}
          />
        </div>
      </div>
    </div>
  );
}
