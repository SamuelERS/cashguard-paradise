// 🤖 [IA] - v1.0.87 - Selector de modo con elementos corporativos integrados
import { motion } from 'framer-motion';
import { Sunrise, Moon, ArrowRight, Calculator, Fish } from 'lucide-react';
import { FloatingParticles } from '@/components/FloatingParticles';
import { OperationMode, OPERATION_MODES } from '@/types/operation-mode';

interface OperationSelectorProps {
  onSelectMode: (mode: OperationMode) => void;
}

export function OperationSelector({ onSelectMode }: OperationSelectorProps) {
  const cashCount = OPERATION_MODES[OperationMode.CASH_COUNT];
  const cashCut = OPERATION_MODES[OperationMode.CASH_CUT];
  
  // 🤖 [IA] - v1.2.11 - Detección de viewport y escala proporcional
  const viewportScale = typeof window !== 'undefined' ? Math.min(window.innerWidth / 430, 1) : 1;
  const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 🤖 [IA] - v1.0.87 - Partículas flotantes de fondo */}
      <FloatingParticles />
      
      {/* 🤖 [IA] - v1.0.87 - Logos corporativos en esquinas superiores */}
      <div className="absolute top-0 left-0 right-0 flex justify-between p-4 md:p-6 lg:p-8 pointer-events-none z-20">
        <motion.img 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          src="/logo-paradise.png"
          alt="Acuarios Paradise"
          style={{
            height: `clamp(40px, 10vw, 80px)`,
            width: 'auto',
            opacity: 0.9
          }}
        />
        <motion.img 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          src="/productos-acuarios.png"
          alt="Productos Paradise"
          style={{
            height: `clamp(40px, 10vw, 80px)`,
            width: 'auto',
            opacity: 0.8,
            borderRadius: '8px'
          }}
        />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header con título principal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 pt-20"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator 
              style={{
                width: `clamp(40px, 10vw, 48px)`,
                height: `clamp(40px, 10vw, 48px)`,
                background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }} 
            />
            <h1 className="font-bold" style={{
              fontSize: `clamp(1.5rem, 6vw, 1.875rem)`,
              color: '#e1e8ed'
            }}>
              Seleccione el Tipo de Operación
            </h1>
          </div>
          <p style={{
            fontSize: `clamp(0.875rem, 3.5vw, 1.125rem)`,
            color: '#8899a6'
          }}>
            Elija el proceso que desea realizar según el momento del día
          </p>
        </motion.div>

        {/* Contenedor de las dos opciones */}
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Card de Conteo de Caja (Mañana) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectMode(OperationMode.CASH_COUNT)}
            className="cursor-pointer group"
            style={{
              background: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: `clamp(20px, ${32 * viewportScale}px, 32px)`,
              // 🤖 [IA] - v1.1.06: Eliminada transición CSS duplicada - Framer Motion maneja todo
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Ícono y badge */}
            <div className="flex items-start justify-between mb-6">
              <Sunrise 
                style={{
                  width: `clamp(48px, 12vw, 64px)`,
                  height: `clamp(48px, 12vw, 64px)`,
                  background: 'linear-gradient(135deg, #f4a52a 0%, #ffb84d 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              />
              <span 
                className="rounded-full font-semibold"
                style={{
                  padding: `${Math.round(4 * viewportScale)}px ${Math.round(12 * viewportScale)}px`,
                  fontSize: `clamp(0.625rem, 2.5vw, 0.75rem)`,
                  background: 'rgba(244, 165, 42, 0.2)',
                  border: '1px solid rgba(244, 165, 42, 0.4)',
                  color: '#ffb84d'
                }}
              >
                {cashCount.subtitle}
              </span>
            </div>

            {/* Título y descripción */}
            <h3 className="font-bold mb-3" style={{
              fontSize: `clamp(1.25rem, 5vw, 1.5rem)`,
              color: '#e1e8ed'
            }}>
              {cashCount.title}
            </h3>
            <p className="mb-6" style={{
              fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
              color: '#8899a6'
            }}>
              {cashCount.description}
            </p>

            {/* Características */}
            <div className="mb-6" style={{ display: 'flex', flexDirection: 'column', gap: `clamp(6px, 1.5vw, 8px)` }}>
              <div className="flex items-center" style={{ gap: `clamp(6px, 1.5vw, 8px)` }}>
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#f4a52a'
                }} />
                <span style={{
                  fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                  color: '#8899a6'
                }}>
                  Verificación de cambio inicial ($50)
                </span>
              </div>
              <div className="flex items-center" style={{ gap: `clamp(6px, 1.5vw, 8px)` }}>
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#f4a52a'
                }} />
                <span style={{
                  fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                  color: '#8899a6'
                }}>
                  Proceso simplificado de 2 fases
                </span>
              </div>
              <div className="flex items-center" style={{ gap: `clamp(6px, 1.5vw, 8px)` }}>
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#f4a52a'
                }} />
                <span style={{
                  fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                  color: '#8899a6'
                }}>
                  Ideal para cambio de turno matutino
                </span>
              </div>
            </div>

            {/* Botón de acción */}
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{
                fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                color: '#f4a52a'
              }}>
                Comenzar
              </span>
              <ArrowRight 
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                style={{ color: '#f4a52a' }}
              />
            </div>
          </motion.div>

          {/* Card de Corte de Caja (Noche) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectMode(OperationMode.CASH_CUT)}
            className="cursor-pointer group"
            style={{
              background: 'rgba(36, 36, 36, 0.4)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: `clamp(20px, ${32 * viewportScale}px, 32px)`,
              // 🤖 [IA] - v1.1.06: Eliminada transición CSS duplicada - Framer Motion maneja todo
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Ícono y badge */}
            <div className="flex items-start justify-between mb-6">
              <Moon 
                style={{
                  width: `clamp(48px, 12vw, 64px)`,
                  height: `clamp(48px, 12vw, 64px)`,
                  background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              />
              <span 
                className="rounded-full font-semibold"
                style={{
                  padding: `${Math.round(4 * viewportScale)}px ${Math.round(12 * viewportScale)}px`,
                  fontSize: `clamp(0.625rem, 2.5vw, 0.75rem)`,
                  background: 'rgba(10, 132, 255, 0.2)',
                  border: '1px solid rgba(10, 132, 255, 0.4)',
                  color: '#0a84ff'
                }}
              >
                {cashCut.subtitle}
              </span>
            </div>

            {/* Título y descripción */}
            <h3 className="font-bold mb-3" style={{
              fontSize: `clamp(1.25rem, 5vw, 1.5rem)`,
              color: '#e1e8ed'
            }}>
              {cashCut.title}
            </h3>
            <p className="mb-6" style={{
              fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
              color: '#8899a6'
            }}>
              {cashCut.description}
            </p>

            {/* Características */}
            <div className="mb-6" style={{ display: 'flex', flexDirection: 'column', gap: `clamp(6px, 1.5vw, 8px)` }}>
              <div className="flex items-center" style={{ gap: `clamp(6px, 1.5vw, 8px)` }}>
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#0a84ff'
                }} />
                <span style={{
                  fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                  color: '#8899a6'
                }}>
                  Comparación con venta esperada SICAR
                </span>
              </div>
              <div className="flex items-center" style={{ gap: `clamp(6px, 1.5vw, 8px)` }}>
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#0a84ff'
                }} />
                <span style={{
                  fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                  color: '#8899a6'
                }}>
                  Proceso completo de 3 fases
                </span>
              </div>
              <div className="flex items-center" style={{ gap: `clamp(6px, 1.5vw, 8px)` }}>
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#0a84ff'
                }} />
                <span style={{
                  fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                  color: '#8899a6'
                }}>
                  Entrega de efectivo y reporte final
                </span>
              </div>
            </div>

            {/* Botón de acción */}
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{
                fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                color: '#0a84ff'
              }}>
                Comenzar
              </span>
              <ArrowRight 
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                style={{ color: '#0a84ff' }}
              />
            </div>
          </motion.div>
        </div>

        {/* Mensaje informativo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-sm" style={{ color: '#657786' }}>
            Seleccione la operación correcta según el horario actual
          </p>
        </motion.div>

        {/* 🤖 [IA] - v1.0.87 - Mensaje motivacional del equipo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 max-w-2xl mx-auto rounded-xl"
          style={{ 
            padding: `clamp(16px, ${24 * viewportScale}px, 24px)`,
            backgroundColor: 'rgba(36, 36, 36, 0.4)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderLeft: '3px solid #0a84ff',
            color: '#8899a6',
            fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <span className="italic">
            "Este sistema protege tu trabajo diario y garantiza transparencia en cada operación. 
            Confiamos en ti, y juntos cuidamos los recursos de Paradise."
          </span>
          <span className="block mt-2" style={{ 
            fontSize: `clamp(0.625rem, 2.5vw, 0.75rem)`,
            color: '#657786' 
          }}>
            - Equipo de Acuarios Paradise
          </span>
        </motion.div>
      </div>
    </div>
  );
}