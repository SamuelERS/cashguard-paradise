// 🤖 [IA] - v2.8.3: Theme System - Toggle UI con Sun/Moon icons + persistencia localStorage
// Previous: v2.8.2: Migración sistema temas - colores hardcodeados → CSS variables semánticas
// Previous: v2.8.1 - Badge versión actualizado (refinamiento UX botón WhatsApp)
// Previous: v2.8 - Badge versión actualizado (sistema WhatsApp inteligente aplicado a Apertura)
// Previous: v2.7 - Badge versión actualizado (fix orden modal Phase 2 preparación)
// Previous: v2.6 - Badge versión actualizado (sistema inteligente WhatsApp + optimización UX)
import { motion } from 'framer-motion';
import { Sunrise, Moon, ArrowRight, Calculator, Heart, Sun } from 'lucide-react';
// 🤖 [IA] - v1.2.24 - FloatingParticles eliminado para mejorar rendimiento
import { OperationMode, OPERATION_MODES } from '@/types/operation-mode';
import { AppFooter } from '@/components/AppFooter';
import { useTheme } from '@/hooks/useTheme';

interface OperationSelectorProps {
  onSelectMode: (mode: OperationMode) => void;
}

export function OperationSelector({ onSelectMode }: OperationSelectorProps) {
  const cashCount = OPERATION_MODES[OperationMode.CASH_COUNT];
  const cashCut = OPERATION_MODES[OperationMode.CASH_CUT];

  // 🤖 [IA] - v2.8.3: Theme toggle hook
  const { theme, toggleTheme, isDark } = useTheme();

  // 🤖 [IA] - v1.2.11 - Detección de viewport y escala proporcional
  const viewportScale = typeof window !== 'undefined' ? Math.min(window.innerWidth / 430, 1) : 1;
  const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 🤖 [IA] - v1.2.24 - Partículas flotantes eliminadas para mejorar rendimiento */}
      
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
                background: 'var(--gradient-evening)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            />
            <div className="flex items-center gap-3">
              <h1 className="font-bold" style={{
                fontSize: `clamp(1.5rem, 6vw, 1.875rem)`,
                color: 'var(--text-title)'
              }}>
                Seleccione Operación
              </h1>
              {/* 🤖 [IA] - v2.8.3: Badge versión actualizado (Theme System) */}
              <span className="px-3 py-1 rounded-full text-xs font-semibold shadow-lg" style={{
                background: 'var(--gradient-gold)',
                color: 'var(--badge-text-dark)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                boxShadow: '0 4px 6px rgba(212, 175, 55, 0.4)',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                v2.8.3
              </span>
              {/* 🤖 [IA] - v2.8.3: Theme Toggle Button - Sun/Moon icons */}
              <motion.button
                onClick={toggleTheme}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-full transition-colors"
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-title)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                }}
                aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                title={isDark ? 'Modo Claro' : 'Modo Oscuro'}
              >
                <motion.div
                  initial={false}
                  animate={{ rotate: isDark ? 0 : 180 }}
                  transition={{ duration: 0.3 }}
                >
                  {isDark ? (
                    <Sun style={{ width: 'clamp(16px, 4vw, 20px)', height: 'clamp(16px, 4vw, 20px)' }} />
                  ) : (
                    <Moon style={{ width: 'clamp(16px, 4vw, 20px)', height: 'clamp(16px, 4vw, 20px)' }} />
                  )}
                </motion.div>
              </motion.button>
            </div>
          </div>
          <p style={{
            fontSize: `clamp(0.875rem, 3.5vw, 1.125rem)`,
            color: 'var(--text-subtitle)'
          }}>
            Seleccione el Proceso según momento del día
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
              background: 'var(--bg-card)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--border-medium)',
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
                  background: 'var(--gradient-morning)',
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
                  color: 'var(--accent-morning-light)'
                }}
              >
                {cashCount.subtitle}
              </span>
            </div>

            {/* Título y descripción */}
            <h3 className="font-bold mb-3" style={{
              fontSize: `clamp(1.25rem, 5vw, 1.5rem)`,
              color: 'var(--text-title)'
            }}>
              {cashCount.title}
            </h3>
            <p className="mb-6" style={{
              fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
              color: 'var(--text-subtitle)'
            }}>
              {cashCount.description}
            </p>

            {/* Características */}
            <div className="mb-6" style={{ display: 'flex', flexDirection: 'column', gap: `clamp(6px, 1.5vw, 8px)` }}>
              <div className="flex items-center" style={{ gap: `clamp(6px, 1.5vw, 8px)` }}>
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: 'var(--accent-morning)'
                }} />
                <span style={{
                  fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                  color: 'var(--text-subtitle)'
                }}>
                  Verificación de cambio inicial ($50)
                </span>
              </div>
              <div className="flex items-center" style={{ gap: `clamp(6px, 1.5vw, 8px)` }}>
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: 'var(--accent-morning)'
                }} />
                <span style={{
                  fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                  color: 'var(--text-subtitle)'
                }}>
                  Proceso simplificado de 2 fases
                </span>
              </div>
              <div className="flex items-center" style={{ gap: `clamp(6px, 1.5vw, 8px)` }}>
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: 'var(--accent-morning)'
                }} />
                <span style={{
                  fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                  color: 'var(--text-subtitle)'
                }}>
                  Ideal para cambio de turno matutino
                </span>
              </div>
            </div>

            {/* Botón de acción */}
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{
                fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                color: 'var(--accent-morning)'
              }}>
                Comenzar
              </span>
              <ArrowRight 
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                style={{ color: 'var(--accent-morning)' }}
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
              background: 'var(--bg-card)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid var(--border-medium)',
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
                  background: 'var(--gradient-evening)',
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
                  color: 'var(--accent-primary)'
                }}
              >
                {cashCut.subtitle}
              </span>
            </div>

            {/* Título y descripción */}
            <h3 className="font-bold mb-3" style={{
              fontSize: `clamp(1.25rem, 5vw, 1.5rem)`,
              color: 'var(--text-title)'
            }}>
              {cashCut.title}
            </h3>
            <p className="mb-6" style={{
              fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
              color: 'var(--text-subtitle)'
            }}>
              {cashCut.description}
            </p>

            {/* Características */}
            <div className="mb-6" style={{ display: 'flex', flexDirection: 'column', gap: `clamp(6px, 1.5vw, 8px)` }}>
              <div className="flex items-center" style={{ gap: `clamp(6px, 1.5vw, 8px)` }}>
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: 'var(--accent-primary)'
                }} />
                <span style={{
                  fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                  color: 'var(--text-subtitle)'
                }}>
                  Comparación con venta esperada SICAR
                </span>
              </div>
              <div className="flex items-center" style={{ gap: `clamp(6px, 1.5vw, 8px)` }}>
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: 'var(--accent-primary)'
                }} />
                <span style={{
                  fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                  color: 'var(--text-subtitle)'
                }}>
                  Proceso completo de 3 fases
                </span>
              </div>
              <div className="flex items-center" style={{ gap: `clamp(6px, 1.5vw, 8px)` }}>
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: 'var(--accent-primary)'
                }} />
                <span style={{
                  fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                  color: 'var(--text-subtitle)'
                }}>
                  Entrega de efectivo y reporte final
                </span>
              </div>
            </div>

            {/* Botón de acción */}
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{
                fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                color: 'var(--accent-primary)'
              }}>
                Comenzar
              </span>
              <ArrowRight 
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                style={{ color: 'var(--accent-primary)' }}
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
          <p className="text-sm" style={{ color: 'var(--text-gray)' }}>
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
            backgroundColor: 'var(--bg-card)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--border-medium)',
            borderLeft: '3px solid var(--accent-primary)',
            color: 'var(--text-subtitle)',
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
            color: 'var(--text-gray)' 
          }}>
            - Equipo de Acuarios Paradise
          </span>

          {/* 🤖 [IA] - v1.0.0 - Footer espiritual integrado - OPCIÓN 1: Esquina inferior derecha */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex items-center justify-end gap-2 mt-4 pt-3"
            style={{
              borderTop: '1px solid var(--border-subtle)',
            }}
          >
            <motion.span
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
              style={{
                fontSize: `clamp(0.875rem, 3.5vw, 1rem)`,
              }}
            >
              🕊️
            </motion.span>
            
            <span
              className="font-semibold"
              style={{
                fontSize: `clamp(0.625rem, 2.5vw, 0.75rem)`,
                color: 'var(--accent-primary)',
                letterSpacing: '0.02em',
              }}
            >
              JesucristoEsDios
            </span>

            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: 'reverse',
              }}
            >
              <Heart
                fill="var(--heart-red)"
                stroke="var(--heart-red)"
                style={{
                  width: `clamp(12px, 3vw, 14px)`,
                  height: `clamp(12px, 3vw, 14px)`,
                  filter: 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.5))',
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}