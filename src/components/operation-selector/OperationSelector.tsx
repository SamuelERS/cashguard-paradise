// 🤖 [IA] - v3.5.0: OT11 - Caso-UX-UI-Feb-19 COMPLETADO (glass morphism, botones estandarizados, viewport-scale eliminado, style blocks 64→38)
// Previous: v3.4.1 - OT12 - Fix denomination images (6 archivos copiados con nombres correctos + tests TDD)
// Previous: v3.3.2 - CASO-SANN-R2 - Panel interactivo sesión activa en Step 5 (reanudar/abortar)
// Previous: v3.3.1 - CASO-SANN-R1 - Banner sesión activa oculto en Paso 1 (Protocolo)
// Previous: v3.3.0 - CASO-SANN - Banner sesión activa en wizard CASH_CUT
// Previous: v3.0.0 - FASE 9 Vista Deliveries Pendientes en Home Screen
// Previous: v2.8.1 - Badge versión actualizado (refinamiento UX botón WhatsApp)
// Previous: v2.8 - Badge versión actualizado (sistema WhatsApp inteligente aplicado a Apertura)
// Previous: v2.7 - Badge versión actualizado (fix orden modal Phase 2 preparación)
// Previous: v2.6 - Badge versión actualizado (sistema inteligente WhatsApp + optimización UX)
// Previous: v2.5 - Badge versión actualizado (formato tabla compacto + fix fondo $50 + SICAR)
import { motion } from 'framer-motion';
import { Sunrise, Moon, Package, ArrowRight, Calculator, Fish, Heart, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// 🤖 [IA] - v1.2.24 - FloatingParticles eliminado para mejorar rendimiento
import { OperationMode, OPERATION_MODES } from '@/types/operation-mode';
import { AppFooter } from '@/components/AppFooter';

interface OperationSelectorProps {
  onSelectMode: (mode: OperationMode) => void;
}

export function OperationSelector({ onSelectMode }: OperationSelectorProps) {
  const navigate = useNavigate();
  const cashCount = OPERATION_MODES[OperationMode.CASH_COUNT];
  const cashCut = OPERATION_MODES[OperationMode.CASH_CUT];
  const deliveryView = OPERATION_MODES[OperationMode.DELIVERY_VIEW];
  
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
                background: 'linear-gradient(135deg, #0a84ff 0%, #5e5ce6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            />
            <div className="flex items-center gap-3">
              <h1 className="font-bold" style={{
                fontSize: `clamp(1.5rem, 6vw, 1.875rem)`,
                color: '#e1e8ed'
              }}>
                Seleccione Operación
              </h1>
              {/* 🤖 [IA] - v3.5.0: OT11 UX-Audit Feb-19 completado */}
              <span className="px-3 py-1 rounded-full text-xs font-semibold shadow-lg" style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2d 100%)',
                color: '#1a1a1a',
                fontSize: `clamp(0.625rem, 2.5vw, 0.75rem)`,
                boxShadow: '0 4px 6px rgba(212, 175, 55, 0.4)',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                  v3.5.0
              </span>
            </div>
          </div>
          <p style={{
            fontSize: `clamp(0.875rem, 3.5vw, 1.125rem)`,
            color: '#8899a6'
          }}>
            Seleccione el Proceso según momento del día
          </p>
        </motion.div>

        {/* Contenedor de las tres opciones */}
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Card de Conteo de Caja (Mañana) */}
          <motion.button
            type="button"
            data-testid="operation-card-cash-count"
            aria-label={`Iniciar ${cashCount.title}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectMode(OperationMode.CASH_COUNT)}
            className="cursor-pointer group text-left w-full"
            style={{
              appearance: 'none',
              background: 'var(--glass-bg-primary)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: 'clamp(20px, 7.4vw, 32px)',
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
                  padding: 'clamp(2px, 0.9vw, 4px) clamp(7px, 2.8vw, 12px)',
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
            <div className="mb-6 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#f4a52a'
                }} />
                <span className="ops-feature-text">
                  Verificación de cambio inicial ($50)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#f4a52a'
                }} />
                <span className="ops-feature-text">
                  Proceso simplificado de 2 fases
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#f4a52a'
                }} />
                <span className="ops-feature-text">
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
                className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#f4a52a]"
              />
            </div>
          </motion.button>

          {/* Card de Corte de Caja (Noche) */}
          <motion.button
            type="button"
            data-testid="operation-card-cash-cut"
            aria-label={`Iniciar ${cashCut.title}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectMode(OperationMode.CASH_CUT)}
            className="cursor-pointer group text-left w-full"
            style={{
              appearance: 'none',
              background: 'var(--glass-bg-primary)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: 'clamp(20px, 7.4vw, 32px)',
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
                  padding: 'clamp(2px, 0.9vw, 4px) clamp(7px, 2.8vw, 12px)',
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
            <div className="mb-6 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#0a84ff'
                }} />
                <span className="ops-feature-text">
                  Comparación con venta esperada SICAR
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#0a84ff'
                }} />
                <span className="ops-feature-text">
                  Proceso completo de 3 fases
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#0a84ff'
                }} />
                <span className="ops-feature-text">
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
                className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#0a84ff]"
              />
            </div>
          </motion.button>

          {/* Card de Deliveries Pendientes (NUEVA) */}
          <motion.button
            type="button"
            data-testid="operation-card-delivery"
            aria-label={`Ver ${deliveryView.title}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => onSelectMode(OperationMode.DELIVERY_VIEW)}
            className="cursor-pointer group text-left w-full"
            style={{
              appearance: 'none',
              background: 'var(--glass-bg-primary)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: 'clamp(20px, 7.4vw, 32px)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Ícono y badge */}
            <div className="flex items-start justify-between mb-6">
              <Package 
                style={{
                  width: `clamp(48px, 12vw, 64px)`,
                  height: `clamp(48px, 12vw, 64px)`,
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              />
              <span 
                className="rounded-full font-semibold"
                style={{
                  padding: 'clamp(2px, 0.9vw, 4px) clamp(7px, 2.8vw, 12px)',
                  fontSize: `clamp(0.625rem, 2.5vw, 0.75rem)`,
                  background: 'rgba(16, 185, 129, 0.2)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  color: '#10b981'
                }}
              >
                {deliveryView.subtitle}
              </span>
            </div>

            {/* Título y descripción */}
            <h3 className="font-bold mb-3" style={{
              fontSize: `clamp(1.25rem, 5vw, 1.5rem)`,
              color: '#e1e8ed'
            }}>
              {deliveryView.title}
            </h3>
            <p className="mb-6" style={{
              fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
              color: '#8899a6'
            }}>
              {deliveryView.description}
            </p>

            {/* Características */}
            <div className="mb-6 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#10b981'
                }} />
                <span className="ops-feature-text">
                  Vista completa de envíos activos
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#10b981'
                }} />
                <span className="ops-feature-text">
                  Actualizar estados (pagado/cancelado)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#10b981'
                }} />
                <span className="ops-feature-text">
                  Alertas automáticas de antigüedad
                </span>
              </div>
            </div>

            {/* Botón de acción */}
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{
                fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                color: '#10b981'
              }}>
                Comenzar
              </span>
              <ArrowRight
                className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#10b981]"
              />
            </div>
          </motion.button>

          {/* 🤖 [IA] - Card Dashboard Supervisor (acceso directo a /supervisor) */}
          <motion.button
            type="button"
            aria-label="Acceder al Dashboard Supervisor"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02 }}
            onClick={() => navigate('/supervisor')}
            className="cursor-pointer group text-left w-full"
            style={{
              appearance: 'none',
              background: 'var(--glass-bg-primary)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: 'clamp(20px, 7.4vw, 32px)',
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            {/* Ícono y badge */}
            <div className="flex items-start justify-between mb-6">
              <BarChart3
                style={{
                  width: `clamp(48px, 12vw, 64px)`,
                  height: `clamp(48px, 12vw, 64px)`,
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              />
              <span
                className="rounded-full font-semibold"
                style={{
                  padding: 'clamp(2px, 0.9vw, 4px) clamp(7px, 2.8vw, 12px)',
                  fontSize: `clamp(0.625rem, 2.5vw, 0.75rem)`,
                  background: 'rgba(139, 92, 246, 0.2)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                  color: '#8b5cf6'
                }}
              >
                Supervisión
              </span>
            </div>

            {/* Título y descripción */}
            <h3 className="font-bold mb-3" style={{
              fontSize: `clamp(1.25rem, 5vw, 1.5rem)`,
              color: '#e1e8ed'
            }}>
              Dashboard Supervisor
            </h3>
            <p className="mb-6" style={{
              fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
              color: '#8899a6'
            }}>
              Consulta cortes del día, historial y desempeño de cajeros
            </p>

            {/* Características */}
            <div className="mb-6 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#8b5cf6'
                }} />
                <span className="ops-feature-text">
                  Cortes del día con semáforo de estado
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#8b5cf6'
                }} />
                <span className="ops-feature-text">
                  Historial con filtros por fecha y sucursal
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#8b5cf6'
                }} />
                <span className="ops-feature-text">
                  Acceso protegido con PIN de supervisor
                </span>
              </div>
            </div>

            {/* Botón de acción */}
            <div className="flex items-center justify-between">
              <span className="font-medium" style={{
                fontSize: `clamp(0.75rem, 3vw, 0.875rem)`,
                color: '#8b5cf6'
              }}>
                Acceder
              </span>
              <ArrowRight
                className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#8b5cf6]"
              />
            </div>
          </motion.button>
        </div>

        {/* Mensaje informativo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-sm text-[#657786]">
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
            padding: 'clamp(16px, 5.6vw, 24px)',
            backgroundColor: 'var(--glass-bg-primary)',
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

          {/* 🤖 [IA] - v1.0.0 - Footer espiritual integrado - OPCIÓN 1: Esquina inferior derecha */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/[0.08]"
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
                color: '#0a84ff',
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
                fill="#ef4444"
                stroke="#ef4444"
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
