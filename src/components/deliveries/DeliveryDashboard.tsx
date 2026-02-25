import { motion } from 'framer-motion';
import { DollarSign, Package, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
import { useDeliveries } from '../../hooks/useDeliveries';
import { useDeliverySummary } from '../../hooks/useDeliverySummary';
import { COURIER_DISPLAY_NAMES, ALERT_DISPLAY_CONFIG } from '../../data/deliveryConfig';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';

const dashboardCardClass =
  'border-[rgba(255,255,255,0.14)] bg-[rgba(24,26,32,0.78)] backdrop-blur-md shadow-[0_8px_24px_rgba(0,0,0,0.2)]';

function resolveGlobalRisk(byAlert: { warning: number; urgent: number; critical: number }) {
  if (byAlert.critical > 0) {
    return {
      label: 'Riesgo Crítico',
      tone: 'border-red-500/40 bg-red-500/10 text-red-300',
    };
  }

  if (byAlert.urgent > 0) {
    return {
      label: 'Riesgo Alto',
      tone: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
    };
  }

  if (byAlert.warning > 0) {
    return {
      label: 'Riesgo Medio',
      tone: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
    };
  }

  return {
    label: 'Sin Riesgo',
    tone: 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300',
  };
}

interface DeliveryDashboardProps {
  onGoToManagement?: () => void;
}

export function DeliveryDashboard({ onGoToManagement }: DeliveryDashboardProps = {}) {
  const { pending, history } = useDeliveries();
  const allDeliveries = [...pending, ...history];
  const summary = useDeliverySummary(allDeliveries);

  const globalRisk = resolveGlobalRisk({
    warning: summary.byAlert.warning,
    urgent: summary.byAlert.urgent,
    critical: summary.byAlert.critical,
  });

  const couriersWithData = Object.entries(summary.byCourier).filter(([, data]) => data.count > 0);
  const alertsWithData = Object.entries(summary.byAlert).filter(([, count]) => count > 0);

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#e1e8ed]">Dashboard Deliveries</h2>
          <p className="mt-1 text-sm text-[#8899a6] md:text-base">
            Métricas acumuladas de envíos contra entrega
          </p>
        </div>

        <div
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.06em] ${globalRisk.tone}`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          {globalRisk.label}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0 }}
        >
          <Card className={`border-[rgba(10,132,255,0.28)] bg-gradient-to-br from-[#0a84ff]/18 to-[#5e5ce6]/16 ${dashboardCardClass}`}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-[#d7e9ff] md:text-base">
                <DollarSign className="h-4 w-4 text-[#0a84ff]" />
                Total Pendiente
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-4xl font-bold leading-none text-[#0a84ff]">
                ${summary.totalPending.toFixed(2)}
              </div>
              <p className="mt-3 text-sm text-[#9bb7d6]">
                {summary.countPending} {summary.countPending === 1 ? 'envío' : 'envíos'} activos
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.06 }}
        >
          <Card className={dashboardCardClass}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-[#e1e8ed] md:text-base">
                <Package className="h-4 w-4 text-[#5e5ce6]" />
                Deliveries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-4xl font-bold leading-none text-[#e1e8ed]">{summary.countPending}</div>
              <p className="mt-3 text-sm text-[#8899a6]">Pendientes de cobro</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.12 }}
        >
          <Card className={dashboardCardClass}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-[#e1e8ed] md:text-base">
                <Clock className="h-4 w-4 text-[#ff9500]" />
                Más Antiguo
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-4xl font-bold leading-none text-[#e1e8ed]">
                {summary.oldestPendingDays}
              </div>
              <p className="mt-3 text-sm text-[#8899a6]">
                {summary.oldestPendingDays === 1 ? 'día' : 'días'} pendiente
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.18 }}
        >
          <Card className={dashboardCardClass}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-[#e1e8ed] md:text-base">
                <TrendingUp className="h-4 w-4 text-[#34c759]" />
                Promedio
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-4xl font-bold leading-none text-[#e1e8ed]">
                {summary.averagePendingDays.toFixed(1)}
              </div>
              <p className="mt-3 text-sm text-[#8899a6]">días promedio</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {summary.countPending > 0 && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.24 }}
          >
            <Card className={dashboardCardClass}>
              <CardHeader className="p-4 pb-3">
                <CardTitle className="text-lg font-semibold text-[#e1e8ed]">Por Courier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0">
                {(couriersWithData.length > 0 ? couriersWithData : Object.entries(summary.byCourier)).map(
                  ([courier, data]) => (
                    <div
                      key={courier}
                      className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-3 py-2.5"
                    >
                      <div>
                        <p className="text-base font-medium text-[#e1e8ed]">
                          {COURIER_DISPLAY_NAMES[courier as keyof typeof COURIER_DISPLAY_NAMES]}
                        </p>
                        <p className="text-sm text-[#8899a6]">
                          {data.count} {data.count === 1 ? 'envío' : 'envíos'}
                        </p>
                      </div>
                      <p className="text-xl font-bold text-[#0a84ff]">${data.total.toFixed(2)}</p>
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.3 }}
          >
            <Card className={dashboardCardClass}>
              <CardHeader className="p-4 pb-3">
                <CardTitle className="flex items-center gap-2 text-lg font-semibold text-[#e1e8ed]">
                  <AlertTriangle className="h-5 w-5" />
                  Por Nivel de Alerta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 p-4 pt-0">
                {(alertsWithData.length > 0 ? alertsWithData : Object.entries(summary.byAlert)).map(
                  ([level, count]) => {
                    const config = ALERT_DISPLAY_CONFIG[level as keyof typeof ALERT_DISPLAY_CONFIG];

                    return (
                      <div
                        key={level}
                        className="flex items-center justify-between rounded-lg border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.03)] px-3 py-2.5"
                      >
                        <div>
                          <p className="text-base font-medium text-[#e1e8ed]">{config.label}</p>
                          <p className="text-sm text-[#8899a6]">{config.action}</p>
                        </div>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-sm font-semibold ${config.color}`}
                        >
                          {count}
                        </span>
                      </div>
                    );
                  }
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {summary.countPending === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: 0.32 }}
        >
          <Card className={dashboardCardClass}>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Package className="h-12 w-12 text-[#8899a6] opacity-60" />
              <p className="text-base font-medium text-[#c9d4df]">No hay deliveries pendientes</p>
              <p className="max-w-md text-sm text-[#8899a6]">
                Todos los envíos han sido cobrados o cancelados. Use la pestaña Gestión para registrar
                nuevos casos cuando sea necesario.
              </p>
              {onGoToManagement && (
                <ConstructiveActionButton
                  type="button"
                  onClick={onGoToManagement}
                  className="mt-2 w-full max-w-xs gap-2"
                >
                  Ir a Gestión
                </ConstructiveActionButton>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
