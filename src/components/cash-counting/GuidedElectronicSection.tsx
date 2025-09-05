import { motion } from "framer-motion";
import { CreditCard, Building, ArrowLeftRight, Wallet } from "lucide-react";
import { ElectronicPayments, CashCount } from "@/types/cash";
import { calculateCashTotal } from "@/utils/calculations";
import { Button } from "@/components/ui/button";

interface GuidedElectronicSectionProps {
  electronicPayments: ElectronicPayments;
  cashCount: CashCount;
  isFieldActive: (fieldName: string) => boolean;
  isFieldCompleted: (fieldName: string) => boolean;
  isFieldAccessible: (fieldName: string) => boolean;
  onFieldConfirm: (value: string) => void;
  onAttemptAccess: () => void;
}

export const GuidedElectronicSection = ({
  electronicPayments,
  cashCount,
  isFieldActive,
  isFieldCompleted,
  isFieldAccessible,
  onFieldConfirm,
  onAttemptAccess
}: GuidedElectronicSectionProps) => {
  const totalCash = calculateCashTotal(cashCount);
  const totalElectronic = Object.values(electronicPayments).reduce((sum, val) => sum + val, 0);

  const isTotalCashActive = isFieldActive('totalCash');
  const isTotalElectronicActive = isFieldActive('totalElectronic');
  const isTotalCashCompleted = isFieldCompleted('totalCash');
  const isTotalElectronicCompleted = isFieldCompleted('totalElectronic');

  const handleTotalCashConfirm = () => {
    if (isTotalCashActive) {
      onFieldConfirm(totalCash.toString());
    }
  };

  const handleTotalElectronicConfirm = () => {
    if (isTotalElectronicActive) {
      onFieldConfirm(totalElectronic.toString());
    }
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-primary via-accent-primary/80 to-accent-secondary flex items-center justify-center shadow-lg">
          <CreditCard className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-accent-primary">Resumen de Totales</h3>
          <p className="text-sm text-text-secondary">Confirme los totales calculados</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Total Cash Summary */}
        <motion.div
          className={`
            p-4 rounded-lg border-2 transition-all duration-300
            ${isTotalCashActive ? 'border-accent-primary bg-glass-bg shadow-lg shadow-accent-glow' : ''}
            ${isTotalCashCompleted ? 'border-success bg-success/10' : ''}
            ${!isFieldAccessible('totalCash') ? 'border-bg-tertiary bg-bg-secondary/50 opacity-60' : ''}
          `}
          onClick={() => !isFieldAccessible('totalCash') && onAttemptAccess()}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-8 h-8 text-warning" />
              <div>
                <h4 className="font-semibold text-lg">Total Efectivo</h4>
                <p className="text-sm text-text-secondary">Suma de monedas y billetes</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-warning">
                ${totalCash.toFixed(2)}
              </div>
              {isTotalCashActive && (
                <Button
                  onClick={handleTotalCashConfirm}
                  className="mt-2"
                  variant="default"
                  size="sm"
                >
                  ✓ Confirmar
                </Button>
              )}
              {isTotalCashCompleted && (
                <div className="text-sm text-success">✓ Confirmado</div>
              )}
              {!isFieldAccessible('totalCash') && (
                <div className="text-xs text-text-muted">Bloqueado</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Electronic Payments Summary */}
        <motion.div
          className={`
            p-4 rounded-lg border-2 transition-all duration-300
            ${isTotalElectronicActive ? 'border-accent-primary bg-glass-bg shadow-lg shadow-accent-glow' : ''}
            ${isTotalElectronicCompleted ? 'border-success bg-success/10' : ''}
            ${!isFieldAccessible('totalElectronic') ? 'border-bg-tertiary bg-bg-secondary/50 opacity-60' : ''}
          `}
          onClick={() => !isFieldAccessible('totalElectronic') && onAttemptAccess()}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard className="w-8 h-8 text-accent-primary" />
              <div>
                <h4 className="font-semibold text-lg">Total Electrónico</h4>
                <p className="text-sm text-text-secondary">Suma de pagos digitales</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-accent-primary">
                ${totalElectronic.toFixed(2)}
              </div>
              {isTotalElectronicActive && (
                <Button
                  onClick={handleTotalElectronicConfirm}
                  className="mt-2"
                  variant="default"
                  size="sm"
                >
                  ✓ Confirmar
                </Button>
              )}
              {isTotalElectronicCompleted && (
                <div className="text-sm text-success">✓ Confirmado</div>
              )}
              {!isFieldAccessible('totalElectronic') && (
                <div className="text-xs text-text-muted">Bloqueado</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Electronic Payment Details */}
        <div className="mt-6 p-4 bg-glass-bg rounded-lg border border-glass-border">
          <h4 className="font-semibold mb-3 text-text-primary">Detalle de Pagos Electrónicos:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-400" />
              <span>Credomatic: ${electronicPayments.credomatic.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-green-500" />
              <span>Promerica: ${electronicPayments.promerica.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowLeftRight className="w-4 h-4 text-accent-light" />
              <span>Transferencia: ${electronicPayments.bankTransfer.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-indigo-400" />
              <span>PayPal: ${electronicPayments.paypal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};