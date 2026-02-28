// 🤖 [IA] - v4.1.2: versión oficial con mejoras UX recientes
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
import { Sunrise, Moon, Package, ArrowRight, Calculator, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
// 🤖 [IA] - v1.2.24 - FloatingParticles eliminado para mejorar rendimiento
import { OperationMode, OPERATION_MODES } from '@/types/operation-mode';
import './operation-selector.css';

interface OperationSelectorProps {
  onSelectMode: (mode: OperationMode) => void;
}

export function OperationSelector({ onSelectMode }: OperationSelectorProps) {
  const navigate = useNavigate();
  const cashCount = OPERATION_MODES[OperationMode.CASH_COUNT];
  const cashCut = OPERATION_MODES[OperationMode.CASH_CUT];
  const deliveryView = OPERATION_MODES[OperationMode.DELIVERY_VIEW];
  
  return (
    <div className="h-full relative overflow-hidden">
      {/* 🤖 [IA] - v1.2.24 - Partículas flotantes eliminadas para mejorar rendimiento */}
      
      {/* 🤖 [IA] - v1.0.87 - Logos corporativos en esquinas superiores */}
      <div className="operation-brand-strip">
        <div className="operation-brand-shell">
          <div className="operation-brand-left">
            <motion.img 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="operation-brand-logo operation-brand-logo--left"
              src="/logo-paradise.png"
              alt=""
              aria-hidden="true"
            />
          </div>
          <div className="operation-brand-right">
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
        </div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-2 md:py-3">
        {/* Header con título principal */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-5 pt-2 text-center md:pt-3"
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
              {/* 🤖 [IA] - v4.1.2: release oficial */}
              <span className="px-3 py-1 rounded-full text-xs font-semibold shadow-lg" style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #aa8c2d 100%)',
                color: '#1a1a1a',
                fontSize: `clamp(0.625rem, 2.5vw, 0.75rem)`,
                boxShadow: '0 4px 6px rgba(212, 175, 55, 0.4)',
                border: '1px solid rgba(255, 215, 0, 0.3)'
              }}>
                  v4.1.2
              </span>
            </div>
          </div>
          <p style={{
            fontSize: `clamp(0.875rem, 3.5vw, 1.125rem)`,
            color: '#8899a6'
          }}>
            Elige el proceso según el momento del día
          </p>
        </motion.div>

        {/* Contenedor de las tres opciones */}
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 md:gap-5">
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
            <div className="mb-4 flex items-start justify-between">
              <Sunrise 
                style={{
                  width: `clamp(42px, 9.5vw, 56px)`,
                  height: `clamp(42px, 9.5vw, 56px)`,
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
            <h3 className="mb-2.5 font-bold operation-title">
              {cashCount.title}
            </h3>
            <p className="mb-4 operation-description">
              {cashCount.description}
            </p>

            {/* Características */}
            <div className="mb-4 flex flex-col gap-1.5">
              <div className="operation-feature">
                <div className="rounded-full" style={{
                  width: `clamp(4px, 1.2vw, 5px)`,
                  height: `clamp(4px, 1.2vw, 5px)`,
                  background: '#f4a52a'
                }} />
                <span className="operation-feature-text">
                  Verificación de cambio inicial ($50)
                </span>
              </div>
              <div className="operation-feature">
                <div className="rounded-full" style={{
                  width: `clamp(4px, 1.2vw, 5px)`,
                  height: `clamp(4px, 1.2vw, 5px)`,
                  background: '#f4a52a'
                }} />
                <span className="operation-feature-text">
                  Proceso simplificado de 2 fases
                </span>
              </div>
              <div className="operation-feature operation-feature--mobile-optional">
                <div className="rounded-full" style={{
                  width: `clamp(4px, 1.2vw, 5px)`,
                  height: `clamp(4px, 1.2vw, 5px)`,
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
            <div className="mb-4 flex items-start justify-between">
              <Moon 
                style={{
                  width: `clamp(42px, 9.5vw, 56px)`,
                  height: `clamp(42px, 9.5vw, 56px)`,
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
            <h3 className="mb-2.5 font-bold operation-title">
              {cashCut.title}
            </h3>
            <p className="mb-4 operation-description">
              {cashCut.description}
            </p>

            {/* Características */}
            <div className="mb-4 flex flex-col gap-1.5">
              <div className="operation-feature">
                <div className="rounded-full" style={{
                  width: `clamp(4px, 1.2vw, 5px)`,
                  height: `clamp(4px, 1.2vw, 5px)`,
                  background: '#0a84ff'
                }} />
                <span className="operation-feature-text">
                  Comparación con venta esperada SICAR
                </span>
              </div>
              <div className="operation-feature">
                <div className="rounded-full" style={{
                  width: `clamp(4px, 1.2vw, 5px)`,
                  height: `clamp(4px, 1.2vw, 5px)`,
                  background: '#0a84ff'
                }} />
                <span className="operation-feature-text">
                  Proceso completo de 3 fases
                </span>
              </div>
              <div className="operation-feature operation-feature--mobile-optional">
                <div className="rounded-full" style={{
                  width: `clamp(4px, 1.2vw, 5px)`,
                  height: `clamp(4px, 1.2vw, 5px)`,
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
            <div className="mb-4 flex items-start justify-between">
              <Package 
                style={{
                  width: `clamp(42px, 9.5vw, 56px)`,
                  height: `clamp(42px, 9.5vw, 56px)`,
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
            <h3 className="mb-2.5 font-bold operation-title">
              {deliveryView.title}
            </h3>
            <p className="mb-4 operation-description">
              {deliveryView.description}
            </p>

            {/* Características */}
            <div className="mb-4 flex flex-col gap-1.5">
              <div className="operation-feature">
                <div className="rounded-full" style={{
                  width: `clamp(4px, 1.2vw, 5px)`,
                  height: `clamp(4px, 1.2vw, 5px)`,
                  background: '#10b981'
                }} />
                <span className="operation-feature-text">
                  Vista completa de envíos activos
                </span>
              </div>
              <div className="operation-feature">
                <div className="rounded-full" style={{
                  width: `clamp(4px, 1.2vw, 5px)`,
                  height: `clamp(4px, 1.2vw, 5px)`,
                  background: '#10b981'
                }} />
                <span className="operation-feature-text">
                  Actualizar estados (pagado/cancelado)
                </span>
              </div>
              <div className="operation-feature operation-feature--mobile-optional">
                <div className="rounded-full" style={{
                  width: `clamp(4px, 1.2vw, 5px)`,
                  height: `clamp(4px, 1.2vw, 5px)`,
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
            <div className="mb-4 flex items-start justify-between">
              <BarChart3
                style={{
                  width: `clamp(42px, 9.5vw, 56px)`,
                  height: `clamp(42px, 9.5vw, 56px)`,
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
            <h3 className="mb-2.5 font-bold operation-title">
              Dashboard Supervisor
            </h3>
            <p className="mb-4 operation-description">
              Consulta cortes del día, historial y desempeño de cajeros
            </p>

            {/* Características */}
            <div className="mb-4 flex flex-col gap-1.5">
              <div className="operation-feature">
                <div className="rounded-full" style={{
                  width: `clamp(4px, 1.2vw, 5px)`,
                  height: `clamp(4px, 1.2vw, 5px)`,
                  background: '#8b5cf6'
                }} />
                <span className="operation-feature-text">
                  Cortes del día con semáforo de estado
                </span>
              </div>
              <div className="operation-feature">
                <div className="rounded-full" style={{
                  width: `clamp(4px, 1.2vw, 5px)`,
                  height: `clamp(4px, 1.2vw, 5px)`,
                  background: '#8b5cf6'
                }} />
                <span className="operation-feature-text">
                  Historial con filtros por fecha y sucursal
                </span>
              </div>
              <div className="operation-feature operation-feature--mobile-optional">
                <div className="rounded-full" style={{
                  width: `clamp(4px, 1.2vw, 5px)`,
                  height: `clamp(4px, 1.2vw, 5px)`,
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

      </div>
    </div>
  );
}
