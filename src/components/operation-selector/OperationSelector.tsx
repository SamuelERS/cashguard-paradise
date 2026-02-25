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
import { useState } from 'react';
// 🤖 [IA] - v1.2.24 - FloatingParticles eliminado para mejorar rendimiento
import { OperationMode, OPERATION_MODES } from '@/types/operation-mode';
import { AppFooter } from '@/components/AppFooter';
import './operation-selector.css';

interface OperationSelectorProps {
  onSelectMode: (mode: OperationMode) => void;
}

export function OperationSelector({ onSelectMode }: OperationSelectorProps) {
  const navigate = useNavigate();
  const [showTeamMessage, setShowTeamMessage] = useState(false);
  const cashCount = OPERATION_MODES[OperationMode.CASH_COUNT];
  const cashCut = OPERATION_MODES[OperationMode.CASH_CUT];
  const deliveryView = OPERATION_MODES[OperationMode.DELIVERY_VIEW];
  
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 🤖 [IA] - v1.2.24 - Partículas flotantes eliminadas para mejorar rendimiento */}
      
      {/* 🤖 [IA] - v1.0.87 - Logos corporativos en esquinas superiores */}
      <div className="operation-brand-strip">
        <motion.img 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="operation-brand-logo operation-brand-logo--left"
          src="/logo-paradise.png"
          alt=""
          aria-hidden="true"
        />
        <motion.img 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="operation-brand-logo operation-brand-logo--right"
          src="/productos-acuarios.png"
          alt=""
          aria-hidden="true"
        />
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-6 md:py-8">
        {/* Header con título principal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10 pt-16 md:pt-20"
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
        <div className="grid md:grid-cols-2 gap-5 md:gap-6 max-w-6xl mx-auto">
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
            className="operation-card operation-card--morning cursor-pointer group text-left w-full"
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
              <span className="operation-badge operation-badge--morning">
                {cashCount.subtitle}
              </span>
            </div>

            {/* Título y descripción */}
            <h3 className="font-bold mb-3 operation-title">
              {cashCount.title}
            </h3>
            <p className="mb-6 operation-description">
              {cashCount.description}
            </p>

            {/* Características */}
            <div className="mb-6 flex flex-col gap-2">
              <div className="operation-feature">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#f4a52a'
                }} />
                <span className="operation-feature-text">
                  Verificación de cambio inicial ($50)
                </span>
              </div>
              <div className="operation-feature">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#f4a52a'
                }} />
                <span className="operation-feature-text">
                  Proceso simplificado de 2 fases
                </span>
              </div>
              <div className="operation-feature operation-feature--mobile-optional">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#f4a52a'
                }} />
                <span className="operation-feature-text">
                  Ideal para cambio de turno matutino
                </span>
              </div>
            </div>

            {/* Botón de acción */}
            <div className="flex items-center justify-between">
              <span className="operation-action operation-action--morning">
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
            className="operation-card operation-card--night cursor-pointer group text-left w-full"
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
              <span className="operation-badge operation-badge--night">
                {cashCut.subtitle}
              </span>
            </div>

            {/* Título y descripción */}
            <h3 className="font-bold mb-3 operation-title">
              {cashCut.title}
            </h3>
            <p className="mb-6 operation-description">
              {cashCut.description}
            </p>

            {/* Características */}
            <div className="mb-6 flex flex-col gap-2">
              <div className="operation-feature">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#0a84ff'
                }} />
                <span className="operation-feature-text">
                  Comparación con venta esperada SICAR
                </span>
              </div>
              <div className="operation-feature">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#0a84ff'
                }} />
                <span className="operation-feature-text">
                  Proceso completo de 3 fases
                </span>
              </div>
              <div className="operation-feature operation-feature--mobile-optional">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#0a84ff'
                }} />
                <span className="operation-feature-text">
                  Entrega de efectivo y reporte final
                </span>
              </div>
            </div>

            {/* Botón de acción */}
            <div className="flex items-center justify-between">
              <span className="operation-action operation-action--night">
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
            className="operation-card operation-card--delivery cursor-pointer group text-left w-full"
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
              <span className="operation-badge operation-badge--delivery">
                {deliveryView.subtitle}
              </span>
            </div>

            {/* Título y descripción */}
            <h3 className="font-bold mb-3 operation-title">
              {deliveryView.title}
            </h3>
            <p className="mb-6 operation-description">
              {deliveryView.description}
            </p>

            {/* Características */}
            <div className="mb-6 flex flex-col gap-2">
              <div className="operation-feature">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#10b981'
                }} />
                <span className="operation-feature-text">
                  Vista completa de envíos activos
                </span>
              </div>
              <div className="operation-feature">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#10b981'
                }} />
                <span className="operation-feature-text">
                  Actualizar estados (pagado/cancelado)
                </span>
              </div>
              <div className="operation-feature operation-feature--mobile-optional">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#10b981'
                }} />
                <span className="operation-feature-text">
                  Alertas automáticas de antigüedad
                </span>
              </div>
            </div>

            {/* Botón de acción */}
            <div className="flex items-center justify-between">
              <span className="operation-action operation-action--delivery">
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
            className="operation-card operation-card--supervisor cursor-pointer group text-left w-full"
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
              <span className="operation-badge operation-badge--supervisor">
                Supervisión
              </span>
            </div>

            {/* Título y descripción */}
            <h3 className="font-bold mb-3 operation-title">
              Dashboard Supervisor
            </h3>
            <p className="mb-6 operation-description">
              Consulta cortes del día, historial y desempeño de cajeros
            </p>

            {/* Características */}
            <div className="mb-6 flex flex-col gap-2">
              <div className="operation-feature">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#8b5cf6'
                }} />
                <span className="operation-feature-text">
                  Cortes del día con semáforo de estado
                </span>
              </div>
              <div className="operation-feature">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#8b5cf6'
                }} />
                <span className="operation-feature-text">
                  Historial con filtros por fecha y sucursal
                </span>
              </div>
              <div className="operation-feature operation-feature--mobile-optional">
                <div className="rounded-full" style={{
                  width: `clamp(5px, 1.5vw, 6px)`,
                  height: `clamp(5px, 1.5vw, 6px)`,
                  background: '#8b5cf6'
                }} />
                <span className="operation-feature-text">
                  Acceso protegido con PIN de supervisor
                </span>
              </div>
            </div>

            {/* Botón de acción */}
            <div className="flex items-center justify-between">
              <span className="operation-action operation-action--supervisor">
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
          className="text-center mt-10"
        >
          <p className="text-sm text-[#657786]">
            Seleccione la operación correcta según el horario actual
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 max-w-2xl mx-auto"
        >
          <button
            type="button"
            aria-expanded={showTeamMessage}
            aria-controls="team-message-panel"
            onClick={() => setShowTeamMessage(prev => !prev)}
            className="operation-team-toggle w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-left text-xs font-medium text-white/75 transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300/35"
          >
            {showTeamMessage ? 'Ocultar mensaje del equipo' : 'Ver mensaje del equipo'}
          </button>

          {showTeamMessage && (
            <motion.div
              id="team-message-panel"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="operation-team-panel mt-3 rounded-xl"
            >
              <span className="italic">
                "Este sistema protege tu trabajo diario y garantiza transparencia en cada operación.
                Confiamos en ti, y juntos cuidamos los recursos de Paradise."
              </span>
              <span className="operation-team-signature block mt-2">- Equipo de Acuarios Paradise</span>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
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
                  className="operation-team-icon"
                >
                  🕊️
                </motion.span>

                <span className="operation-team-tag font-semibold">JesucristoEsDios</span>

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
                  <Heart fill="#ef4444" stroke="#ef4444" className="operation-team-heart" />
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
