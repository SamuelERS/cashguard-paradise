// 🤖 [IA] - ORDEN #075: Step 5 - Venta Esperada (SICAR)
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { motion } from 'framer-motion';
import { DollarSign, ArrowRight, CheckCircle, Cloud } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ConstructiveActionButton } from '@/components/shared/ConstructiveActionButton';
import { DestructiveActionButton } from '@/components/shared/DestructiveActionButton';
import { cn } from '@/lib/utils';
import type { Step5Props } from '@/types/initialWizard';

export function Step5SicarInput({
  wizardData,
  updateWizardData,
  validateInput,
  getPattern,
  getInputMode,
  handleNext,
  canGoNext,
  currentStep,
  totalSteps,
  availableStores,
  availableEmployees,
  hasActiveSession,
  onResumeSession,
  onAbortSession,
  activeSessionInfo,
  activeSessionSucursalId,
}: Step5Props) {
  const [showAbortConfirm, setShowAbortConfirm] = useState(false);
  const hasActiveSessionForSelectedStore =
    hasActiveSession === true &&
    Boolean(wizardData.selectedStore) &&
    wizardData.selectedStore === activeSessionSucursalId;

  return (
    <div className="glass-morphism-panel space-y-fluid-lg">

      {/* [IA] - CASO-SANN-R2: Panel de sesión activa — bloqueo anti-fraude en Step 5 */}
      {hasActiveSessionForSelectedStore && currentStep === 5 && (
        <div
          className="rounded-lg p-4 border border-amber-500/40"
          style={{ background: 'rgba(245, 158, 11, 0.08)' }}
        >
          <h4 className="font-semibold text-amber-400 text-fluid-sm mb-2 flex items-center gap-2">
            <Cloud className="w-4 h-4 text-green-400" aria-hidden="true" />
            Sesión en Progreso
          </h4>
          <p className="text-muted-foreground text-fluid-xs mb-4">
            Hay un corte de caja que no se completó en esta sucursal. Elige cómo continuar.
          </p>
          {/* [IA] - R3-B2: Identificador de sesión activa */}
          {activeSessionInfo && (
            <div className="text-fluid-xs text-muted-foreground space-y-1 mb-3">
              {activeSessionInfo.correlativo && (
                <p>{activeSessionInfo.correlativo}</p>
              )}
              {activeSessionInfo.createdAt && (
                <p>Iniciado: {new Date(activeSessionInfo.createdAt).toLocaleString('es-SV')}</p>
              )}
              {activeSessionInfo.cajero && (
                <p>Cajero: {activeSessionInfo.cajero}</p>
              )}
            </div>
          )}
          <div className="flex gap-3">
            <ConstructiveActionButton
              onClick={onResumeSession}
              aria-label="Reanudar Sesión"
              className="flex-1"
            >
              Reanudar Sesión
            </ConstructiveActionButton>
            <DestructiveActionButton
              onClick={() => setShowAbortConfirm(true)}
              aria-label="Abortar Sesión"
              className="flex-1"
            >
              Abortar Sesión
            </DestructiveActionButton>
          </div>
          <ConfirmationModal
            open={showAbortConfirm}
            onOpenChange={setShowAbortConfirm}
            title="¿Abortar Sesión Activa?"
            description="Se marcará como ABORTADO en el sistema. Esta acción no se puede deshacer."
            warningText="Los datos del corte anterior se perderán permanentemente."
            confirmText="Sí, Abortar"
            cancelText="Cancelar"
            onConfirm={() => {
              setShowAbortConfirm(false);
              void (async () => {
                try {
                  await onAbortSession?.();
                  toast.success('Sesión abortada correctamente');
                } catch {
                  toast.error('No se pudo abortar la sesión. Intente de nuevo.');
                }
              })();
            }}
            onCancel={() => setShowAbortConfirm(false)}
          />
        </div>
      )}
      <div className="glass-morphism-panel header-section">
        <DollarSign className="flex-shrink-0 w-[clamp(1.25rem,5vw,1.5rem)] h-[clamp(1.25rem,5vw,1.5rem)] bg-gradient-to-br from-green-400 to-emerald-400 bg-clip-text text-transparent" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-primary-foreground text-fluid-xl">Ingresa Total Vendido</h3>
          <p className="text-muted-foreground text-fluid-xs mt-fluid-xs">Según SICAR</p>
        </div>
      </div>

      <div className="flex flex-col gap-fluid-lg">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-fluid-md items-center">
          <div className="glass-morphism-panel relative flex-1 pl-2 flex items-center">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-bold text-green-400 text-base md:text-lg">
              $
            </span>
            <Input
              id="expected-sales"
              type="text"
              inputMode={getInputMode('currency')}
              pattern={getPattern('currency')}
              step="0.01"
              min="0"
              value={wizardData.expectedSales}
              onChange={(e) => {
                const validation = validateInput(e.target.value, 'currency');
                if (validation.isValid) {
                  updateWizardData({ expectedSales: validation.cleanValue });
                }
              }}
              placeholder="0.00"
              aria-label="Ingrese el monto de la venta esperada"
              disabled={hasActiveSessionForSelectedStore}
              className={cn(
                'font-semibold bg-transparent border-none text-primary-foreground pl-[clamp(3rem,12vw,3.5rem)] h-[clamp(2.25rem,9vw,2.75rem)] text-fluid-lg neon-glow-success',
                wizardData.expectedSales && parseFloat(wizardData.expectedSales) > 0 && 'border-green-500/50'
              )}
              data-valid={!!(wizardData.expectedSales && parseFloat(wizardData.expectedSales) > 0)}
              autoComplete="off"
            />
          </div>
          {currentStep < totalSteps && (
            <ConstructiveActionButton
              onClick={handleNext}
              disabled={!canGoNext || hasActiveSessionForSelectedStore}
              aria-label="Continuar al siguiente paso"
              type="button"
              className="h-[clamp(2.25rem,9vw,2.75rem)]"
            >
              <span className="text-fluid-base">Continuar</span>
              <ArrowRight aria-hidden="true" className="w-[clamp(1.25rem,5vw,1.5rem)] h-[clamp(1.25rem,5vw,1.5rem)] ml-fluid-sm" />
            </ConstructiveActionButton>
          )}
        </div>
        {wizardData.expectedSales && parseFloat(wizardData.expectedSales) <= 0 && (
          <p className="text-xs text-red-500">
            El monto debe ser mayor a $0.00
          </p>
        )}
      </div>

      {wizardData.expectedSales && parseFloat(wizardData.expectedSales) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism-panel border border-green-400/40 shadow-lg shadow-green-400/20"
        >
          <div className="flex items-center gap-fluid-md">
            <CheckCircle className="flex-shrink-0 text-green-400 w-[clamp(1.25rem,5vw,1.5rem)] h-[clamp(1.25rem,5vw,1.5rem)]" />
            <span className="font-medium text-primary-foreground text-fluid-sm">
              Venta esperada: ${parseFloat(wizardData.expectedSales).toFixed(2)}
            </span>
          </div>
        </motion.div>
      )}

      <div className="glass-morphism-panel border-l-4 border-l-blue-500 shadow-lg shadow-blue-500/20">
        <h4 className="font-semibold text-blue-500 text-fluid-sm mb-fluid-sm">Resumen de Información:</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-fluid-sm text-fluid-xs">
          <div className="flex flex-col gap-fluid-xs">
            <span className="min-w-0 text-muted-foreground">Sucursal:</span>
            <span className="font-medium text-left truncate text-primary-foreground">
              {availableStores.find(s => s.id === wizardData.selectedStore)?.name}
            </span>
          </div>
          <div className="flex flex-col gap-fluid-xs">
            <span className="min-w-0 text-muted-foreground">Cajero:</span>
            <span className="font-medium text-left truncate text-primary-foreground">
              {availableEmployees.find(e => e.id === wizardData.selectedCashier)?.name}
            </span>
          </div>
          <div className="flex flex-col gap-fluid-xs">
            <span className="min-w-0 text-muted-foreground">Testigo:</span>
            <span className="font-medium text-left truncate text-primary-foreground">
              {availableEmployees.find(e => e.id === wizardData.selectedWitness)?.name}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
